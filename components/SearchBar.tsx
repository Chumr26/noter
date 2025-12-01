import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/useThemeColor';
import { IconButton } from './IconButton';
import {
  BorderRadius,
  Spacing,
  Typography,
  Shadows,
  Animations,
} from '@/constants/theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search notes...',
  style,
  ...props
}: SearchBarProps) {
  const colors = useThemeColor();
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = useSharedValue(1);

  const handleFocus = () => {
    setIsFocused(true);
    borderWidth.value = withTiming(2, {
      duration: Animations.durations.fast,
    });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, {
      duration: Animations.durations.fast,
    });
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
    borderColor: isFocused ? colors.primary : colors.border,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
        animatedContainerStyle,
        style,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? colors.primary : colors.textTertiary}
        style={styles.icon}
      />
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          {
            color: colors.text,
          },
        ]}
        {...props}
      />

      {value.length > 0 && (
        <IconButton
          icon="close-circle"
          onPress={handleClear}
          size={18}
          color={colors.textTertiary}
          backgroundColor="transparent"
          style={styles.clearButton}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Shadows.sm,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.regular,
  },
  clearButton: {
    width: 32,
    height: 32,
    marginLeft: Spacing.xs,
  },
});
