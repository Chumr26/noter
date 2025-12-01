import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NoteCard } from './NoteCard';
import { Note } from '@/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/theme';

interface SwipeableNoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
  onPin: () => void;
  index: number;
}

const SWIPE_THRESHOLD = 80;
const ACTION_THRESHOLD = 120;

export const SwipeableNoteCard: React.FC<SwipeableNoteCardProps> = ({
  note,
  onPress,
  onDelete,
  onPin,
  index,
}) => {
  const translateX = useSharedValue(0);
  const height = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasTriggeredPinHaptic = useSharedValue(false);
  const hasTriggeredDeleteHaptic = useSharedValue(false);

  const colors = useThemeColor();

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(style);
  };

  const handleDelete = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            translateX.value = withSpring(0);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            height.value = withTiming(0, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 });
            setTimeout(onDelete, 300);
          },
        },
      ]
    );
  };

  const handlePin = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    onPin();
    translateX.value = withSpring(0);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Require 10px horizontal movement to activate
    .failOffsetY([-15, 15]) // Fail if vertical movement exceeds 15px
    .onUpdate((event) => {
      // Only allow left swipe (negative translation)
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        
        const translation = Math.abs(event.translationX);
        
        // Haptic feedback when crossing pin threshold
        if (translation >= SWIPE_THRESHOLD && !hasTriggeredPinHaptic.value) {
          runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
          hasTriggeredPinHaptic.value = true;
          hasTriggeredDeleteHaptic.value = false;
        }
        
        // Haptic feedback when crossing delete threshold
        if (translation >= ACTION_THRESHOLD && !hasTriggeredDeleteHaptic.value) {
          runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
          hasTriggeredDeleteHaptic.value = true;
        }
        
        // Reset haptic flags when swiping back
        if (translation < SWIPE_THRESHOLD) {
          hasTriggeredPinHaptic.value = false;
          hasTriggeredDeleteHaptic.value = false;
        }
      }
    })
    .onEnd((event) => {
      // Reset haptic flags
      hasTriggeredPinHaptic.value = false;
      hasTriggeredDeleteHaptic.value = false;
      
      const translation = Math.abs(event.translationX);

      if (translation >= ACTION_THRESHOLD) {
        // Delete action
        translateX.value = withSpring(-1000);
        runOnJS(handleDelete)();
      } else if (translation >= SWIPE_THRESHOLD) {
        // Pin action
        runOnJS(handlePin)();
        translateX.value = withSpring(-SWIPE_THRESHOLD);
      } else {
        // Reset
        translateX.value = withSpring(0);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: height.value === 0 ? 0 : undefined,
    marginBottom: height.value === 0 ? 0 : undefined,
  }));

  const deleteActionStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      Math.abs(translateX.value) >= ACTION_THRESHOLD ? 1 : 0.6,
      { duration: 100 }
    ),
  }));

  const pinActionStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      Math.abs(translateX.value) >= SWIPE_THRESHOLD &&
        Math.abs(translateX.value) < ACTION_THRESHOLD
        ? 1
        : 0.6,
      { duration: 100 }
    ),
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={styles.actionsContainer}>
        <Animated.View
          style={[
            styles.action,
            styles.pinAction,
            { backgroundColor: colors.warning },
            pinActionStyle,
          ]}
        >
          <MaterialCommunityIcons
            name={note.isPinned ? 'pin-off' : 'pin'}
            size={24}
            color="#FFF"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.action,
            styles.deleteAction,
            { backgroundColor: colors.error },
            deleteActionStyle,
          ]}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#FFF" />
        </Animated.View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardAnimatedStyle}>
          <NoteCard note={note} onPress={onPress} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: Spacing.md, // Account for container's marginBottom
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 18,
    overflow: 'hidden',
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  pinAction: {
    width: SWIPE_THRESHOLD,
  },
  deleteAction: {
    width: ACTION_THRESHOLD,
  },
});
