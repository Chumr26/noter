import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface DeleteConfirmationModalProps {
  visible: boolean;
  noteTitle?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  noteTitle,
  onConfirm,
  onCancel,
}) => {
  const colors = useThemeColor();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 200 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, scale, opacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <Pressable style={styles.backdropTouchable} onPress={onCancel}>
            <Animated.View style={[styles.modalContainer, modalStyle]}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View
                  style={[
                    styles.modal,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* Icon */}
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: colors.error + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="delete-alert"
                      size={32}
                      color={colors.error}
                    />
                  </View>

                  {/* Title */}
                  <Text style={[styles.title, { color: colors.text }]}>
                    Delete Note?
                  </Text>

                  {/* Message */}
                  <Text style={[styles.message, { color: colors.textSecondary }]}>
                    {noteTitle
                      ? `Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`
                      : 'Are you sure you want to delete this note? This action cannot be undone.'}
                  </Text>

                  {/* Buttons */}
                  <View style={styles.buttonsContainer}>
                    <AnimatedPressable
                      onPress={handleCancel}
                      style={[
                        styles.button,
                        styles.cancelButton,
                        {
                          backgroundColor: colors.backgroundTertiary,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.buttonText, { color: colors.text }]}
                      >
                        Cancel
                      </Text>
                    </AnimatedPressable>

                    <AnimatedPressable
                      onPress={handleConfirm}
                      style={[
                        styles.button,
                        styles.deleteButton,
                        { backgroundColor: colors.error },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="delete"
                        size={18}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                      />
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                        Delete
                      </Text>
                    </AnimatedPressable>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
  },
  modal: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.sizes.base,
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  cancelButton: {
    borderWidth: 1,
  },
  deleteButton: {},
  buttonIcon: {
    marginRight: Spacing.xs,
  },
  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
});
