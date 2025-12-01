import { useColorScheme } from './useColorScheme';
import { Colors } from '@/constants/theme';

export function useThemeColor() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme];
}
