import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { 
  NoteColorKey, 
  NOTE_COLOR_KEYS,
  BorderRadius, 
  Spacing, 
  Typography, 
  Shadows 
} from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ColorPickerProps {
  selectedColor: NoteColorKey;
  onColorSelect: (color: NoteColorKey) => void;
}

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Note Color</Text>
      <View style={styles.colorsGrid}>
        {NOTE_COLOR_KEYS.map((colorKey) => (
          <ColorOption
            key={colorKey}
            colorKey={colorKey}
            isSelected={selectedColor === colorKey}
            onSelect={onColorSelect}
          />
        ))}
      </View>
    </View>
  );
}

interface ColorOptionProps {
  colorKey: NoteColorKey;
  isSelected: boolean;
  onSelect: (color: NoteColorKey) => void;
}

function ColorOption({ colorKey, isSelected, onSelect }: ColorOptionProps) {
  const colors = useThemeColor();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
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
    onSelect(colorKey);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backgroundColor = colors.noteColors[colorKey];

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={[
        styles.colorOption,
        animatedStyle,
        {
          backgroundColor,
          borderWidth: isSelected ? 3 : 2,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      {isSelected && (
        <View
          style={[
            styles.checkmark,
            { backgroundColor: colors.primary },
          ]}
        />
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
  },
});
