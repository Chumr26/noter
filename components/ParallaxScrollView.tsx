import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';

const HEADER_HEIGHT = 250;

interface ParallaxScrollViewProps {
  headerImage: ReactNode;
  headerBackgroundColor?: string;
  children: ReactNode;
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  headerImage,
  headerBackgroundColor,
  children,
}) => {
  const colors = useThemeColor();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  const headerOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollOffset.value,
        [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
        [1, 0.5, 0]
      ),
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={{ backgroundColor: colors.background }}
    >
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor },
          headerAnimatedStyle,
        ]}
      >
        <Animated.View style={[styles.headerContent, headerOpacityStyle]}>
          {headerImage}
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.content, { backgroundColor: colors.background }]}>
        {children}
      </Animated.View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
});
