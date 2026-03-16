<!-- routify:meta _auth=true -->
<script lang="ts">
import AppLobbyLayout from '@/components/layout/AppLobbyLayout.svelte'
import type { UIType } from '@/components/layout/game.layout.types'
import AppTraffic from '@/components/traffic/AppTraffic.svelte'
import { gameStore } from '@/lib/stores/game.svelte'
import { songStore } from '@/lib/stores/songs.svelte'
import { UUserLeadership } from '@package/ui/index.js'
import UTextScroller from '@package/ui/text-scroller/UTextScroller.svelte'
import { UserLeadershipMock } from '@package/ui/user-leadership/user-leadership.mock'
import { goto } from "@roxi/routify";
import { onDestroy, onMount } from 'svelte'
const _init = $goto;

let currentMode: UIType = $state("game")
let isPlaying: boolean = $state(false)
const selectedSong = gameStore.selectedSong
const users = UserLeadershipMock;

if (!selectedSong) $goto('/lobby')

onMount(() => {
	if (!selectedSong) return;
	if (selectedSong.type === 'local') {
		songStore.load(selectedSong.song.filename, {
			audioProvider: 'local-audio',
			lyricProvider: 'local-lyric',
		});
	} else {
		songStore.load(selectedSong.song.videoId);
	}
});

onDestroy(() => {
	songStore.pause();
});

async function handleStartGame() {
	setTimeout(async () => {
		await songStore.play();
		isPlaying = true;
	}, 1000)
}
</script>

<AppLobbyLayout {currentMode} >
    <div class="relative my-auto flex flex-col gap-5">
        {#if !isPlaying}
            <AppTraffic
                    onGo={handleStartGame}
                    className="z-20 top-[-140px] left-[calc(50%-70px)] size-[140px]"
            />
        {/if}
        <UTextScroller
                song={songStore.lyrics[0]}
                {isPlaying}
        />
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