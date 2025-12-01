import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withRepeat, 
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';

const AnimatedG = Animated.createAnimatedComponent(G);

interface EmptyNotesIllustrationProps {
  size?: number;
}

export default function EmptyNotesIllustration({ size = 200 }: EmptyNotesIllustrationProps) {
  const colors = useThemeColor();
  
  // Floating animation for the notebook
  const translateY = useSharedValue(0);
  
  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [translateY]);

  const animatedProps = useAnimatedProps(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="noteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Decorative circles */}
        <Circle cx="40" cy="40" r="4" fill={colors.primary} opacity="0.15" />
        <Circle cx="160" cy="50" r="6" fill={colors.primary} opacity="0.1" />
        <Circle cx="170" cy="140" r="5" fill={colors.primary} opacity="0.12" />
        <Circle cx="30" cy="160" r="7" fill={colors.primary} opacity="0.08" />

        {/* Main notebook */}
        <AnimatedG animatedProps={animatedProps}>
          {/* Shadow */}
          <Rect
            x="55"
            y="145"
            width="90"
            height="8"
            rx="4"
            fill={colors.text}
            opacity="0.06"
          />

          {/* Notebook cover */}
          <Rect
            x="50"
            y="50"
            width="100"
            height="90"
            rx="8"
            fill="url(#noteGradient)"
            stroke={colors.primary}
            strokeWidth="2"
          />

          {/* Spiral binding */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Circle
              key={i}
              cx="60"
              cy={60 + i * 12}
              r="3"
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
            />
          ))}

          {/* Lines on notebook */}
          <Path
            d="M 75 70 L 135 70"
            stroke={colors.primary}
            strokeWidth="2"
            opacity="0.3"
            strokeLinecap="round"
          />
          <Path
            d="M 75 85 L 125 85"
            stroke={colors.primary}
            strokeWidth="2"
            opacity="0.3"
            strokeLinecap="round"
          />
          <Path
            d="M 75 100 L 135 100"
            stroke={colors.primary}
            strokeWidth="2"
            opacity="0.3"
            strokeLinecap="round"
          />
          <Path
            d="M 75 115 L 115 115"
            stroke={colors.primary}
            strokeWidth="2"
            opacity="0.3"
            strokeLinecap="round"
          />

          {/* Pencil */}
          <G transform="translate(120, 110) rotate(-45)">
            {/* Pencil body */}
            <Rect
              x="0"
              y="0"
              width="40"
              height="8"
              rx="1"
              fill={colors.primary}
              opacity="0.8"
            />
            {/* Pencil tip */}
            <Path
              d="M 0 0 L -6 4 L 0 8 Z"
              fill={colors.text}
              opacity="0.6"
            />
            {/* Eraser */}
            <Rect
              x="40"
              y="0"
              width="6"
              height="8"
              rx="1"
              fill="#FF6B6B"
              opacity="0.7"
            />
            {/* Metal band */}
            <Rect
              x="39"
              y="0"
              width="2"
              height="8"
              fill={colors.text}
              opacity="0.3"
            />
          </G>
        </AnimatedG>

        {/* Plus icon */}
        <Circle cx="100" cy="170" r="12" fill={colors.primary} opacity="0.15" />
        <Path
          d="M 100 165 L 100 175 M 95 170 L 105 170"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
