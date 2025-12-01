/**
 * Design System & Theme Configuration
 * Comprehensive theme for the Notes App with support for light and dark modes
 */

export const Colors = {
  light: {
    // Primary Colors
    primary: '#6366F1', // Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    
    // Background Colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    
    // Text Colors
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // UI Elements
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
    
    // Interactive
    tint: '#6366F1',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#6366F1',
    
    // Semantic Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Note Colors (Pastel Palette)
    noteColors: {
      default: '#FFFFFF',
      red: '#FEE2E2',
      orange: '#FFEDD5',
      yellow: '#FEF3C7',
      green: '#D1FAE5',
      teal: '#CCFBF1',
      blue: '#DBEAFE',
      indigo: '#E0E7FF',
      purple: '#EDE9FE',
      pink: '#FCE7F3',
      gray: '#F3F4F6',
    },
    
    // Special Effects
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shimmer: 'rgba(255, 255, 255, 0.3)',
  },
  
  dark: {
    // Primary Colors
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    primaryDark: '#6366F1',
    
    // Background Colors
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    
    // Text Colors
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    
    // UI Elements
    border: '#374151',
    borderLight: '#4B5563',
    divider: '#374151',
    
    // Interactive
    tint: '#818CF8',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#818CF8',
    
    // Semantic Colors
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    
    // Note Colors (Darker Pastels)
    noteColors: {
      default: '#1F2937',
      red: '#991B1B',
      orange: '#9A3412',
      yellow: '#854D0E',
      green: '#065F46',
      teal: '#115E59',
      blue: '#1E3A8A',
      indigo: '#3730A3',
      purple: '#5B21B6',
      pink: '#831843',
      gray: '#374151',
    },
    
    // Special Effects
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shimmer: 'rgba(255, 255, 255, 0.1)',
  },
};

// Typography Scale
export const Typography = {
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Font Families (using system fonts)
  families: {
    regular: 'System',
    mono: 'Menlo',
  },
};

// Spacing System (4px base unit)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border Radius
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Animation Timings
export const Animations = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  
  // Spring Configs (for Reanimated)
  springs: {
    gentle: {
      damping: 20,
      stiffness: 90,
    },
    bouncy: {
      damping: 15,
      stiffness: 150,
    },
    snappy: {
      damping: 25,
      stiffness: 200,
    },
  },
  
  // Easing
  easing: {
    linear: [0.0, 0.0, 1.0, 1.0],
    ease: [0.25, 0.1, 0.25, 1.0],
    easeIn: [0.42, 0.0, 1.0, 1.0],
    easeOut: [0.0, 0.0, 0.58, 1.0],
    easeInOut: [0.42, 0.0, 0.58, 1.0],
  },
};

// Layout
export const Layout = {
  // Screen padding
  screenPadding: Spacing.base,
  
  // Card sizes
  cardMinHeight: 120,
  cardMaxHeight: 300,
  
  // Icon sizes
  iconSizes: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
  
  // Button sizes
  buttonSizes: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // FAB size
  fabSize: 56,
  
  // Header height
  headerHeight: 60,
  
  // Tab bar height
  tabBarHeight: 60,
};

// Helper function to get theme colors based on scheme
export const getThemeColors = (scheme: 'light' | 'dark') => {
  return Colors[scheme];
};

// Export note color keys for easy iteration
export const NOTE_COLOR_KEYS = [
  'default',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'indigo',
  'purple',
  'pink',
  'gray',
] as const;

export type NoteColorKey = typeof NOTE_COLOR_KEYS[number];
