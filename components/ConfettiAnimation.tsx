import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPieceProps {
  delay: number;
  x: number;
  color: string;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ delay, x, color }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const randomRotation = Math.random() * 720 - 360;
    const randomX = (Math.random() - 0.5) * 200;

    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.cubic,
      })
    );

    translateX.value = withDelay(
      delay,
      withSpring(randomX, {
        damping: 10,
        stiffness: 50,
      })
    );

    rotate.value = withDelay(
      delay,
      withTiming(randomRotation, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, {
        duration: 500,
      })
    );

    scale.value = withDelay(
      delay,
      withSpring(0.8, {
        damping: 5,
      })
    );
  }, [delay, translateY, translateX, rotate, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ConfettiAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  show,
  onComplete,
}) => {
  const colors = useThemeColor();

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  const confettiColors = [
    colors.primary,
    colors.success,
    colors.warning,
    colors.error,
    colors.info,
    '#FFD700',
    '#FF69B4',
    '#00CED1',
  ];
  const confettiCount = 50;

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      {Array.from({ length: confettiCount }).map((_, index) => (
        <ConfettiPiece
          key={index}
          delay={index * 30}
          x={Math.random() * SCREEN_WIDTH}
          color={confettiColors[Math.floor(Math.random() * confettiColors.length)]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
