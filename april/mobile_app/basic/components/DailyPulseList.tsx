import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useStore, TimeBlock } from '@/store/useStore';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';

export function DailyPulseList() {
  const { timeBlocks, updateBlockStatus } = useStore();

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const toggleStatus = (block: TimeBlock) => {
    const newStatus = block.status === 'DONE' ? 'PENDING' : 'DONE';
    updateBlockStatus(block.id, newStatus);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Pulse</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMM d')}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.viewLog}>VIEW LOG</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {timeBlocks
          .filter(block => block.status !== 'DONE')
          .map((block, index) => {
          const isDone = block.status === 'DONE';
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
                <View>
                  <Text style={[styles.cardTitle, isDone && styles.textStrikethrough]}>
                    {block.title}
                  </Text>
                  <Text style={styles.cardTime}>
                    {format(new Date(block.startTime), 'hh:mm a')} — {format(new Date(block.endTime), 'hh:mm a')}
                  </Text>
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
                  <MaterialIcons name="more-vert" size={18} color={Colors.onSurfaceVariant} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
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
  viewLog: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 12,
    padding: 20,
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
    gap: 16,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 999,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
  },
  cardTime: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkBtn: {
    padding: 4,
    backgroundColor: Colors.surfaceBright,
    borderRadius: 6,
  }
});
