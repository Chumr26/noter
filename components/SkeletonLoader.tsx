import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const colors = useThemeColor();
  const backgroundColor = colors.backgroundSecondary;
  const shimmerColor = colors.border;

  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );

    return {
      opacity,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: shimmerColor,
            borderRadius,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export const SkeletonNoteCard: React.FC = () => {
  const colors = useThemeColor();
  const backgroundColor = colors.background;

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor,
          borderRadius: BorderRadius.lg,
          padding: Spacing.md,
          marginHorizontal: Spacing.md,
          marginBottom: Spacing.sm,
        },
      ]}
    >
      <SkeletonLoader width="70%" height={20} style={{ marginBottom: Spacing.sm }} />
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: Spacing.xs }} />
      <SkeletonLoader width="90%" height={16} style={{ marginBottom: Spacing.xs }} />
      <SkeletonLoader width="60%" height={16} style={{ marginBottom: Spacing.md }} />
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
          <SkeletonLoader width={60} height={24} borderRadius={BorderRadius.full} />
          <SkeletonLoader width={60} height={24} borderRadius={BorderRadius.full} />
        </View>
        <SkeletonLoader width={80} height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
