import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useStore, TimeBlock } from '@/store/useStore';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function ArchiveScreen() {
  const { timeBlocks, updateBlockStatus } = useStore();
  const [now, setNow] = useState(Date.now());

  // Force re-render every second to update the "deleting in X" countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const archivedTasks = timeBlocks.filter(b => b.status === 'DONE' && b.archivedAt);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {archivedTasks.length === 0 ? (
          <View style={styles.emptyState}>
             <MaterialIcons name="inventory-2" size={48} color={Colors.surfaceHigh} />
             <Text style={styles.emptyText}>No archived tasks.</Text>
             <Text style={styles.emptySub}>Completed tasks will appear here and auto-delete after 5 minutes.</Text>
          </View>
        ) : (
          archivedTasks.map((task) => {
            const timeElapsed = now - (task.archivedAt || now);
            const timeLeft = Math.max(0, (5 * 60 * 1000) - timeElapsed);
            const mins = Math.floor(timeLeft / 60000);
            const secs = Math.floor((timeLeft % 60000) / 1000);
            
            return (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => updateBlockStatus(task.id, 'PENDING')} style={styles.undoBtn}>
                      <MaterialIcons name="undo" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <MaterialIcons name="archive" size={20} color={Colors.onSurfaceVariant} />
                  </View>
                </View>
                
                <View style={styles.cardDetails}>
                  <Text style={styles.dateText}>
                    Completed: {task.archivedAt ? format(task.archivedAt, 'hh:mm a') : 'Unknown'}
                  </Text>
                  <Text style={styles.deleteText}>
                    Deleting in {mins}:{secs.toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
    gap: 12,
  },
  emptyText: {
    color: Colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBright,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  undoBtn: {
    padding: 4,
    backgroundColor: Colors.surfaceBright,
    borderRadius: 6,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLowest,
    paddingTop: 12,
  },
  dateText: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  deleteText: {
    color: '#ff6b6b', // red indication
    fontSize: 12,
    fontWeight: '700',
  }
});
