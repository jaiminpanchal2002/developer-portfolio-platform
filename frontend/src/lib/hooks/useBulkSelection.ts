import { useCallback, useMemo, useState } from "react";

/** Generic row-selection state for admin tables. Selection is keyed by id so it
 *  survives re-sorting/re-fetching as long as ids are stable. */
export function useBulkSelection<T extends { id: number | string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  const isSelected = useCallback((id: number | string) => selectedIds.has(id), [selectedIds]);

  const toggle = useCallback((id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (items.length > 0 && items.every((item) => prev.has(item.id))) {
        return new Set();
      }
      return new Set(items.map((item) => item.id));
    });
  }, [items]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const selectedIdsArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds,
    selectedIdsArray,
    isSelected,
    toggle,
    toggleAll,
    allSelected,
    someSelected,
    clear,
    count: selectedIds.size,
  };
}
