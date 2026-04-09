import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';

export function SecondaryInsights() {
  const { settings } = useStore();

  return (
    <View style={styles.container}>
      <View style={styles.fullCard}>
        <MaterialIcons name="bolt" size={24} color={Colors.onSurfaceVariant} style={styles.icon} />
        <View>
          <Text style={styles.percentText}>{settings.productivityScore}%</Text>
          <Text style={styles.label}>PRODUCTIVITY SCORE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
  },
  fullCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    backgroundColor: Colors.surfaceHigh,
    padding: 12,
    borderRadius: 16,
  },
  percentText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
  },
  label: {
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 2,
  }
});
