# 📝 NotesApp - Beautiful Note-Taking Experience

A modern, feature-rich note-taking application built with React Native and Expo, featuring beautiful animations, intuitive gestures, and a polished user experience.

## ✨ Features

### 🎨 Core Features
- **Rich Note Editor** - Title, content, and color-coded notes
- **Smart Organization** - Pin important notes, mark favorites
- **Powerful Search** - Full-text search with date filters and search history
- **Tag System** - Automatic hashtag extraction and tag cloud visualization
- **Customizable Settings** - Sort options, view modes, haptic feedback toggle

### 🎭 Animations & Interactions
- **Swipe Gestures** - Swipe right to delete, left to pin
- **Double-Tap to Favorite** - Quick favorite with heart animation
- **Pull-to-Refresh** - Refresh notes on home and search screens
- **Staggered List Animations** - Smooth entrance animations
- **Spring Physics** - Natural, bouncy animations throughout

### 🎯 User Experience
- **Empty State Illustrations** - Custom SVG animations for empty screens
- **Haptic Feedback** - Tactile responses for all interactions
- **Auto-Save** - Notes save automatically after 1 second
- **Dark Mode Support** - Automatic theme switching
- **Persistence** - All data stored locally with AsyncStorage

### 🏷️ Tag Features
- Write `#hashtags` anywhere in your notes
- Automatic extraction and storage
- Tag cloud with dynamic sizing based on usage
- Color-coded tags for visual organization
- Tap tags to search notes

## 🚀 Tech Stack

- **React Native** 0.81.5
- **Expo SDK** 54
- **React** 19.1.0
- **TypeScript** - Full type safety
- **Zustand** - State management
- **React Native Reanimated 4** - Advanced animations
- **FlashList** - Optimized list performance
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence
- **Expo Haptics** - Tactile feedback
- **React Native SVG** - Custom illustrations

## 📱 Screenshots

### Home Screen
- Grid/List view toggle
- Filter by All, Pinned, or Favorites
- Swipe actions for quick operations
- Pull-to-refresh

### Note Editor
- Auto-save functionality
- Color picker with 11 beautiful colors
- Hashtag support for tags
- Pin and favorite toggles

### Search Screen
- Real-time search with debouncing
- Date range filters (All, Today, Week, Month)
- Search history (last 10 searches)
- Result count display

### Tags Screen
- Tag cloud visualization
- Size indicates usage frequency
- Color-coded tags
- Tap to search by tag

### Settings Screen
- View mode (Grid/List)
- Sort options (Date/Title/Color)
- Haptic feedback toggle
- Clear all notes option

## 🎮 Gestures & Interactions

| Gesture | Action |
|---------|--------|
| **Tap** | Open note |
| **Double-Tap** | Toggle favorite (with heart animation) |
| **Swipe Right** | Delete note (with confirmation) |
| **Swipe Left** | Pin/Unpin note |
| **Pull Down** | Refresh notes |
| **Long Press** | Show context menu (on basic cards) |

## 🏗️ Project Structure

```
my-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Notes list
│   │   ├── search.tsx     # Search screen
│   │   ├── tags.tsx       # Tags cloud
│   │   └── settings.tsx   # Settings
│   ├── note/[id].tsx      # Note editor (dynamic route)
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── illustrations/     # SVG empty state illustrations
│   ├── SwipeableNoteCard.tsx
│   ├── DeleteConfirmationModal.tsx
│   ├── HeartAnimation.tsx
│   └── ...
├── store/                 # Zustand state management
│   └── notesStore.ts
├── constants/             # Theme and design tokens
│   └── theme.ts
├── hooks/                 # Custom hooks
│   └── useThemeColor.ts
└── types/                 # TypeScript definitions
    └── index.ts
```

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366F1)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **11 Note Colors**: From soft pastels to vibrant hues

### Typography
- **Font Sizes**: xs(12) → 5xl(48)
- **Weights**: Light, Regular, Medium, Semibold, Bold
- **Line Heights**: Tight, Normal, Relaxed, Loose

### Spacing
- **Scale**: 2xs(2) → 4xl(64)
- **Layout**: Screen padding, card padding

### Animations
- **Spring**: Bouncy, natural feel
- **Timing**: Smooth, consistent durations
- **Easing**: In/Out easing curves

## 🛠️ Development

### Prerequisites
```bash
node >= 18
npm or yarn
Expo CLI
```

### Installation
```bash
npm install
```

### Run Development
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Build
```bash
# Development build
npx expo prebuild

# Production build
eas build --platform all
```

## 📦 Key Dependencies

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-router": "~4.0.0",
  "zustand": "^5.0.3",
  "react-native-reanimated": "~4.0.0",
  "@shopify/flash-list": "1.8.0",
  "@react-native-async-storage/async-storage": "2.1.0",
  "expo-haptics": "~14.0.0",
  "react-native-svg": "15.9.0",
  "dayjs": "^1.11.13"
}
```

## 🎯 Performance Optimizations

- ✅ FlashList for efficient rendering
- ✅ Memoized callbacks and computed values
- ✅ Debounced search (300ms)
- ✅ Auto-save debouncing (1000ms)
- ✅ Optimized gesture handlers
- ✅ React Compiler enabled
- ✅ New Architecture ready

## 📝 Usage Tips

### Creating Notes
1. Tap the **+** button on any screen
2. Enter a title and content
3. Add `#hashtags` for organization
4. Choose a color from the palette
5. Notes auto-save as you type

### Organizing Notes
- **Pin**: Swipe left or use menu
- **Favorite**: Double-tap the note card
- **Delete**: Swipe right (with confirmation)
- **Search**: Use search screen or tap tags

### Tags
- Write `#work`, `#personal`, `#ideas` in notes
- Tags auto-extract and appear in Tags screen
- Tap tag to see all related notes
- Tag size indicates usage frequency

## 🚢 Deployment

### App Icons
Place your icons in `assets/images/`:
- `icon.png` (1024x1024)
- `splash-icon.png` (For splash screen)
- `favicon.png` (For web)

### App Configuration
Update `app.json`:
- Change `name` and `slug`
- Set bundle identifiers
- Configure splash screen colors

### Build for Production
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for stores
eas build --platform all
```

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ using React Native and Expo

---

**Version**: 1.0.0  
**Last Updated**: December 2025