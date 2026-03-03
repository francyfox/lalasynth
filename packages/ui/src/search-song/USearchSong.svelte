<script lang="ts">
  import UInput from '../input/UInput.svelte'
  import { Debounced } from "runed";
  interface Props {
    search: string
    onUrlChange: (url: string) => void
  }

  const { search, onUrlChange }: Props = $props()
  const debounced = new Debounced(() => onUrlChange(search), 500);
</script>

<div class="flex flex-col items-center gap-2">
    <a href="https://music.youtube.com"
       target="_blank"
       class="btn btn-secondary text-2xl"
    >
        Go to YouTube.Music
    </a>

    <UInput
        value={search}
        placeholder="Paste your YoutubeMusic track"
        label="Search"
    />
</div>