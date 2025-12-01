import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note, SortOption, FilterType, AppSettings } from '@/types';

interface NotesState {
  // State
  notes: Note[];
  tags: string[];
  searchQuery: string;
  activeFilter: FilterType;
  settings: AppSettings;
  isLoading: boolean;
  
  // Selection State
  selectionMode: boolean;
  selectedNoteIds: string[];
  
  // Actions - Selection
  toggleSelectionMode: () => void;
  toggleNoteSelection: (id: string) => void;
  selectAllNotes: () => void;
  clearSelection: () => void;
  deleteSelectedNotes: () => void;
  pinSelectedNotes: () => void;
  unpinSelectedNotes: () => void;
  favoriteSelectedNotes: () => void;
  unfavoriteSelectedNotes: () => void;
  changeSelectedNotesColor: (color: string) => void;
  
  // Actions - Notes CRUD
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  // Actions - Note Properties
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Actions - Tags
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addTagToNote: (noteId: string, tag: string) => void;
  removeTagFromNote: (noteId: string, tag: string) => void;
  
  // Actions - Search & Filter
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Actions - Data Management
  loadNotes: () => Promise<void>;
  clearAllNotes: () => void;
  
  // Computed
  getFilteredNotes: () => Note[];
  getNotesByTag: (tag: string) => Note[];
}

const STORAGE_KEY = '@notes_app_data';
const SETTINGS_KEY = '@notes_app_settings';

const defaultSettings: AppSettings = {
  viewMode: 'grid',
  sortOption: 'date',
  defaultNoteColor: 'default',
  hapticsEnabled: true,
};

