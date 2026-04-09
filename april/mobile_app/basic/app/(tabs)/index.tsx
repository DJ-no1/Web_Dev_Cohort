import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { FocusSessionTimer } from '@/components/FocusSessionTimer';
import { ProductivityStreak } from '@/components/ProductivityStreak';
import { DailyPulseList } from '@/components/DailyPulseList';
import { SecondaryInsights } from '@/components/SecondaryInsights';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@/store/useStore';

// ── Time stepper (for optional start/end time) ──────────────────────────────
function TimeStepper({
  label,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  label: string;
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}) {
  const incHour = () => onHourChange((hour + 1) % 24);
  const decHour = () => onHourChange((hour - 1 + 24) % 24);
  const incMin = () => onMinuteChange((minute + 5) % 60);
  const decMin = () => onMinuteChange((minute - 5 + 60) % 60);

  return (
    <View style={ts.container}>
      <Text style={ts.label}>{label}</Text>
      <View style={ts.row}>
        <View style={ts.unit}>
          <TouchableOpacity onPress={incHour} hitSlop={8}>
            <MaterialIcons name="keyboard-arrow-up" size={18} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={ts.value}>{String(hour).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={decHour} hitSlop={8}>
            <MaterialIcons name="keyboard-arrow-down" size={18} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
        <Text style={ts.colon}>:</Text>
        <View style={ts.unit}>
          <TouchableOpacity onPress={incMin} hitSlop={8}>
            <MaterialIcons name="keyboard-arrow-up" size={18} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={ts.value}>{String(minute).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={decMin} hitSlop={8}>
            <MaterialIcons name="keyboard-arrow-down" size={18} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const ts = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  label: { color: Colors.onSurfaceVariant, fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  unit: { alignItems: 'center' },
  value: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 32,
    textAlign: 'center',
    overflow: 'hidden',
  },
  colon: { color: Colors.onSurfaceVariant, fontSize: 18, fontWeight: '600', marginHorizontal: 1 },
});

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { addTask } = useStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [useTime, setUseTime] = React.useState(false);

  const now = new Date();
  const [startHour, setStartHour] = React.useState(now.getHours());
  const [startMinute, setStartMinute] = React.useState(0);
  const [endHour, setEndHour] = React.useState((now.getHours() + 1) % 24);
  const [endMinute, setEndMinute] = React.useState(0);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    let startTime: string | undefined;
    let endTime: string | undefined;

    if (useTime) {
      const s = new Date();
      s.setHours(startHour, startMinute, 0, 0);
      const e = new Date();
      e.setHours(endHour, endMinute, 0, 0);
      startTime = s.toISOString();
      endTime = e.toISOString();
    }

    addTask(newTaskTitle.trim(), startTime, endTime);
    setNewTaskTitle('');
    setIsAdding(false);
    setUseTime(false);
    Keyboard.dismiss();
  };

  const handleCancel = () => {
    setNewTaskTitle('');
    setIsAdding(false);
    setUseTime(false);
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <FocusSessionTimer />
        <View style={{ height: 24 }} />
        <DailyPulseList />
        <View style={{ height: 24 }} />
        <SecondaryInsights />
        <View style={{ height: 24 }} />
        <ProductivityStreak />
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Floating "NEW TASK" button ────────────────────────────────────── */}
      {!isAdding && (
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(100)}
          style={styles.floatingContainer}
        >
          <TouchableOpacity
            style={styles.addBlockBtn}
            activeOpacity={0.8}
            onPress={() => setIsAdding(true)}
          >
            <MaterialIcons name="add" size={20} color={Colors.primary} />
            <Text style={styles.addBlockText}>NEW TASK</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── Add Task Modal (centered, stays above keyboard) ──────────────── */}
      <Modal
        visible={isAdding}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={handleCancel}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalCard}>
                  {/* Header */}
                  <Text style={styles.modalTitle}>New Task</Text>

                  {/* Title input */}
                  <TextInput
                    style={styles.input}
                    placeholder="What do you need to focus on?"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    returnKeyType="done"
                    autoFocus
                    onSubmitEditing={handleAddTask}
                  />

                  {/* Time toggle */}
                  <TouchableOpacity
                    onPress={() => setUseTime(!useTime)}
                    style={styles.timeToggle}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={useTime ? 'access-time-filled' : 'access-time'}
                      size={18}
                      color={useTime ? Colors.primary : Colors.onSurfaceVariant}
                    />
                    <Text style={[styles.timeToggleText, useTime && { color: Colors.primary }]}>
                      {useTime ? 'Time set' : 'Add time (optional)'}
                    </Text>
                  </TouchableOpacity>

                  {/* Time pickers (visible when toggled) */}
                  {useTime && (
                    <View style={styles.timeRow}>
                      <TimeStepper
                        label="Start"
                        hour={startHour}
                        minute={startMinute}
                        onHourChange={setStartHour}
                        onMinuteChange={setStartMinute}
                      />
                      <Text style={styles.timeDash}>→</Text>
                      <TimeStepper
                        label="End"
                        hour={endHour}
                        minute={endMinute}
                        onHourChange={setEndHour}
                        onMinuteChange={setEndMinute}
                      />
                    </View>
                  )}

                  {/* Action buttons */}
                  <View style={styles.formActions}>
                    <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} activeOpacity={0.7}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAddTask}
                      style={[styles.addBtn, !newTaskTitle.trim() && styles.addBtnDisabled]}
                      activeOpacity={0.8}
                      disabled={!newTaskTitle.trim()}
                    >
                      <MaterialIcons name="add" size={18} color={Colors.background} />
                      <Text style={styles.addBtnText}>Add Task</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  // ── Floating button ──────────────────────────────────────────────────────
  floatingContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addBlockBtn: {
    backgroundColor: Colors.surfaceBright,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  addBlockText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.5,
  },
  // ── Modal overlay ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    gap: 16,
    borderCurve: 'continuous',
  },
  modalTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  input: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  timeToggleText: {
    color: Colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 4,
  },
  timeDash: {
    color: Colors.onSurfaceVariant,
    fontSize: 18,
    marginTop: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBright,
  },
  cancelText: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
