<script lang="ts">
  import {
    createTable,
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type TableOptions,
    type SortingState
  } from '@tanstack/table-core';

  let { data, columns }: { data: any[]; columns: ColumnDef<any, any>[] } = $props();

  let sorting = $state<SortingState>([]);
  let columnPinning = $state({});
  let columnVisibility = $state({});

  const options = $derived<TableOptions<any>>({
    data,
    columns,
    state: {
      get sorting() { return sorting; },
      get columnPinning() { return columnPinning; },
      get columnVisibility() { return columnVisibility; }
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') sorting = updater(sorting);
      else sorting = updater;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    renderFallbackValue: null
  });

  const table = createTable(options);

  function getCellResult(cell: any) {
    return cell.column.columnDef.cell(cell.getContext());
  }
</script>

<div class="overflow-x-auto rounded-xl border border-base-content/10 bg-base-100 shadow-sm">
    <table class="table table-zebra w-full text-left">
        <thead class="bg-base-200/50">
        {#each table.getHeaderGroups() as headerGroup}
            <tr>
                {#each headerGroup.headers as header}
                    <th class="p-4 uppercase text-xl font-bold tracking-wider text-base-content/60">
                        {#if !header.isPlaceholder}
                            <button
                                    class="flex items-center gap-2 hover:text-primary transition-colors"
                                    onclick={header.column.getToggleSortingHandler()}
                            >
                                {header.column.columnDef.header}
                                {#if header.column.getIsSorted() === 'asc'}
                                    <span class="text-primary text-md">▲</span>
                                {:else if header.column.getIsSorted() === 'desc'}
                                    <span class="text-primary text-md">▼</span>
                                {/if}
                            </button>
                        {/if}
                    </th>
                {/each}
            </tr>
        {/each}
        </thead>

        <tbody>
        {#each table.getRowModel().rows as row}
            <tr class="hover:bg-base-200/30 transition-colors border-b border-base-content/5 last:border-0">
                {#each row.getVisibleCells() as cell}
                    <td class="p-4 text-xl">
                        {#if typeof getCellResult(cell) === 'object' && getCellResult(cell) !== null && getCellResult(cell).component}
                            <svelte:component
                                    this={getCellResult(cell).component}
                                    {...getCellResult(cell).props}
                            />
                        {:else}
                            {getCellResult(cell)}
                        {/if}
                    </td>
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>