export const useNotesStore = create<NotesState>((set, get) => ({
  // Initial State
  notes: [],
  tags: [],
  searchQuery: '',
  activeFilter: 'all',
  settings: defaultSettings,
  isLoading: false,
  
  // Selection State
  selectionMode: false,
  selectedNoteIds: [],
  
  // Selection Actions
  toggleSelectionMode: () => {
    set((state) => ({
      selectionMode: !state.selectionMode,
      selectedNoteIds: state.selectionMode ? [] : state.selectedNoteIds,
    }));
  },
  
  toggleNoteSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedNoteIds.includes(id);
      return {
        selectedNoteIds: isSelected
          ? state.selectedNoteIds.filter((noteId) => noteId !== id)
          : [...state.selectedNoteIds, id],
      };
    });
  },
  
  selectAllNotes: () => {
    set((state) => ({
      selectedNoteIds: state.notes.map((note) => note.id),
    }));
  },
  
  clearSelection: () => {
    set({ selectedNoteIds: [], selectionMode: false });
  },
  
  deleteSelectedNotes: () => {
    set((state) => {
      const notes = state.notes.filter(
        (note) => !state.selectedNoteIds.includes(note.id)
      );
      saveToStorage(notes);
      
      // Clean up unused tags
      const allTags = new Set(notes.flatMap((note) => note.tags));
      const tags = Array.from(allTags);
      
      return { notes, tags, selectedNoteIds: [], selectionMode: false };
    });
  },
  
  pinSelectedNotes: () => {
    set((state) => {
      const notes = state.notes.map((note) =>
        state.selectedNoteIds.includes(note.id)
          ? { ...note, isPinned: true, updatedAt: Date.now() }
          : note
      );
      saveToStorage(notes);
      return { notes, selectedNoteIds: [], selectionMode: false };
    });
  },
  
  unpinSelectedNotes: () => {
    set((state) => {
      const notes = state.notes.map((note) =>
        state.selectedNoteIds.includes(note.id)
          ? { ...note, isPinned: false, updatedAt: Date.now() }
          : note
      );
      saveToStorage(notes);
      return { notes, selectedNoteIds: [], selectionMode: false };
    });
  },
  
  favoriteSelectedNotes: () => {
    set((state) => {
      const notes = state.notes.map((note) =>
        state.selectedNoteIds.includes(note.id)
          ? { ...note, isFavorite: true, updatedAt: Date.now() }
          : note
      );
      saveToStorage(notes);
      return { notes, selectedNoteIds: [], selectionMode: false };
    });
  },
  
  unfavoriteSelectedNotes: () => {
    set((state) => {
      const notes = state.notes.map((note) =>
        state.selectedNoteIds.includes(note.id)
          ? { ...note, isFavorite: false, updatedAt: Date.now() }
          : note
      );
      saveToStorage(notes);
      return { notes, selectedNoteIds: [], selectionMode: false };
    });
  },
  
  changeSelectedNotesColor: (color) => {
    set((state) => {
      const notes = state.notes.map((note) =>
        state.selectedNoteIds.includes(note.id)
          ? { ...note, color: color as Note['color'], updatedAt: Date.now() }
          : note
      );
      saveToStorage(notes);
      return { notes, selectedNoteIds: [], selectionMode: false };
    });
  },
  
  // Add new note
  addNote: (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set((state) => {
      const notes = [newNote, ...state.notes];
      saveToStorage(notes);
      
      // Extract and add new tags
      const newTags = noteData.tags.filter(tag => !state.tags.includes(tag));
      const tags = newTags.length > 0 ? [...state.tags, ...newTags] : state.tags;
      
      return { notes, tags };
    });
    
    return newNote.id;
  },
  
  // Update existing note
  updateNote: (id, updates) => {
    set((state) => {
      const notes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      );
      saveToStorage(notes);
      
      // Update tags if changed
      let tags = state.tags;
      if (updates.tags) {
        const allTags = new Set(notes.flatMap(note => note.tags));
        tags = Array.from(allTags);
      }
      
      return { notes, tags };
    });
  },
  
  // Delete note
  deleteNote: (id) => {
    set((state) => {
      const notes = state.notes.filter((note) => note.id !== id);
      saveToStorage(notes);
      
      // Clean up unused tags
      const allTags = new Set(notes.flatMap(note => note.tags));
      const tags = Array.from(allTags);
      
      return { notes, tags };
    });
  },
  
  // Toggle pin status
  togglePin: (id) => {
    get().updateNote(id, {
      isPinned: !get().notes.find(n => n.id === id)?.isPinned,
    });
  },
  
  // Toggle favorite status
  toggleFavorite: (id) => {
    get().updateNote(id, {
      isFavorite: !get().notes.find(n => n.id === id)?.isFavorite,
    });
  },
  
  // Add new tag
  addTag: (tag) => {
    set((state) => {
      if (state.tags.includes(tag)) return state;
      return { tags: [...state.tags, tag] };
    });
  },
  
  // Remove tag
  removeTag: (tag) => {
    set((state) => {
      // Remove tag from all notes
      const notes = state.notes.map(note => ({
        ...note,
        tags: note.tags.filter(t => t !== tag),
      }));
      saveToStorage(notes);
      
      return {
        notes,
        tags: state.tags.filter(t => t !== tag),
      };
    });
  },
  
  // Add tag to specific note
  addTagToNote: (noteId, tag) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note || note.tags.includes(tag)) return;
    
    get().updateNote(noteId, {
      tags: [...note.tags, tag],
    });
    
    get().addTag(tag);
  },
  
  // Remove tag from specific note
  removeTagFromNote: (noteId, tag) => {
    const note = get().notes.find(n => n.id === noteId);
    if (!note) return;
    
    get().updateNote(noteId, {
      tags: note.tags.filter(t => t !== tag),
    });
  },
  
  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  // Set active filter
  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
  },
  
  // Update settings
  updateSettings: (newSettings) => {
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      saveSettings(settings);
      return { settings };
    });
  },
  
  // Load notes from storage
  loadNotes: async () => {
    set({ isLoading: true });
    
    try {
      const [notesData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      
      const notes: Note[] = notesData ? JSON.parse(notesData) : [];
      const settings = settingsData ? JSON.parse(settingsData) : defaultSettings;
      
      // Extract all unique tags
      const allTags = new Set<string>(notes.flatMap((note: Note) => note.tags));
      const tags = Array.from(allTags);
      
      set({ notes, tags, settings, isLoading: false });
    } catch (error) {
      console.error('Failed to load notes:', error);
      set({ isLoading: false });
    }
  },
  
  // Clear all notes
  clearAllNotes: () => {
    set({ notes: [], tags: [] });
    AsyncStorage.removeItem(STORAGE_KEY);
  },
  
  // Get filtered notes based on search and filter
  getFilteredNotes: () => {
    const { notes, searchQuery, activeFilter, settings } = get();
    
    let filtered = notes;
    
    // Apply filter
    if (activeFilter === 'pinned') {
      filtered = filtered.filter(note => note.isPinned);
    } else if (activeFilter === 'favorites') {
      filtered = filtered.filter(note => note.isFavorite);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    return sortNotes(filtered, settings.sortOption);
  },
  
  // Get notes by tag
  getNotesByTag: (tag) => {
    const { notes, settings } = get();
    const filtered = notes.filter(note => note.tags.includes(tag));
    return sortNotes(filtered, settings.sortOption);
  },
}));

// Helper function to save notes to AsyncStorage
async function saveToStorage(notes: Note[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
}

// Helper function to save settings
async function saveSettings(settings: AppSettings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Helper function to sort notes
function sortNotes(notes: Note[], sortOption: SortOption): Note[] {
  const sorted = [...notes];
  
  // Always show pinned notes first
  const pinned = sorted.filter(note => note.isPinned);
  const unpinned = sorted.filter(note => !note.isPinned);
  
  const sortFn = (a: Note, b: Note) => {
    switch (sortOption) {
      case 'date':
        return b.updatedAt - a.updatedAt;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'color':
        return a.color.localeCompare(b.color);
      default:
        return 0;
    }
  };
  
  return [...pinned.sort(sortFn), ...unpinned.sort(sortFn)];
}
