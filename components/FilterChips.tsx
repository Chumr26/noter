import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { FilterType } from '@/types';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FilterChipProps {
  label: string;
  value: FilterType;
  isActive: boolean;
  onPress: (value: FilterType) => void;
  count?: number;
}

export function FilterChip({
  label,
  value,
  isActive,
  onPress,
  count,
}: FilterChipProps) {
  const colors = useThemeColor();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 150,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePress = () => {
    onPress(value);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={[
        styles.chip,
        animatedStyle,
        {
          backgroundColor: isActive ? colors.primary : colors.backgroundTertiary,
          borderColor: isActive ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: isActive ? '#FFFFFF' : colors.text,
          },
        ]}
      >
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isActive ? '#FFFFFF' : colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isActive ? colors.primary : '#FFFFFF',
              },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </AnimatedTouchable>
  );
}

interface FilterChipsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all: number;
    pinned: number;
    favorites: number;
  };
}

export function FilterChips({
  activeFilter,
  onFilterChange,
  counts,
}: FilterChipsProps) {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pinned', value: 'pinned' },
    { label: 'Favorites', value: 'favorites' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <FilterChip
          key={filter.value}
          label={filter.label}
          value={filter.value}
          isActive={activeFilter === filter.value}
          onPress={onFilterChange}
          count={counts?.[filter.value]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    ...Shadows.sm,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  badge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
