import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useNotesStore } from '@/store/notesStore';
import { Typography, Spacing, Layout, BorderRadius, Shadows } from '@/constants/theme';
import { ThemeMode } from '@/types';

type ViewMode = 'grid' | 'list';
type SortOption = 'date' | 'title' | 'color';

export default function SettingsScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  
  const settings = useNotesStore((state) => state.settings);
  const updateSettings = useNotesStore((state) => state.updateSettings);
  const clearAllNotes = useNotesStore((state) => state.clearAllNotes);
  const notes = useNotesStore((state) => state.notes);

  const [hapticsEnabled, setHapticsEnabled] = useState(settings.hapticsEnabled);

  const handleThemeChange = (theme: ThemeMode) => {
    updateSettings({ theme });
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    updateSettings({ viewMode: mode });
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSortChange = (sort: SortOption) => {
    updateSettings({ sortOption: sort });
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    updateSettings({ hapticsEnabled: value });
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleClearAllNotes = () => {
    Alert.alert(
      'Clear All Notes',
      `Are you sure you want to delete all ${notes.length} notes? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            clearAllNotes();
            if (hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    showChevron = true,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.settingRow, { backgroundColor: colors.backgroundSecondary }]}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
        {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
      </View>
    </Pressable>
  );

  const ToggleRow = ({
    icon,
    label,
    value,
    onValueChange,
  }: {
    icon: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={[styles.settingRow, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : colors.textTertiary}
      />
    </View>
  );

  const OptionSelector = ({
    icon,
    label,
    options,
    selected,
    onSelect,
  }: {
    icon: string;
    label: string;
    options: { value: string; label: string; icon?: string }[];
    selected: string;
    onSelect: (value: string) => void;
  }) => (
    <View style={styles.optionGroup}>
      <View style={styles.optionHeader}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.optionButtons}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.optionButton,
              {
                backgroundColor: selected === option.value ? colors.primary : colors.backgroundTertiary,
                borderColor: selected === option.value ? colors.primary : colors.border,
              },
            ]}
          >
            {option.icon && (
              <Ionicons
                name={option.icon as any}
                size={18}
                color={selected === option.value ? '#FFF' : colors.text}
              />
            )}
            <Text
              style={[
                styles.optionButtonText,
                { color: selected === option.value ? '#FFF' : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(0).duration(300).springify()}>
          <SettingSection title="APPEARANCE">
            <OptionSelector
              icon="moon-outline"
              label="Theme"
              options={[
                { value: 'light', label: 'Light', icon: 'sunny-outline' },
                { value: 'dark', label: 'Dark', icon: 'moon-outline' },
                { value: 'auto', label: 'Auto', icon: 'phone-portrait-outline' },
              ]}
              selected={settings.theme}
              onSelect={(value) => handleThemeChange(value as ThemeMode)}
            />
            <View style={{ height: Spacing.md }} />
            <OptionSelector
              icon="color-palette-outline"
              label="View Mode"
              options={[
                { value: 'grid', label: 'Grid', icon: 'grid-outline' },
                { value: 'list', label: 'List', icon: 'list-outline' },
              ]}
              selected={settings.viewMode}
              onSelect={(value) => handleViewModeChange(value as ViewMode)}
            />
          </SettingSection>
        </Animated.View>

        {/* Sorting */}
        <Animated.View entering={FadeInDown.delay(100).duration(300).springify()}>
          <SettingSection title="ORGANIZATION">
            <OptionSelector
              icon="swap-vertical-outline"
              label="Sort By"
              options={[
                { value: 'date', label: 'Date', icon: 'calendar-outline' },
                { value: 'title', label: 'Title', icon: 'text-outline' },
                { value: 'color', label: 'Color', icon: 'color-palette-outline' },
              ]}
              selected={settings.sortOption}
              onSelect={(value) => handleSortChange(value as SortOption)}
            />
          </SettingSection>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.delay(200).duration(300).springify()}>
          <SettingSection title="PREFERENCES">
            <ToggleRow
              icon="phone-portrait-outline"
              label="Haptic Feedback"
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
            />
          </SettingSection>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.delay(300).duration(300).springify()}>
          <SettingSection title="DATA">
            <Pressable
              onPress={handleClearAllNotes}
              style={[styles.settingRow, { backgroundColor: colors.backgroundSecondary }]}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.settingLabel, { color: colors.error }]}>Clear All Notes</Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </Text>
            </Pressable>
          </SettingSection>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(400).duration(300).springify()}>
          <SettingSection title="ABOUT">
            <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" showChevron={false} />
            <SettingRow icon="heart-outline" label="Made with ❤️" showChevron={false} />
          </SettingSection>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.screenPadding,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  settingLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  settingValue: {
    fontSize: Typography.sizes.sm,
  },
  optionGroup: {
    backgroundColor: 'transparent',
    marginBottom: Spacing.sm,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  optionButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});

