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

  const colors = useThemeColor();

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDelete = () => {
    'worklet';
    runOnJS(Alert.alert)(
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
    'worklet';
    runOnJS(triggerHaptic)();
    runOnJS(onPin)();
    translateX.value = withSpring(0);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow left swipe (negative translation)
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const translation = Math.abs(event.translationX);

      if (translation >= ACTION_THRESHOLD) {
        // Delete action
        translateX.value = withSpring(-1000);
        runOnJS(handleDelete)();
      } else if (translation >= SWIPE_THRESHOLD) {
        // Pin action
        translateX.value = withSpring(-SWIPE_THRESHOLD);
        runOnJS(handlePin)();
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
    marginBottom: height.value === 0 ? 0 : Spacing.sm,
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
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    height: '100%',
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
