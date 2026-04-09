import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface WheelPickerProps {
  data: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  label: string;
  itemHeight?: number;
  visibleItems?: number;
  circular?: boolean;
}

export function WheelPicker({
  data,
  selectedValue,
  onValueChange,
  label,
  itemHeight = 50,
  visibleItems = 3,
  circular = true,
}: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  
  // For circular scrolling, we repeat the data set multiple times
  const REPETITIONS = circular ? 100 : 1;
  const paddingCount = Math.floor(visibleItems / 2);
  
  const paddedData = circular 
    ? [...Array(paddingCount).fill(-1), ...Array(REPETITIONS).fill(data).flat(), ...Array(paddingCount).fill(-1)]
    : [...Array(paddingCount).fill(-1), ...data, ...Array(paddingCount).fill(-1)];

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(yOffset / itemHeight);
    
    // Adjust index to skip padding
    const adjustedIndex = rawIndex;
    
    if (circular) {
      const dataIndex = adjustedIndex % data.length;
      const value = data[dataIndex];
      
      if (value !== undefined && value !== selectedValue) {
        onValueChange(value);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }

      // If we're getting close to the edges of our large repeated list, jump back to the middle
      if (rawIndex < data.length * 20 || rawIndex > data.length * 80) {
        const middleOffset = (data.length * (REPETITIONS / 2) + dataIndex) * itemHeight;
        scrollRef.current?.scrollTo({
          y: middleOffset,
          animated: false,
        });
      }
    } else {
      const value = data[adjustedIndex];
      if (value !== undefined && value !== selectedValue) {
        onValueChange(value);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
  };

  useEffect(() => {
    const dataIndex = data.indexOf(selectedValue);
    if (dataIndex !== -1) {
      const initialRep = circular ? REPETITIONS / 2 : 0;
      const initialOffset = (data.length * initialRep + dataIndex) * itemHeight;
      
      // Initial jump to the middle section for circular picker
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: initialOffset,
          animated: false,
        });
      }, 50);
    }
  }, []); // Only on mount

  const renderItem = (item: number, index: number) => {
    if (item === -1) {
      return <View key={`pad-${index}`} style={{ height: itemHeight }} />;
    }

    const isSelected = item === selectedValue;

    return (
      <View key={`${item}-${index}`} style={[styles.item, { height: itemHeight }]}>
        <Text
          style={[
            styles.itemText,
            isSelected && styles.selectedItemText,
          ]}
        >
          {item}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: itemHeight * visibleItems }]}>
      <View style={[styles.highlight, { height: itemHeight, top: itemHeight * paddingCount }]} />
      
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        removeClippedSubviews={true}
      >
        {paddedData.map((item, index) => renderItem(item, index))}
      </ScrollView>

      {/* Fading Overlays */}
      <LinearGradient
        colors={[Colors.surfaceLowest, 'transparent']}
        style={[styles.overlay, styles.topOverlay, { height: itemHeight }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', Colors.surfaceLowest]}
        style={[styles.overlay, styles.bottomOverlay, { height: itemHeight }]}
        pointerEvents="none"
      />
      
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  item: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    color: Colors.onSurfaceVariant,
    fontSize: 20,
    fontWeight: '500',
    opacity: 0.3,
  },
  selectedItemText: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '800',
    opacity: 1,
  },
  highlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 8,
    zIndex: -1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topOverlay: {
    top: 0,
  },
  bottomOverlay: {
    bottom: 20, 
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
    backgroundColor: Colors.surfaceLowest,
    paddingHorizontal: 4,
    letterSpacing: 1,
  },
});
