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

interface EmptyTagsIllustrationProps {
  size?: number;
}

export default function EmptyTagsIllustration({ size = 200 }: EmptyTagsIllustrationProps) {
  const colors = useThemeColor();

  // Floating animation for tags
  const translateY1 = useSharedValue(0);
  const translateY2 = useSharedValue(0);
  const translateY3 = useSharedValue(0);

  React.useEffect(() => {
    translateY1.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    translateY2.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    translateY3.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [translateY1, translateY2, translateY3]);

  const animatedProps1 = useAnimatedProps(() => ({
    transform: [{ translateY: translateY1.value }],
  }));

  const animatedProps2 = useAnimatedProps(() => ({
    transform: [{ translateY: translateY2.value }],
  }));

  const animatedProps3 = useAnimatedProps(() => ({
    transform: [{ translateY: translateY3.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="tag1Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="tag2Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="tag3Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* Decorative dots */}
        <Circle cx="30" cy="50" r="4" fill={colors.primary} opacity="0.1" />
        <Circle cx="170" cy="60" r="5" fill="#8B5CF6" opacity="0.12" />
        <Circle cx="165" cy="150" r="4" fill="#10B981" opacity="0.1" />
        <Circle cx="35" cy="145" r="6" fill={colors.primary} opacity="0.08" />

        {/* Tag 1 - Large, center-left */}
        <AnimatedG animatedProps={animatedProps1}>
          <Path
            d="M 50 80 L 90 80 L 100 90 L 90 100 L 50 100 Q 45 100 45 95 L 45 85 Q 45 80 50 80 Z"
            fill="url(#tag1Gradient)"
            stroke={colors.primary}
            strokeWidth="2"
          />
          <Circle cx="55" cy="90" r="3" fill={colors.primary} opacity="0.5" />
          {/* String hole */}
          <Circle cx="92" cy="90" r="2.5" fill={colors.background} stroke={colors.primary} strokeWidth="1" />
        </AnimatedG>

        {/* Tag 2 - Medium, top-right */}
        <AnimatedG animatedProps={animatedProps2}>
          <Path
            d="M 115 60 L 150 60 L 158 68 L 150 76 L 115 76 Q 111 76 111 72 L 111 64 Q 111 60 115 60 Z"
            fill="url(#tag2Gradient)"
            stroke="#8B5CF6"
            strokeWidth="2"
          />
          <Circle cx="119" cy="68" r="2.5" fill="#8B5CF6" opacity="0.5" />
          {/* String hole */}
          <Circle cx="152" cy="68" r="2" fill={colors.background} stroke="#8B5CF6" strokeWidth="1" />
        </AnimatedG>

        {/* Tag 3 - Small, bottom-right */}
        <AnimatedG animatedProps={animatedProps3}>
          <Path
            d="M 110 115 L 140 115 L 147 122 L 140 129 L 110 129 Q 106 129 106 125 L 106 119 Q 106 115 110 115 Z"
            fill="url(#tag3Gradient)"
            stroke="#10B981"
            strokeWidth="2"
          />
          <Circle cx="114" cy="122" r="2" fill="#10B981" opacity="0.5" />
          {/* String hole */}
          <Circle cx="142" cy="122" r="1.8" fill={colors.background} stroke="#10B981" strokeWidth="1" />
        </AnimatedG>

        {/* Hash symbol */}
        <G opacity="0.2">
          <Path
            d="M 65 140 L 70 160 M 75 140 L 80 160 M 60 148 L 85 148 M 62 154 L 87 154"
            stroke={colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>

        {/* Plus icon for adding tags */}
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
