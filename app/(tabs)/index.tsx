import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, Alert } from 'react-native';
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
  ConfettiAnimation,
  SwipeableNoteCard,
} from '@/components';
import EmptyNotesIllustration from '@/components/illustrations/EmptyNotesIllustration';
import { Typography, Spacing, Layout } from '@/constants/theme';

export default function NotesListScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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

  // Navigate to note detail
  const handleNotePress = useCallback((note: Note) => {
    router.push(`/note/${note.id}`);
  }, []);

  // Handle long press - show action menu
  const handleNoteLongPress = useCallback(
    (note: Note) => {
      Alert.alert(
        note.title || 'Note',
        'Choose an action',
        [
          {
            text: note.isPinned ? 'Unpin' : 'Pin',
            onPress: () => {
              togglePin(note.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
          {
            text: note.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
            onPress: () => {
              toggleFavorite(note.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Delete Note',
                'Are you sure you want to delete this note?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deleteNote(note.id);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      );
                    },
                  },
                ]
              );
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    },
    [togglePin, toggleFavorite, deleteNote]
  );

  // Create new note
  const handleCreateNote = useCallback(() => {
    setShowConfetti(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/note/new');
  }, []);

  // Render note item with animation
  const renderNote = useCallback(
    ({ item, index }: { item: Note; index: number }) =>
      useSwipeable ? (
        <Animated.View
          entering={FadeInDown.delay(index * 50)
            .duration(300)
            .springify()}
          exiting={FadeOutUp.duration(200)}
        >
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
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(index * 50)
            .duration(300)
            .springify()}
          exiting={FadeOutUp.duration(200)}
        >
          <NoteCard
            note={item}
            onPress={() => handleNotePress(item)}
            onLongPress={() => handleNoteLongPress(item)}
          />
        </Animated.View>
      ),
    [useSwipeable, handleNotePress, handleNoteLongPress, deleteNote, togglePin, toggleFavorite, settings.hapticsEnabled]
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
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Notes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredNotes.length}{' '}
            {filteredNotes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>

        <IconButton
          icon="search"
          onPress={() => router.push('/(tabs)/search')}
          color={colors.text}
          backgroundColor={colors.backgroundTertiary}
        />
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
      <FloatingActionButton onPress={handleCreateNote} />
      
      {/* Confetti animation on note creation */}
      <ConfettiAnimation
        show={showConfetti}
        onComplete={() => setShowConfetti(false)}
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
});
