import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useNotesStore } from '@/store/notesStore';
import { Typography, Spacing, Layout, BorderRadius, Shadows } from '@/constants/theme';
import { EmptyState, FloatingActionButton } from '@/components';
import EmptyTagsIllustration from '@/components/illustrations/EmptyTagsIllustration';

export default function TagsScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  
  const notes = useNotesStore((state) => state.notes);

  // Calculate tag statistics
  const tagStats = useMemo(() => {
    const stats = new Map<string, number>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        stats.set(tag, (stats.get(tag) || 0) + 1);
      });
    });
    return Array.from(stats.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [notes]);

  const handleTagPress = (tag: string) => {
    // Navigate to search with tag filter
    router.push({
      pathname: '/search',
      params: { tag },
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddTag = () => {
    // Navigate to create new note
    router.push('/note/new');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Get tag color based on index (rotating through theme colors)
  const getTagColor = (index: number) => {
    const tagColors = [
      colors.primary,
      colors.success,
      colors.warning,
      colors.error,
      colors.info,
    ];
    return tagColors[index % tagColors.length];
  };

  // Calculate max count for size scaling
  const maxCount = tagStats.length > 0 ? tagStats[0].count : 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tags</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {tagStats.length} {tagStats.length === 1 ? 'tag' : 'tags'} • {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      {/* Content */}
      {tagStats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={<EmptyTagsIllustration size={180} />}
            title="No tags yet"
            description="Create notes with tags to organize them"
          />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Tag Cloud */}
          <View style={styles.tagCloud}>
            {tagStats.map((item, index) => {
              // Calculate size based on count (min 14, max 32)
              const sizeRatio = item.count / maxCount;
              const fontSize = 14 + (sizeRatio * 18);
              const tagColor = getTagColor(index);

              return (
                <Animated.View
                  key={item.tag}
                  entering={FadeInDown.delay(index * 30)
                    .duration(300)
                    .springify()}
                >
                  <Pressable
                    onPress={() => handleTagPress(item.tag)}
                    style={({ pressed }) => [
                      styles.tagItem,
                      {
                        backgroundColor: tagColor + '15',
                        borderColor: tagColor + '40',
                        opacity: pressed ? 0.7 : 1,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      },
                    ]}
                  >
                    <Ionicons name="pricetag" size={fontSize * 0.8} color={tagColor} />
                    <Text
                      style={[
                        styles.tagText,
                        { color: tagColor, fontSize },
                      ]}
                    >
                      {item.tag}
                    </Text>
                    <View style={[styles.countBadge, { backgroundColor: tagColor }]}>
                      <Text style={styles.countText}>{item.count}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Tag List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Tags</Text>
            {tagStats.map((item, index) => (
              <Animated.View
                key={`list-${item.tag}`}
                entering={FadeIn.delay(index * 20).duration(200)}
              >
                <Pressable
                  onPress={() => handleTagPress(item.tag)}
                  style={[
                    styles.tagListItem,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.tagListLeft}>
                    <View
                      style={[
                        styles.tagColorDot,
                        { backgroundColor: getTagColor(index) },
                      ]}
                    />
                    <Text style={[styles.tagListText, { color: colors.text }]}>
                      #{item.tag}
                    </Text>
                  </View>
                  <View style={styles.tagListRight}>
                    <Text style={[styles.tagListCount, { color: colors.textSecondary }]}>
                      {item.count} {item.count === 1 ? 'note' : 'notes'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* FAB */}
      <FloatingActionButton onPress={handleAddTag} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.screenPadding,
    paddingBottom: 100,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  tagText: {
    fontWeight: Typography.weights.semibold,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  tagListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  tagListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tagColorDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  tagListText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  tagListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tagListCount: {
    fontSize: Typography.sizes.sm,
  },
});

