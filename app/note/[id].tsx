import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useNotesStore } from '@/store/notesStore';
import { 
  NoteColorKey,
  Typography, 
  Spacing, 
  Layout, 
  BorderRadius 
} from '@/constants/theme';
import { IconButton, ColorPicker } from '@/components';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const isNewNote = id === 'new';

  // Store
  const notes = useNotesStore((state) => state.notes);
  const addNote = useNotesStore((state) => state.addNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const togglePin = useNotesStore((state) => state.togglePin);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const settings = useNotesStore((state) => state.settings);
  const triggerCelebration = useNotesStore((state) => state.triggerCelebration);

  // Find existing note
  const existingNote = notes.find((n) => n.id === id);

  // Local state
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [noteColor, setNoteColor] = useState<NoteColorKey>(
    existingNote?.color || settings.defaultNoteColor
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);

  // Refs
  const contentInputRef = useRef<TextInput>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for unsaved changes
  useEffect(() => {
    if (existingNote) {
      const changed =
        title !== existingNote.title ||
        content !== existingNote.content ||
        noteColor !== existingNote.color;
      setHasUnsavedChanges(changed);
    } else {
      setHasUnsavedChanges(title.length > 0 || content.length > 0);
    }
  }, [title, content, noteColor, existingNote]);

  // Auto-save function
  const saveNote = useCallback(() => {
    // Don't save if note is empty
    if (!title.trim() && !content.trim()) {
      return;
    }

    // Extract tags from content (words starting with #)
    const extractedTags = (content.match(/#[\w-]+/g) || [])
      .map(tag => tag.toLowerCase());

    if (isNewNote && !createdNoteId) {
      // Create new note and store its ID
      const newNoteId = addNote({
        title: title.trim(),
        content: content.trim(),
        color: noteColor,
        tags: extractedTags,
        isPinned: false,
        isFavorite: false,
      });
      setCreatedNoteId(newNoteId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (existingNote) {
      // Update existing note
      updateNote(existingNote.id, {
        title: title.trim(),
        content: content.trim(),
        color: noteColor,
        tags: extractedTags,
      });
    } else if (createdNoteId) {
      // Update the newly created note
      updateNote(createdNoteId, {
        title: title.trim(),
        content: content.trim(),
        color: noteColor,
        tags: extractedTags,
      });
    }
  }, [
    title,
    content,
    noteColor,
    isNewNote,
    createdNoteId,
    addNote,
    updateNote,
    existingNote,
  ]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        saveNote();
      }
    }, 1000); // Auto-save after 1 second of no typing

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, noteColor, hasUnsavedChanges, saveNote]);

  // Intercept back navigation (including swipe gesture)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Check if a new note was created
      const noteWasCreated = isNewNote && createdNoteId;
      
      // Save if there are unsaved changes
      if (hasUnsavedChanges) {
        saveNote();
      }
      
      // Trigger celebration if note was created
      if (noteWasCreated) {
        triggerCelebration();
      }
    });

    return unsubscribe;
  }, [navigation, isNewNote, createdNoteId, hasUnsavedChanges, saveNote, triggerCelebration]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    // Check if a new note was created
    const noteWasCreated = isNewNote && createdNoteId;
    
    if (hasUnsavedChanges) {
      saveNote();
    }
    
    // Trigger celebration if note was created
    if (noteWasCreated) {
      triggerCelebration();
    }
    
    router.back();
  }, [hasUnsavedChanges, saveNote, isNewNote, createdNoteId, triggerCelebration]);

  // Handle delete
  const handleDelete = useCallback(() => {
    const noteId = createdNoteId || existingNote?.id;
    if (!noteId) {
      router.back();
      return;
    }

    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote(noteId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
  }, [createdNoteId, existingNote, deleteNote]);

  // Handle pin/favorite
  const handleTogglePin = useCallback(() => {
    const noteId = createdNoteId || existingNote?.id;
    if (!noteId) return;
    togglePin(noteId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [createdNoteId, existingNote, togglePin]);

  const handleToggleFavorite = useCallback(() => {
    const noteId = createdNoteId || existingNote?.id;
    if (!noteId) return;
    toggleFavorite(noteId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [createdNoteId, existingNote, toggleFavorite]);

  // Character and word count
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Background color
  const backgroundColor = colors.noteColors[noteColor];
  
  // Get current note (either existing or newly created)
  const currentNote = existingNote || (createdNoteId ? notes.find(n => n.id === createdNoteId) : null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor }]}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <Animated.View
        entering={FadeIn}
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.sm,
            backgroundColor: backgroundColor + 'E6', // Semi-transparent
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <IconButton
            icon="chevron-back"
            onPress={handleBack}
            color={colors.text}
            backgroundColor={colors.background + '80'}
          />
        </View>

        <View style={styles.headerRight}>
          {currentNote && (
            <>
              <IconButton
                icon={currentNote.isPinned ? 'pin' : 'pin-outline'}
                onPress={handleTogglePin}
                color={currentNote.isPinned ? colors.warning : colors.text}
                backgroundColor={colors.background + '80'}
                style={{ marginRight: Spacing.sm }}
              />
              <IconButton
                icon={currentNote.isFavorite ? 'heart' : 'heart-outline'}
                onPress={handleToggleFavorite}
                color={currentNote.isFavorite ? colors.error : colors.text}
                backgroundColor={colors.background + '80'}
                style={{ marginRight: Spacing.sm }}
              />
            </>
          )}
          <IconButton
            icon="color-palette-outline"
            onPress={() => setShowColorPicker(!showColorPicker)}
            color={colors.text}
            backgroundColor={colors.background + '80'}
            style={{ marginRight: Spacing.sm }}
          />
          {currentNote && (
            <IconButton
              icon="trash-outline"
              onPress={handleDelete}
              color={colors.error}
              backgroundColor={colors.background + '80'}
            />
          )}
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.titleInput,
            {
              color: colors.text,
            },
          ]}
          returnKeyType="next"
          onSubmitEditing={() => contentInputRef.current?.focus()}
          blurOnSubmit={false}
        />

        {/* Content Input */}
        <TextInput
          ref={contentInputRef}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing..."
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.contentInput,
            {
              color: colors.text,
            },
          ]}
          multiline
          textAlignVertical="top"
        />

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={[styles.metadataText, { color: colors.textTertiary }]}>
            {charCount} characters · {wordCount} words
          </Text>
          {currentNote && (
            <Text style={[styles.metadataText, { color: colors.textTertiary }]}>
              {dayjs(currentNote.updatedAt).format('MMM D, YYYY [at] h:mm A')}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Color Picker Bottom Sheet */}
      {showColorPicker && (
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={[
            styles.colorPickerSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + Spacing.md,
            },
          ]}
        >
          <View style={styles.sheetHandle}>
            <View
              style={[
                styles.handle,
                { backgroundColor: colors.textTertiary + '40' },
              ]}
            />
          </View>

          <ColorPicker
            selectedColor={noteColor}
            onColorSelect={(color) => {
              setNoteColor(color);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />

          <TouchableOpacity
            onPress={() => setShowColorPicker(false)}
            style={[
              styles.doneButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
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
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.screenPadding,
    paddingBottom: 100,
  },
  titleInput: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.lg,
    padding: 0,
  },
  contentInput: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    minHeight: 200,
    padding: 0,
  },
  metadata: {
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  metadataText: {
    fontSize: Typography.sizes.xs,
  },
  colorPickerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Layout.screenPadding,
    maxHeight: '60%',
  },
  sheetHandle: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
  },
  doneButton: {
    height: Layout.buttonSizes.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
