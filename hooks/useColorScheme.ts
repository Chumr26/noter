import { useColorScheme as useRNColorScheme } from 'react-native';
import { useNotesStore } from '@/store/notesStore';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme() ?? 'light';
  
  // Safely get theme setting with fallback
  const themeSetting = useNotesStore((state) => state.settings?.theme) ?? 'auto';
  
  if (themeSetting === 'auto') {
    return systemColorScheme;
  }
  
  return themeSetting;
}
