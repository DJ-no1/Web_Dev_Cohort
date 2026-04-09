import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@/store/useStore';
import { MaterialIcons } from '@expo/vector-icons';

// Handle notifications conditionally for Android Expo Go support
const isAndroid = Platform.OS === 'android';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const notificationsSupported = Platform.OS !== 'web' && (!isAndroid || !isExpoGo);

let Notifications: any;
if (notificationsSupported) {
  Notifications = require('expo-notifications');
}

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

  const handleToggleBackground = async (value: boolean) => {
    if (value && !notificationsSupported) {
      Alert.alert(
        "Limited Support",
        "Persistent background notifications on Android require a Development Build (via EAS) and are no longer supported in Expo Go SDK 53+.",
        [{ text: "OK" }]
      );
      return;
    }

    if (value) {
      if (!Notifications) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Notifications are needed for the background countdown.");
        updateSettings({ runInBackground: false });
        return;
      }
    } else {
      if (Notifications) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await Notifications.dismissAllNotificationsAsync();
      }
    }
    updateSettings({ runInBackground: value });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COUNTDOWN CONFIGURATION</Text>
          
          <View style={styles.settingCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Target Event</Text>
              <Text style={styles.settingDesc}>Configure countdown duration</Text>
            </View>
            
            <View style={styles.controls}>
              <View style={[styles.inputWrapper, isTimerRunning && styles.controlBtnDisabled]}>
                <TextInput
                  value={settings.countdownDays.toString()}
                  onChangeText={handleDaysChange}
                  keyboardType="number-pad"
                  style={[styles.smallInput, isTimerRunning && { color: Colors.onSurfaceVariant }]}
                  editable={!isTimerRunning}
                  maxLength={4}
                />
                <Text style={[styles.unitLabel, isTimerRunning && { color: Colors.onSurfaceVariant }]}>D</Text>
              </View>

              <View style={[styles.inputWrapper, isTimerRunning && styles.controlBtnDisabled]}>
                <TextInput
                  value={settings.countdownHours.toString()}
                  onChangeText={handleHoursChange}
                  keyboardType="number-pad"
                  style={[styles.smallInput, isTimerRunning && { color: Colors.onSurfaceVariant }]}
                  editable={!isTimerRunning}
                  maxLength={2}
                />
                <Text style={[styles.unitLabel, isTimerRunning && { color: Colors.onSurfaceVariant }]}>H</Text>
              </View>

              <View style={[styles.inputWrapper, isTimerRunning && styles.controlBtnDisabled]}>
                <TextInput
                  value={settings.countdownMinutes.toString()}
                  onChangeText={handleMinutesChange}
                  keyboardType="number-pad"
                  style={[styles.smallInput, isTimerRunning && { color: Colors.onSurfaceVariant }]}
                  editable={!isTimerRunning}
                  maxLength={2}
                />
                <Text style={[styles.unitLabel, isTimerRunning && { color: Colors.onSurfaceVariant }]}>M</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleTogglePause}>
              <MaterialIcons name={settings.timerPausedAt ? "play-arrow" : "pause"} size={22} color={Colors.primary} />
              <Text style={styles.actionBtnText}>{settings.timerPausedAt ? "Resume" : "Pause"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handleResetTimer}>
              <MaterialIcons name="refresh" size={22} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BACKGROUND ACTIVITY</Text>
          <View style={styles.settingCard}>
            <View>
              <Text style={styles.settingLabel}>Running Status</Text>
              <Text style={styles.settingDesc}>Keep timer notification active</Text>
            </View>
            <Switch 
              value={settings.runInBackground} 
              onValueChange={handleToggleBackground} 
              trackColor={{ true: Colors.primary }}
              disabled={isAndroid && isExpoGo && !settings.runInBackground}
            />
          </View>
          {isAndroid && isExpoGo && (
            <Text style={styles.warningText}>
              Note: Persistent notifications require a Development Build on Android.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.settingCard}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.valueText}>1.0.0</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 16,
  },
  headerText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 4,
  },
  content: {
    paddingHorizontal: 24,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    color: Colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  settingCard: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlBtnDisabled: {
    opacity: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  smallInput: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'center',
  },
  unitLabel: {
    color: Colors.onSurface,
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
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
  warningText: {
    color: Colors.error || '#ff4444',
    fontSize: 10,
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.8,
  }
});
