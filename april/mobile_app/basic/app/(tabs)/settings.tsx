import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@/store/useStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { settings, updateSettings } = useStore();
  
  const isTimerRunning = settings.isTimerConfigured && settings.timerPausedAt === null;

  const handleDaysChange = (text: string) => {
    if (isTimerRunning) return;
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    updateSettings({ countdownDays: isNaN(parsed) ? 0 : parsed });
  };

  const handleHoursChange = (text: string) => {
    if (isTimerRunning) return;
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    updateSettings({ countdownHours: isNaN(parsed) ? 0 : Math.min(23, parsed) });
  };

  const handleMinutesChange = (text: string) => {
    if (isTimerRunning) return;
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    updateSettings({ countdownMinutes: isNaN(parsed) ? 0 : Math.min(59, parsed) });
  };

  const handleTogglePause = () => {
    if (settings.timerPausedAt === null) {
       updateSettings({ timerPausedAt: Date.now() });
    } else {
       const nowMs = Date.now();
       const pausedDuration = nowMs - settings.timerPausedAt;
       updateSettings({ 
         timerPausedAt: null, 
         timerStartAt: settings.timerStartAt + pausedDuration 
       });
    }
  };

  const handleResetTimer = () => {
    updateSettings({ 
      timerStartAt: Date.now(), 
      timerPausedAt: null,
      isTimerConfigured: false,
      countdownDays: 30,
      countdownHours: 0,
      countdownMinutes: 0
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── COUNTDOWN CONFIGURATION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COUNTDOWN CONFIGURATION</Text>

          {/* Duration row */}
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Target Duration</Text>
            <Text style={styles.settingDesc}>Set the total countdown time</Text>

            <View style={styles.durationRow}>
              {/* Days */}
              <View style={styles.durationBlock}>
                <TextInput
                  value={settings.countdownDays.toString()}
                  onChangeText={handleDaysChange}
                  keyboardType="number-pad"
                  style={[styles.durationInput, isTimerRunning && styles.inputDisabled]}
                  editable={!isTimerRunning}
                  maxLength={4}
                  selectTextOnFocus
                />
                <Text style={styles.durationUnit}>DAYS</Text>
              </View>

              <Text style={styles.durationColon}>:</Text>

              {/* Hours */}
              <View style={styles.durationBlock}>
                <TextInput
                  value={settings.countdownHours.toString().padStart(2, '0')}
                  onChangeText={handleHoursChange}
                  keyboardType="number-pad"
                  style={[styles.durationInput, isTimerRunning && styles.inputDisabled]}
                  editable={!isTimerRunning}
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.durationUnit}>HRS</Text>
              </View>

              <Text style={styles.durationColon}>:</Text>

              {/* Minutes */}
              <View style={styles.durationBlock}>
                <TextInput
                  value={settings.countdownMinutes.toString().padStart(2, '0')}
                  onChangeText={handleMinutesChange}
                  keyboardType="number-pad"
                  style={[styles.durationInput, isTimerRunning && styles.inputDisabled]}
                  editable={!isTimerRunning}
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.durationUnit}>MIN</Text>
              </View>
            </View>

            {isTimerRunning && (
              <Text style={styles.runningHint}>⏱ Timer is running — pause to edit</Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleTogglePause}>
              <MaterialIcons
                name={settings.timerPausedAt ? 'play-arrow' : 'pause'}
                size={22}
                color={Colors.primary}
              />
              <Text style={styles.actionBtnText}>
                {settings.timerPausedAt ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={handleResetTimer}
            >
              <MaterialIcons name="refresh" size={22} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ABOUT ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.settingCardRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.valueText}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  // Card with stacked (column) layout for the duration pickers
  settingCard: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  // Card with row layout (for version)
  settingCardRow: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
  // Duration picker row
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  durationBlock: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  durationInput: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: '100%',
  },
  inputDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.6,
  },
  durationUnit: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  durationColon: {
    color: Colors.onSurfaceVariant,
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 18,
  },
  runningHint: {
    color: Colors.primary,
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceHigh,
  },
  actionBtnText: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  valueText: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
});
