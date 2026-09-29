/**
 * A listing's extra filter categories (web: useMoreFiltersPanel), shown as
 * sections of the Filters sheet (filters-sheet.tsx).
 */
export type MoreFilterOption = { id: string; label: string; description?: string };
export type MoreFilterCategory = {
  id: string;
  label: string;
  options: MoreFilterOption[];
  /** list: dense rows · card: bordered rows with description · badge: toggle chips. Default card. */
  display?: 'list' | 'card' | 'badge';
  /** Default multi. */
  selectionMode?: 'single' | 'multi';
  /** Default true. */
  searchable?: boolean;
};
export type MoreFilterSelection = Record<string, string[]>;

export function countSelection(selection: MoreFilterSelection) {
  return Object.values(selection).reduce((sum, ids) => sum + ids.length, 0);
}
