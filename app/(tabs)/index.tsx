import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOutUp,
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
  LoadingSpinner,
  IconButton,
} from '@/components';
import { Typography, Spacing, Layout } from '@/constants/theme';

export default function NotesListScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  // Store state
  const notes = useNotesStore((state) => state.notes);
  const activeFilter = useNotesStore((state) => state.activeFilter);
  const setActiveFilter = useNotesStore((state) => state.setActiveFilter);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const togglePin = useNotesStore((state) => state.togglePin);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const loadNotes = useNotesStore((state) => state.loadNotes);
  const getFilteredNotes = useNotesStore((state) => state.getFilteredNotes);
  const isLoading = useNotesStore((state) => state.isLoading);

  // Get filtered notes
  const filteredNotes = useMemo(() => getFilteredNotes(), [
    notes,
    activeFilter,
    getFilteredNotes,
  ]);

  // Calculate counts for filter chips
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
    router.push('/note/new');
  }, []);

  // Render note item with animation
  const renderNote = useCallback(
    ({ item, index }: { item: Note; index: number }) => (
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
    [handleNotePress, handleNoteLongPress]
  );

  // Empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner size={50} />
        </View>
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
          <Ionicons
            name={
              activeFilter === 'pinned'
                ? 'pin-outline'
                : activeFilter === 'favorites'
                ? 'heart-outline'
                : 'document-text-outline'
            }
            size={80}
            color={colors.textTertiary}
          />
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
        estimatedItemSize={150}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleCreateNote} />
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
