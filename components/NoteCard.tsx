import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Note } from '@/types';
import {
  BorderRadius,
  Spacing,
  Typography,
  Shadows,
  Animations,
} from '@/constants/theme';

dayjs.extend(relativeTime);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export function NoteCard({ note, onPress, onLongPress, style }: NoteCardProps) {
  const colors = useThemeColor();
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 20,
      stiffness: 150,
    });
    
    // Shimmer effect
    shimmer.value = withSequence(
      withTiming(1, { duration: Animations.durations.fast }),
      withTiming(0, { duration: Animations.durations.normal })
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 150,
    });
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value * 0.3,
  }));

  // Get background color from note color
  const backgroundColor = colors.noteColors[note.color];
  const hasContent = note.content.trim().length > 0;
  const previewText = note.content.trim().slice(0, 150);
  const timeAgo = dayjs(note.updatedAt).fromNow();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      style={[styles.card, animatedStyle, { backgroundColor }, style]}
    >
      {/* Shimmer overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.shimmer, borderRadius: BorderRadius.lg },
          shimmerStyle,
        ]}
      />

      {/* Pinned/Favorite indicators */}
      <View style={styles.indicators}>
        {note.isPinned && (
          <View style={[styles.badge, { backgroundColor: colors.warning }]}>
            <Ionicons name="pin" size={12} color="#FFFFFF" />
          </View>
        )}
        {note.isFavorite && (
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Ionicons name="heart" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Title */}
      {note.title.trim().length > 0 && (
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {note.title}
        </Text>
      )}

      {/* Content preview */}
      {hasContent && (
        <Text
          style={[styles.content, { color: colors.textSecondary }]}
          numberOfLines={note.title.trim().length > 0 ? 4 : 6}
        >
          {previewText}
        </Text>
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {note.tags.slice(0, 3).map((tag, index) => (
            <View
              key={index}
              style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
            >
              <Text
                style={[styles.tagText, { color: colors.primary }]}
                numberOfLines={1}
              >
                #{tag}
              </Text>
            </View>
          ))}
          {note.tags.length > 3 && (
            <Text style={[styles.moreText, { color: colors.textTertiary }]}>
              +{note.tags.length - 3}
            </Text>
          )}
        </View>
      )}

      {/* Footer with timestamp */}
      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
          {timeAgo}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    minHeight: 120,
    ...Shadows.md,
  },
  indicators: {
    flexDirection: 'row',
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    gap: Spacing.xs,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.sm,
    paddingRight: Spacing.xl,
  },
  content: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.sm,
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.xs,
    maxWidth: 100,
  },
  tagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  moreText: {
    fontSize: Typography.sizes.xs,
    alignSelf: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.xs,
  },
  timestamp: {
    fontSize: Typography.sizes.xs,
  },
});
