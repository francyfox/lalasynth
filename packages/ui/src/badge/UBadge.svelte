<script>
  let { value } = $props();
</script>
<span class="badge text-xl {value > 8 ? 'badge-primary' : 'badge-ghost'}">{value}</span>