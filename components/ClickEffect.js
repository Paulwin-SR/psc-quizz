import React, { useState, useCallback, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { COLORS } from '../theme';

const Ripple = ({ x, y, onAnimationEnd }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => {
      onAnimationEnd();
    });
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        {
          left: x - 25,
          top: y - 25,
          transform: [{ scale }],
          opacity,
        }
      ]}
    />
  );
};

export default function ClickEffectWrapper({ children }) {
  const [ripples, setRipples] = useState([]);
  const idCounter = useRef(0);

  const handleTouch = useCallback((e) => {
    const { pageX, pageY } = e.nativeEvent;
    const newId = idCounter.current++;
    
    setRipples(prev => [...prev, { id: newId, x: pageX, y: pageY }]);
  }, []);

  const removeRipple = useCallback((id) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <View 
      style={{ flex: 1 }} 
      onPointerDown={handleTouch}
      onTouchStart={handleTouch}
    >
      {children}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {ripples.map(r => (
          <Ripple 
            key={r.id} 
            x={r.x} 
            y={r.y} 
            onAnimationEnd={() => removeRipple(r.id)} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '40', // semi transparent
    zIndex: 9999,
  }
});
