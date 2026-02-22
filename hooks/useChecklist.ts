import { useChecklistStore } from '../store/checklist';

export function useChecklist() {
  const { items, toggleItem, resetDaily } = useChecklistStore();

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    items,
    toggleItem,
    resetDaily,
    completedCount,
    totalCount,
    completionPercent,
    isComplete: completedCount === totalCount,
  };
}
