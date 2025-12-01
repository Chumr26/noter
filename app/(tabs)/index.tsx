import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useNotesStore } from '@/store/notesStore';
import { Note } from '@/types';
import {
  NoteCard,
  FloatingActionButton,
  FilterChips,
  EmptyState,
  IconButton,
  SkeletonNoteCard,
  SwipeableNoteCard,
  SelectionToolbar,
  ConfettiAnimation,
} from '@/components';
import EmptyNotesIllustration from '@/components/illustrations/EmptyNotesIllustration';
import { Typography, Spacing, Layout } from '@/constants/theme';

export default function NotesListScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const useSwipeable = true; // Enable swipeable cards

  // Store state
  const notes = useNotesStore((state) => state.notes);
  const activeFilter = useNotesStore((state) => state.activeFilter);
  const setActiveFilter = useNotesStore((state) => state.setActiveFilter);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const togglePin = useNotesStore((state) => state.togglePin);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const loadNotes = useNotesStore((state) => state.loadNotes);
  const isLoading = useNotesStore((state) => state.isLoading);
  const searchQuery = useNotesStore((state) => state.searchQuery);
  const settings = useNotesStore((state) => state.settings);
  
  // Selection state
  const selectionMode = useNotesStore((state) => state.selectionMode);
  const selectedNoteIds = useNotesStore((state) => state.selectedNoteIds);
  const toggleSelectionMode = useNotesStore((state) => state.toggleSelectionMode);
  const toggleNoteSelection = useNotesStore((state) => state.toggleNoteSelection);
  const selectAllNotes = useNotesStore((state) => state.selectAllNotes);
  const clearSelection = useNotesStore((state) => state.clearSelection);
  const deleteSelectedNotes = useNotesStore((state) => state.deleteSelectedNotes);
  const pinSelectedNotes = useNotesStore((state) => state.pinSelectedNotes);
  const unpinSelectedNotes = useNotesStore((state) => state.unpinSelectedNotes);
  const favoriteSelectedNotes = useNotesStore((state) => state.favoriteSelectedNotes);
  const unfavoriteSelectedNotes = useNotesStore((state) => state.unfavoriteSelectedNotes);
  const changeSelectedNotesColor = useNotesStore((state) => state.changeSelectedNotesColor);
  
  // Celebration state
  const showCelebration = useNotesStore((state) => state.showCelebration);
  const clearCelebration = useNotesStore((state) => state.clearCelebration);

  // Get filtered notes - computed directly from store values
  const filteredNotes = useMemo(() => {
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
    
    // Sort - pinned notes first, then by selected sort option
    const pinned = filtered.filter(note => note.isPinned);
    const unpinned = filtered.filter(note => !note.isPinned);
    
    const sortFn = (a: Note, b: Note) => {
      switch (settings.sortOption) {
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
  }, [notes, activeFilter, searchQuery, settings.sortOption]);

  // Calculate counts for filter chips - based on filtered results
  const filterCounts = useMemo(
    () => ({
      all: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      favorites: notes.filter((n) => n.isFavorite).length,
    }),
    [notes]
  );

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [loadNotes]);

  // Navigate to note detail or toggle selection
  const handleNotePress = useCallback((note: Note) => {
    if (selectionMode) {
      toggleNoteSelection(note.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      router.push(`/note/${note.id}`);
    }
  }, [selectionMode, toggleNoteSelection]);

  // Handle long press - enter selection mode
  const handleNoteLongPress = useCallback((note: Note) => {
    if (!selectionMode) {
      toggleSelectionMode();
      toggleNoteSelection(note.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [selectionMode, toggleSelectionMode, toggleNoteSelection]);

  // Create new note
  const handleCreateNote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/note/new');
  }, []);

  // Render note item with animation and selection support
  const renderNote = useCallback(
    ({ item, index }: { item: Note; index: number }) => {
      const isSelected = selectedNoteIds.includes(item.id);
      
      return (
        <Animated.View
          entering={FadeInDown.delay(index * 50)
            .duration(300)
            .springify()}
          exiting={FadeOutUp.duration(200)}
        >
          {selectionMode ? (
            <View style={styles.selectionContainer}>
              <View style={styles.checkbox}>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={28}
                  color={isSelected ? colors.primary : colors.textTertiary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <NoteCard
                  note={item}
                  onPress={() => handleNotePress(item)}
                  onLongPress={() => handleNoteLongPress(item)}
                />
              </View>
            </View>
          ) : useSwipeable ? (
            <SwipeableNoteCard
              note={item}
              onPress={() => handleNotePress(item)}
              onDelete={() => deleteNote(item.id)}
              onPin={() => togglePin(item.id)}
              onFavorite={() => {
                toggleFavorite(item.id);
                if (settings.hapticsEnabled) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }}
              index={index}
            />
          ) : (
            <NoteCard
              note={item}
              onPress={() => handleNotePress(item)}
              onLongPress={() => handleNoteLongPress(item)}
            />
          )}
        </Animated.View>
      );
    },
    [
      selectionMode,
      selectedNoteIds,
      useSwipeable,
      handleNotePress,
      handleNoteLongPress,
      deleteNote,
      togglePin,
      toggleFavorite,
      settings.hapticsEnabled,
      colors.primary,
      colors.textTertiary,
    ]
  );

  // Empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <Animated.View entering={FadeIn.duration(300)}>
          <SkeletonNoteCard />
          <SkeletonNoteCard />
          <SkeletonNoteCard />
        </Animated.View>
      );
    }

    const emptyMessages = {
      all: {
        title: 'No notes yet',
        description: 'Tap the + button to create your first note',
      },
      pinned: {
        title: 'No pinned notes',
        description: 'Long press a note to pin it to the top',
      },
      favorites: {
        title: 'No favorite notes',
        description: 'Mark notes as favorites to see them here',
      },
    };

    const message = emptyMessages[activeFilter];

    return (
      <EmptyState
        icon={
          activeFilter === 'all' ? (
            <EmptyNotesIllustration size={180} />
          ) : (
            <Ionicons
              name={
                activeFilter === 'pinned'
                  ? 'pin-outline'
                  : 'heart-outline'
              }
              size={80}
              color={colors.textTertiary}
            />
          )
        }
        title={message.title}
        description={message.description}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        {selectionMode ? (
          <>
            <IconButton
              icon="close"
              onPress={clearSelection}
              color={colors.text}
              backgroundColor={colors.backgroundTertiary}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {selectedNoteIds.length} selected
            </Text>
            <IconButton
              icon="checkmark-done"
              onPress={selectAllNotes}
              color={colors.primary}
              backgroundColor={`${colors.primary}15`}
            />
          </>
        ) : (
          <>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {filteredNotes.length}{' '}
                {filteredNotes.length === 1 ? 'note' : 'notes'}
              </Text>
            </View>

            <View style={styles.headerButtons}>
              <IconButton
                icon="checkmark-circle-outline"
                onPress={toggleSelectionMode}
                color={colors.text}
                backgroundColor={colors.backgroundTertiary}
              />
              <IconButton
                icon="search"
                onPress={() => router.push('/(tabs)/search')}
                color={colors.text}
                backgroundColor={colors.backgroundTertiary}
              />
            </View>
          </>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
      </View>

      {/* Notes List */}
      <FlashList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Action Button */}
      {!selectionMode && <FloatingActionButton onPress={handleCreateNote} />}

      {/* Selection Toolbar */}
      {selectionMode && (
        <SelectionToolbar
          selectedCount={selectedNoteIds.length}
          onDelete={deleteSelectedNotes}
          onPin={pinSelectedNotes}
          onUnpin={unpinSelectedNotes}
          onFavorite={favoriteSelectedNotes}
          onUnfavorite={unfavoriteSelectedNotes}
          onChangeColor={changeSelectedNotesColor}
          onSelectAll={selectAllNotes}
          onClearSelection={clearSelection}
        />
      )}
      
      {/* Confetti animation */}
      <ConfettiAnimation
        show={showCelebration}
        onComplete={clearCelebration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs / 2,
  },
  filtersContainer: {
    paddingHorizontal: Layout.screenPadding,
  },
  listContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 100, // Space for FAB
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});