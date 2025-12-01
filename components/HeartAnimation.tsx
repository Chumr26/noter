import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface HeartAnimationProps {
  visible: boolean;
  onComplete?: () => void;
}

export const HeartAnimation: React.FC<HeartAnimationProps> = ({ visible, onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 0;
      opacity.value = 1;

      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withDelay(300, withSpring(1.5)),
        withTiming(0, { duration: 200 }, (finished) => {
          'worklet';
          opacity.value = 0;
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
    }
  }, [visible, onComplete, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Ionicons name="heart" size={80} color="#FF6B6B" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
