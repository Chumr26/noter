import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
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

interface EmptySearchIllustrationProps {
  size?: number;
}

export default function EmptySearchIllustration({ size = 200 }: EmptySearchIllustrationProps) {
  const colors = useThemeColor();

  // Magnifying glass animation - slight rotation
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [rotation]);

  const animatedProps = useAnimatedProps(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Decorative search dots */}
        <Circle cx="50" cy="60" r="3" fill={colors.primary} opacity="0.15" />
        <Circle cx="150" cy="70" r="4" fill={colors.primary} opacity="0.12" />
        <Circle cx="160" cy="130" r="3" fill={colors.primary} opacity="0.1" />
        <Circle cx="40" cy="140" r="5" fill={colors.primary} opacity="0.08" />

        {/* Question marks */}
        <G opacity="0.1">
          <Path
            d="M 35 50 Q 35 45 40 45 Q 45 45 45 50 Q 45 55 40 58 L 40 62 M 40 68 L 40 72"
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 160 45 Q 160 40 165 40 Q 170 40 170 45 Q 170 50 165 53 L 165 57 M 165 63 L 165 67"
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* Main magnifying glass */}
        <AnimatedG animatedProps={animatedProps} origin="100, 100">
          {/* Glass circle with gradient */}
          <Circle
            cx="100"
            cy="100"
            r="40"
            fill="url(#searchGradient)"
            stroke={colors.primary}
            strokeWidth="3"
          />

          {/* Inner glass reflection */}
          <Path
            d="M 75 85 Q 80 80 90 82"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Handle */}
          <Path
            d="M 128 128 L 155 155"
            stroke={colors.primary}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Handle tip */}
          <Circle cx="155" cy="155" r="5" fill={colors.primary} />

          {/* Search icon inside */}
          <G opacity="0.3">
            <Path
              d="M 90 95 L 110 95"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M 90 105 L 105 105"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </G>
        </AnimatedG>

        {/* Floating particles */}
        <G opacity="0.15">
          <Circle cx="60" cy="100" r="2" fill={colors.primary} />
          <Circle cx="140" cy="90" r="2.5" fill={colors.primary} />
          <Circle cx="70" cy="130" r="2" fill={colors.primary} />
        </G>
      </Svg>
    </View>
  );
}
