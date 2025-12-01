import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography, Spacing } from '@/constants/theme';
import { ColorPicker } from './ColorPicker';

interface SelectionToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onFavorite: () => void;
  onUnfavorite: () => void;
  onChangeColor: (color: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedCount,
  onDelete,
  onPin,
  onUnpin,
  onFavorite,
  onUnfavorite,
  onChangeColor,
  onSelectAll,
  onClearSelection,
}) => {
  const colors = useThemeColor();
  const colorScheme = useColorScheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleDelete = () => {
    if (selectedCount === 0) return;

    Alert.alert(
      'Delete Notes',
      `Are you sure you want to delete ${selectedCount} ${
        selectedCount === 1 ? 'note' : 'notes'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete();
          },
        },
      ]
    );
  };

  const handlePin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPin();
  };

  const handleUnpin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUnpin();
  };

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFavorite();
  };

  const handleUnfavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUnfavorite();
  };

  const handleColorChange = (color: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeColor(color);
    setShowColorPicker(false);
  };

  return (
    <>
      <AnimatedBlurView
        intensity={95}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[
          styles.container,
          {
            backgroundColor: colorScheme === 'dark'
              ? 'rgba(31, 41, 55, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            borderTopColor: colors.border,
          },
        ]}
        entering={FadeInDown.springify()}
        exiting={FadeOutDown.springify()}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClearSelection}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.text }]}>
            {selectedCount} selected
          </Text>

          <TouchableOpacity
            onPress={onSelectAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.selectAllText, { color: colors.primary }]}>
              Select All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ToolbarButton
            icon="pin"
            label="Pin"
            onPress={handlePin}
            color={colors.warning}
            disabled={selectedCount === 0}
          />

          <ToolbarButton
            icon="pin-off"
            label="Unpin"
            onPress={handleUnpin}
            color={colors.textSecondary}
            disabled={selectedCount === 0}
          />

          <ToolbarButton
            icon="heart"
            label="Favorite"
            onPress={handleFavorite}
            color="#FF6B6B"
            disabled={selectedCount === 0}
          />

          <ToolbarButton
            icon="heart-outline"
            label="Unfav"
            onPress={handleUnfavorite}
            color={colors.textSecondary}
            disabled={selectedCount === 0}
          />

          <ToolbarButton
            icon="palette"
            label="Color"
            onPress={() => setShowColorPicker(true)}
            color={colors.primary}
            disabled={selectedCount === 0}
          />

          <ToolbarButton
            icon="delete"
            label="Delete"
            onPress={handleDelete}
            color={colors.error}
            disabled={selectedCount === 0}
          />
        </View>
      </AnimatedBlurView>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <Modal
          visible={showColorPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowColorPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowColorPicker(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.backgroundSecondary },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Color
                </Text>
                <TouchableOpacity
                  onPress={() => setShowColorPicker(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ColorPicker
                selectedColor="default"
                onColorSelect={(color) => {
                  handleColorChange(color);
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

interface ToolbarButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onPress,
  color,
  disabled = false,
}) => {
  const colors = useThemeColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.actionButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: disabled
              ? colors.backgroundTertiary
              : `${color}15`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={disabled ? colors.textTertiary : color}
        />
      </View>
      <Text
        style={[
          styles.actionLabel,
          {
            color: disabled ? colors.textTertiary : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: 34, // Extra padding for home indicator
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  selectAllText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
});
