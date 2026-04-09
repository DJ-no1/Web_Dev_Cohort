import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '@/constants/theme';
import { useStore, TimeBlock } from '@/store/useStore';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

export function DailyPulseList() {
  const { timeBlocks, updateBlockStatus } = useStore();

  const handleOpenLink = async (url: string) => {
    await Linking.openURL(url);
  };

  const toggleStatus = (block: TimeBlock) => {
    const newStatus = block.status === 'DONE' ? 'PENDING' : 'DONE';
    updateBlockStatus(block.id, newStatus);
  };

  const activeTasks = timeBlocks.filter(block => block.status !== 'DONE');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Pulse</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
        </View>
      </View>

      {activeTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="check-circle-outline" size={32} color={Colors.surfaceBright} />
          <Text style={styles.emptyText}>No tasks yet</Text>
          <Text style={styles.emptySub}>Tap &quot;NEW TASK&quot; below to add one</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {activeTasks.map((block) => {
            const isDone = block.status === 'DONE';
            const hasTime = block.startTime && block.endTime;
            return (
              <TouchableOpacity 
                key={block.id} 
                style={[
                  styles.card,
                  isDone && styles.cardDone
                ]}
                onPress={() => toggleStatus(block)}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.indicator, { backgroundColor: isDone ? Colors.outlineVariant : Colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, isDone && styles.textStrikethrough]}>
                      {block.title}
                    </Text>
                    {hasTime && (
                      <Text style={styles.cardTime}>
                        {format(new Date(block.startTime!), 'hh:mm a')} — {format(new Date(block.endTime!), 'hh:mm a')}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardRight}>
                  {block.linkUrl && (
                    <TouchableOpacity onPress={() => handleOpenLink(block.linkUrl!)} style={styles.linkBtn}>
                      <MaterialIcons name={block.isPdf ? "picture-as-pdf" : "link"} size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                  
                  {isDone ? (
                    <MaterialIcons name="check-circle" size={18} color={Colors.onSurfaceVariant} />
                  ) : (
                    <MaterialIcons name="radio-button-unchecked" size={18} color={Colors.onSurfaceVariant} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  title: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  date: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  emptySub: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDone: {
    opacity: 0.6,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  indicator: {
    width: 4,
    height: 28,
    borderRadius: 999,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  cardTime: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  linkBtn: {
    padding: 4,
    backgroundColor: Colors.surfaceBright,
    borderRadius: 6,
  }
});
