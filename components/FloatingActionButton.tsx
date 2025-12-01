import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Layout, BorderRadius, Shadows } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FloatingActionButtonProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}

export function FloatingActionButton({
  icon = 'add',
  onPress,
  style,
}: FloatingActionButtonProps) {
  const colors = useThemeColor();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 150,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.fab,
        {
          backgroundColor: colors.primary,
        },
        animatedStyle,
        style,
      ]}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: Layout.fabSize,
    height: Layout.fabSize,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xl,
  },
});
