import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography, Spacing } from '@/constants/theme';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColor();
  
  const isNewNote = id === 'new';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {isNewNote ? 'New Note' : `Note ${id}`}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Note editor will appear here
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
  },
});
