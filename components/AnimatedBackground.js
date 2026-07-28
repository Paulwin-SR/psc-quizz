import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const { width, height } = Dimensions.get('window');

// A single floating study icon
const FloatingIcon = ({ name, color, size, startPos, animDelay, duration }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(animDelay),
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, Math.random() * 50 - 25, Math.random() * 100 - 50]
  });
  const translateY = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -Math.random() * 100 - 50, -Math.random() * 200 - 100]
  });
  const rotate = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.iconContainer,
        {
          top: startPos.y,
          left: startPos.x,
          transform: [{ translateX }, { translateY }, { rotate }],
        }
      ]}
    >
      <View>
        <Ionicons name={name} size={size} color={color} />
      </View>
    </Animated.View>
  );
};

export default function AnimatedBackground({ children }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0', '#f8fafc']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Floating Study Icons */}
      <FloatingIcon name="book" color={COLORS.primary} size={120} startPos={{ x: width * 0.1, y: height * 0.2 }} animDelay={0} duration={14000} />
      <FloatingIcon name="school" color={COLORS.accent} size={150} startPos={{ x: width * 0.6, y: height * 0.5 }} animDelay={2000} duration={18000} />
      <FloatingIcon name="library" color={'#8B5CF6'} size={140} startPos={{ x: width * 0.2, y: height * 0.7 }} animDelay={1000} duration={16000} />
      <FloatingIcon name="pencil" color={'#10B981'} size={100} startPos={{ x: width * 0.7, y: height * 0.1 }} animDelay={3000} duration={15000} />
      <FloatingIcon name="globe" color={'#3B82F6'} size={130} startPos={{ x: -20, y: height * 0.8 }} animDelay={4000} duration={20000} />
      
      <View style={StyleSheet.absoluteFillObject}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    position: 'absolute',
    opacity: 0.15,
    zIndex: -1,
  }
});
