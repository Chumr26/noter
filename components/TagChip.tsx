import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TagChipProps {
  tag: string;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'removable';
}

export function TagChip({
  tag,
  onPress,
  onRemove,
  variant = 'default',
}: TagChipProps) {
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Component = onPress || onRemove ? AnimatedTouchable : View;

  return (
    <Component
      {...(onPress || onRemove
        ? {
            onPress: onPress || onRemove,
            onPressIn: handlePressIn,
            onPressOut: handlePressOut,
            activeOpacity: 0.8,
          }
        : {})}
      style={[
        styles.chip,
        animatedStyle,
        {
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary + '40',
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.primary }]} numberOfLines={1}>
        #{tag}
      </Text>
      {variant === 'removable' && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </Component>
  );
}

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onAddTag,
  onRemoveTag,
  placeholder = 'Add tags...',
}: TagInputProps) {
  const colors = useThemeColor();
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAddTag(trimmed);
      setInputValue('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
      
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              variant="removable"
              onRemove={() => onRemoveTag(tag)}
            />
          ))}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}
      >
        <Ionicons name="pricetag-outline" size={20} color={colors.textTertiary} />
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            marginLeft: Spacing.sm,
            fontSize: Typography.sizes.base,
            color: colors.text,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    maxWidth: 150,
  },
  text: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  removeButton: {
    marginLeft: Spacing.xs,
  },
  container: {
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
