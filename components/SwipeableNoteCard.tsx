import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const translateX = useSharedValue(0);
  const height = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasTriggeredPinHaptic = useSharedValue(false);
  const hasTriggeredDeleteHaptic = useSharedValue(false);

  const colors = useThemeColor();

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(style);
  };

  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
    translateX.value = withSpring(0);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    height.value = withTiming(0, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });
    setTimeout(onDelete, 300);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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
      translateX.value = event.translationX;
      
      const translation = Math.abs(event.translationX);
      
      // Haptic feedback when crossing thresholds
      if (translation >= SWIPE_THRESHOLD && !hasTriggeredPinHaptic.value) {
        runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Light);
        hasTriggeredPinHaptic.value = true;
        hasTriggeredDeleteHaptic.value = false;
      }
      
      if (translation >= ACTION_THRESHOLD && !hasTriggeredDeleteHaptic.value) {
        runOnJS(triggerHaptic)(Haptics.ImpactFeedbackStyle.Medium);
        hasTriggeredDeleteHaptic.value = true;
      }
      
      // Reset haptic flags when swiping back
      if (translation < SWIPE_THRESHOLD) {
        hasTriggeredPinHaptic.value = false;
        hasTriggeredDeleteHaptic.value = false;
      }
    })
    .onEnd((event) => {
      // Reset haptic flags
      hasTriggeredPinHaptic.value = false;
      hasTriggeredDeleteHaptic.value = false;
      
      const translation = Math.abs(event.translationX);
      const isRightSwipe = event.translationX > 0;

      if (translation >= ACTION_THRESHOLD) {
        // Action threshold - delete (right swipe) or pin (left swipe)
        if (isRightSwipe) {
          // Delete action on right swipe
          translateX.value = withSpring(1000);
          runOnJS(handleDeleteRequest)();
        } else {
          // Pin action on strong left swipe
          runOnJS(handlePin)();
          translateX.value = withSpring(-SWIPE_THRESHOLD);
        }
      } else if (translation >= SWIPE_THRESHOLD) {
        // Swipe threshold - pin (right swipe) or return to center (left swipe)
        if (isRightSwipe) {
          // Pin action on right swipe
          runOnJS(handlePin)();
          translateX.value = withSpring(SWIPE_THRESHOLD);
        } else {
          // Pin action on left swipe
          runOnJS(handlePin)();
          translateX.value = withSpring(-SWIPE_THRESHOLD);
        }
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

  const deleteActionStyle = useAnimatedStyle(() => {
    const isVisible = translateX.value > 0; // Show on right swipe
    const translation = Math.abs(translateX.value);
    return {
      opacity: withTiming(
        isVisible && translation >= SWIPE_THRESHOLD ? 1 : 0,
        { duration: 100 }
      ),
    };
  });

  const pinActionStyle = useAnimatedStyle(() => {
    const isVisible = translateX.value < 0; // Show on left swipe
    const translation = Math.abs(translateX.value);
    return {
      opacity: withTiming(
        isVisible && translation >= SWIPE_THRESHOLD ? 1 : 0,
        { duration: 100 }
      ),
    };
  });

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Left action - Pin/Unpin */}
      <View style={[styles.actionsContainer, styles.leftActions]}>
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
      </View>

      {/* Right action - Delete */}
      <View style={[styles.actionsContainer, styles.rightActions]}>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        noteTitle={note.title}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
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
    top: 0,
    bottom: Spacing.md,
    justifyContent: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  leftActions: {
    right: 0,
    paddingLeft: Spacing.md,
  },
  rightActions: {
    left: 0,
    paddingRight: Spacing.md,
  },
  action: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: 18,
  },
  pinAction: {
    minWidth: SWIPE_THRESHOLD,
  },
  deleteAction: {
    minWidth: SWIPE_THRESHOLD,
  },
});
