import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';

const GRID_SIZE = 10; // 10 columns
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = GRID_SIZE * DAYS_PER_WEEK;

export function ProductivityStreak() {
  const { settings } = useStore();
  const dailyStreaks = settings.dailyStreaks || {};

  // Generate the last 70 days
  const today = startOfDay(new Date());
  const startDate = subDays(today, TOTAL_DAYS - 1);
  const days = eachDayOfInterval({ start: startDate, end: today });

  // Group into weeks (columns)
  const columns = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    columns.push(days.slice(i * DAYS_PER_WEEK, (i + 1) * DAYS_PER_WEEK));
  }

  const getBlockColor = (score: number) => {
    if (score === 0 || score === undefined) return 'rgba(255, 255, 255, 0.05)';
    
    // Scale 1-100 to 0.1-1.0
    // But the user said "10 different of Gray 10 % being the lowest and 100% being the white"
    // So 10% opacity corresponds to the lowest "active" color.
    const opacity = Math.max(0.1, Math.min(1.0, score / 100));
    return `rgba(255, 255, 255, ${opacity})`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PRODUCTIVITY STREAK</Text>
        <Text style={styles.subtitle}>Last {TOTAL_DAYS} days activity</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {columns.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.column}>
              {week.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const score = dailyStreaks[dateKey] || 0;
                return (
                  <View 
                    key={dateKey} 
                    style={[
                      styles.block, 
                      { backgroundColor: getBlockColor(score) }
                    ]} 
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 25, 50, 75, 100].map((sc) => (
          <View key={sc} style={[styles.miniBlock, { backgroundColor: getBlockColor(sc) }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    gap: 4,
  },
  block: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 6,
  },
  legendText: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    marginHorizontal: 4,
  },
  miniBlock: {
    width: 10,
    height: 10,
    borderRadius: 2,
  }
});
