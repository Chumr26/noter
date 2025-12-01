import { NoteColorKey } from '@/constants/theme';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColorKey;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type SortOption = 'date' | 'title' | 'color' | 'custom';
export type ViewMode = 'grid' | 'list';
export type FilterType = 'all' | 'pinned' | 'favorites';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppSettings {
  viewMode: ViewMode;
  sortOption: SortOption;
  defaultNoteColor: NoteColorKey;
  hapticsEnabled: boolean;
  theme: ThemeMode;
}
