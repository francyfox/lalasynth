<!-- routify:meta _auth=true -->
<script lang="ts">
import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
import type { UIType } from '@/components/layout/game.layout.types'
import AppTraffic from '@/components/traffic/AppTraffic.svelte'
import { audioManager } from '@/lib/audio/audio-manager.svelte'
import { gameStore } from '@/lib/stores/game.svelte'
import { settingsStore } from '@/lib/stores/settings.svelte'
import { UUserLeadership } from '@package/ui/index.js'
import UTextScroller from '@package/ui/text-scroller/UTextScroller.svelte'
import { parseSyncedLyrics } from '@package/ui/lyric-sync/lyric-sync.service'
import type { LyricLine } from '@package/ui/lyric-sync/lyric-sync.types'
import { UserLeadershipMock } from '@package/ui/user-leadership/user-leadership.mock'
import UGameBanner from '@package/ui/game-banner/UGameBanner.svelte'
import { GAME_BANNER_MESSAGE, type GameBannerMessage } from '@package/ui/game-banner/game-banner.types'
import { goto } from "@roxi/routify";
import { fade } from 'svelte/transition'
import { onDestroy, onMount } from 'svelte'
const _init = $goto;

let currentMode: UIType = $state("game")
let isPlaying: boolean = $state(false)
let gameBannerMessage = $state<GameBannerMessage | null>(null)
let wasPaused = $state(false)
let noiseLvl = $state(0)

function handleNoise(level: number) {
	if (!settingsStore.noise) return
	noiseLvl = level
	audioManager.setNoiseLevel(level)
}

function handlePause() {
	wasPaused = true
	audioManager.pauseSong()
}

function handleGameFinish() {
	gameBannerMessage = wasPaused ? GAME_BANNER_MESSAGE.FAIL : GAME_BANNER_MESSAGE.VICTORY
}

function handleBannerFinish() {
	$goto('/achievements')
}
const selectedSong = gameStore.selectedSong

const lines: LyricLine[] = $derived(
	parseSyncedLyrics(
		audioManager.lyrics[0]?.syncedLyrics ?? '',
		audioManager.songData?.duration ?? 0
	)
)
const users = UserLeadershipMock;

if (!selectedSong) $goto('/lobby')

onMount(() => {
	if (!selectedSong) return;
	if (selectedSong.type === 'local') {
		audioManager.loadSong(selectedSong.song.filename, {
			audioProvider: 'local-audio',
			lyricProvider: 'local-lyric',
		});
	} else {
		audioManager.loadSong(selectedSong.song.videoId);
	}
});

onDestroy(() => {
	audioManager.stopSong();
});

function waitForReady(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (audioManager.songStatus === "ready") { resolve(); return; }
		if (audioManager.songStatus === "error") { reject(new Error("Song failed to load")); return; }

		const stop = $effect.root(() => {
			$effect(() => {
				const s = audioManager.songStatus;
				if (s === "ready") { stop(); resolve(); }
				else if (s === "error") { stop(); reject(new Error("Song failed to load")); }
			});
		});
	});
}

async function handleStartGame() {
	try {
		await Promise.all([
			new Promise(r => setTimeout(r, 1000)),
			waitForReady(),
		]);
		await audioManager.startSong();
		isPlaying = true;
	} catch {
		// song failed to load — stay on screen, status reflects error
	}
}
</script>

<AppLobbyLayout {currentMode} noiseLevel={noiseLvl}>
    <div class="relative my-auto flex flex-col gap-5">
        {#if !isPlaying}
            <AppTraffic
                    onGo={handleStartGame}
                    className="z-20 top-[-140px] left-[calc(50%-70px)] size-[140px]"
            />
        {/if}
        {#if !gameBannerMessage}
            <div out:fade={{ duration: 600 }}>
                <UTextScroller
                        {lines}
                        currentTime={audioManager.songCurrentTime}
                        onPause={handlePause}
                        onResume={audioManager.resumeSong}
                        {isPlaying}
                        onfinish={handleGameFinish}
                        onnoise={handleNoise}
                />
            </div>
        {/if}
    </div>

    <div class="flex gap-5 justify-between">
        <UUserLeadership
                {users}
                currentUserShortId={1}
                className=""
        />

        <UUserLeadership
                {users}
                currentUserShortId={1}
                className=""
        />
    </div>
</AppLobbyLayout>

{#if gameBannerMessage}
    <div in:fade={{ duration: 300 }}>
        <UGameBanner type={gameBannerMessage} onfinish={handleBannerFinish} />
    </div>
{/if}