<script lang="ts">
  import { useInterval } from 'runed'

  let { countdown = $bindable(90) }: { countdown: number } = $props()

  const interval = useInterval(() => 1000, {
    callback: () => {
      countdown -= 1;
    }
  });
</script>

<span class="countdown font-mono text-6xl">
  <span style="--value:{countdown}; --digits: {countdown.toString().length};" aria-live="polite" aria-label={countdown.toString()}>{interval.counter}</span>
</span>