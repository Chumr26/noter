import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useNotesStore } from '@/store/notesStore';
import { Note } from '@/types';
import { NoteCard, EmptyState, IconButton } from '@/components';
import EmptySearchIllustration from '@/components/illustrations/EmptySearchIllustration';
import { Typography, Spacing, Layout, BorderRadius } from '@/constants/theme';

export default function SearchScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const notes = useNotesStore((state) => state.notes);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
        setSearchHistory((prev) => [searchQuery.trim(), ...prev.slice(0, 9)]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchHistory]);

  // Filter notes based on search and filters
  const filteredNotes = useMemo(() => {
    let results = notes;

    // Search filter
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      results = results.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const ranges = {
        today: day,
        week: 7 * day,
        month: 30 * day,
        all: Infinity,
      };
      const range = ranges[dateFilter];
      results = results.filter((note) => now - note.updatedAt < range);
    }

    return results;
  }, [notes, debouncedQuery, dateFilter]);

  const handleNotePress = useCallback((note: Note) => {
    router.push(`/note/${note.id}`);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleHistoryItemPress = (query: string) => {
    setSearchQuery(query);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const cycleDateFilter = () => {
    const filters: ('all' | 'today' | 'week' | 'month')[] = ['all', 'today', 'week', 'month'];
    const currentIndex = filters.indexOf(dateFilter);
    setDateFilter(filters[(currentIndex + 1) % filters.length]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderNote = useCallback(
    ({ item, index }: { item: Note; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50)
          .duration(300)
          .springify()}
        exiting={FadeOutUp.duration(200)}
      >
        <NoteCard note={item} onPress={() => handleNotePress(item)} />
      </Animated.View>
    ),
    [handleNotePress]
  );

  const renderEmptyState = () => {
    if (debouncedQuery.trim() === '' && dateFilter === 'all') {
      return (
        <EmptyState
          icon={<EmptySearchIllustration size={180} />}
          title="Search your notes"
          description="Enter keywords, tags, or phrases to find notes"
        />
      );
    }

    return (
      <EmptyState
        icon={<Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />}
        title="No results found"
        description="Try adjusting your search or filters"
      />
    );
  };

  const dateFilterLabel = {
    all: 'All time',
    today: 'Today',
    week: 'This week',
    month: 'This month',
  }[dateFilter];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>

        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notes..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <IconButton
              icon="close-circle"
              size={20}
              color={colors.textSecondary}
              onPress={handleClearSearch}
            />
          )}
        </View>

        {/* Date Filter */}
        <Pressable
          onPress={cycleDateFilter}
          style={[
            styles.filterChip,
            {
              backgroundColor: dateFilter !== 'all' ? colors.primary : colors.backgroundTertiary,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={dateFilter !== 'all' ? '#FFF' : colors.text}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: dateFilter !== 'all' ? '#FFF' : colors.text },
            ]}
          >
            {dateFilterLabel}
          </Text>
        </Pressable>
      </View>

      {/* Search History or Results */}
      {debouncedQuery.trim() === '' && dateFilter === 'all' && searchHistory.length > 0 ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
            <IconButton
              icon="trash-outline"
              size={20}
              color={colors.textSecondary}
              onPress={handleClearHistory}
            />
          </View>
          {searchHistory.map((query, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(index * 30).duration(200)}
            >
              <Pressable
                style={[styles.historyItem, { borderBottomColor: colors.border }]}
                onPress={() => handleHistoryItemPress(query)}
              >
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.historyText, { color: colors.text }]}>{query}</Text>
                <IconButton
                  icon="arrow-forward"
                  size={18}
                  color={colors.textTertiary}
                  onPress={() => handleHistoryItemPress(query)}
                />
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.resultsContainer}>
          {/* Results count */}
          {debouncedQuery.trim() !== '' && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                {filteredNotes.length} {filteredNotes.length === 1 ? 'result' : 'results'}
              </Text>
            </Animated.View>
          )}

          {/* Notes List */}
          <FlashList
            data={filteredNotes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        </View>
      )}
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
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    padding: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.screenPadding,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  historyText: {
    flex: 1,
    fontSize: Typography.sizes.base,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  resultsCount: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 100,
  },
});

