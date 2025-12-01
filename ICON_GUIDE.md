# App Icon Guide

## Required Assets

### 1. App Icon (`icon.png`)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Location**: `assets/images/icon.png`
- **Design**: 
  - Primary color: `#6366F1` (Indigo)
  - Concept: Notepad or document icon with rounded corners
  - Style: Modern, minimal, flat design
  - Ensure readability at small sizes (60x60px)

### 2. Adaptive Icon (Android)
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Location**: `assets/images/adaptive-icon.png`
- **Design**:
  - Safe zone: 66% of canvas (avoid edges)
  - Background color set in app.json: `#6366F1`
  - Foreground: White notepad icon centered

### 3. Splash Screen Icon (`splash-icon.png`)
- **Size**: 1242x2436 px (or larger)
- **Format**: PNG
- **Location**: `assets/images/splash.png`
- **Design**:
  - Background: `#6366F1` (light mode), `#1F2937` (dark mode)
  - Icon: Centered notepad icon (white color)
  - Keep it simple - users see this briefly

### 4. Favicon (`favicon.png`)
- **Size**: 48x48 px
- **Format**: PNG with transparency
- **Location**: `assets/images/favicon.png`
- **Design**: Simplified version of app icon

## Design Recommendations

### Color Palette
- **Primary**: `#6366F1` (Indigo 500)
- **Accent**: `#818CF8` (Indigo 400)
- **Background**: White or transparent
- **Icon Color**: White for contrast

### Icon Concept Ideas
1. **Notepad with Pen**
   - Simple notepad outline
   - Pen or pencil overlay
   - Rounded corners (20% radius)

2. **Stacked Notes**
   - 2-3 overlapping note sheets
   - Slight shadow for depth
   - Top note with lines

3. **Text Document**
   - Document with visible text lines
   - Folded corner (top-right)
   - Hashtag symbol for tags feature

### Design Tools
- **Figma**: Free, browser-based, export at any size
- **Canva**: Templates for app icons
- **Adobe Illustrator**: Professional vector design
- **Affinity Designer**: One-time purchase alternative

## Export Settings

### For iOS
- **Format**: PNG
- **Color Profile**: sRGB
- **Compression**: Lossless PNG-24
- **Transparency**: Yes (for icon.png)

### For Android
- **Format**: PNG
- **Color Profile**: sRGB
- **Compression**: Lossless PNG-24
- **Transparency**: Yes (for adaptive-icon.png foreground)

## Implementation Steps

1. **Create Icons**
   ```bash
   # Place your designed icons in assets/images/
   # icon.png (1024x1024)
   # adaptive-icon.png (1024x1024)
   # splash.png (1242x2436 or larger)
   # favicon.png (48x48)
   ```

2. **Verify app.json Configuration**
   ```json
   {
     "icon": "./assets/images/icon.png",
     "splash": {
       "image": "./assets/images/splash.png",
       "backgroundColor": "#6366F1"
     },
     "ios": {
       "icon": "./assets/images/icon.png"
     },
     "android": {
       "icon": "./assets/images/icon.png",
       "adaptiveIcon": {
         "foregroundImage": "./assets/images/adaptive-icon.png",
         "backgroundColor": "#6366F1"
       }
     },
     "web": {
       "favicon": "./assets/images/favicon.png"
     }
   }
   ```

3. **Test Icons**
   ```bash
   # Clear cache and rebuild
   expo start -c
   
   # Test on devices
   expo start --ios
   expo start --android
   ```

4. **Validate on Devices**
   - Check home screen appearance (iOS/Android)
   - Verify adaptive icon on Android (try different launchers)
   - Test splash screen on both light/dark modes
   - Check app switcher/multitasking view

## Quick Prototyping

### Using Figma (Free)
1. Create 1024x1024 frame
2. Add background: `#6366F1`
3. Add icon shape with 180px corner radius
4. Add white notepad illustration (centered)
5. Export as PNG @ 1x

### Using Canva
1. Search "App Icon" templates
2. Customize with brand colors
3. Export at 1024x1024

## Testing Checklist

- [ ] Icon appears correctly on iOS home screen
- [ ] Icon appears correctly on Android home screen
- [ ] Adaptive icon works on Android (test multiple launchers)
- [ ] Splash screen displays properly (light mode)
- [ ] Splash screen displays properly (dark mode)
- [ ] Favicon loads on web version
- [ ] Icon looks good at small sizes (Settings app)
- [ ] Icon is recognizable in app switcher
- [ ] No pixelation or compression artifacts
- [ ] Colors match brand identity

## Resources

- [Expo Icon Guide](https://docs.expo.dev/develop/user-interface/app-icons/)
- [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [Icon Kitchen](https://icon.kitchen/) - Free icon generator
