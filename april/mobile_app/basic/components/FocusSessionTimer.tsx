import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export function FocusSessionTimer() {
  const { settings, updateSettings } = useStore();
  const [timeLeft, setTimeLeft] = useState('');
  
  // Local editing state — mirrors settings until user presses Start
  const [selectedDays, setSelectedDays] = useState(settings.countdownDays);
  const [selectedHours, setSelectedHours] = useState(settings.countdownHours);
  const [selectedMinutes, setSelectedMinutes] = useState(settings.countdownMinutes);
  
  useEffect(() => {
    if (!settings.isTimerConfigured) {
      setSelectedDays(settings.countdownDays);
      setSelectedHours(settings.countdownHours);
      setSelectedMinutes(settings.countdownMinutes);
    }
  }, [settings.countdownDays, settings.countdownHours, settings.countdownMinutes, settings.isTimerConfigured]);

  useEffect(() => {
    if (!settings.isTimerConfigured) return;

    const updateTime = () => {
      const baseNowMs = Date.now();
      const effectiveNowMs = settings.timerPausedAt !== null ? settings.timerPausedAt : baseNowMs;
      const sessionDurationMs = (
        (settings.countdownDays * 24 * 60 * 60) +
        (settings.countdownHours * 60 * 60) +
        (settings.countdownMinutes * 60)
      ) * 1000;
      const elapsedMs = effectiveNowMs - settings.timerStartAt;
      const distance = sessionDurationMs - elapsedMs;
      
      if (distance <= 0) {
        setTimeLeft('00d 00:00:00');
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 500);
    return () => clearInterval(interval);
  }, [settings.countdownDays, settings.countdownHours, settings.countdownMinutes, settings.timerPausedAt, settings.timerStartAt, settings.isTimerConfigured]);

  const handleStart = () => {
    updateSettings({
      countdownDays: selectedDays,
      countdownHours: selectedHours,
      countdownMinutes: selectedMinutes,
      isTimerConfigured: true,
      timerStartAt: Date.now(),
      timerPausedAt: null,
    });
  };

  // ── Handlers for TextInput-based editing (same as settings) ────────────────
  const handleDaysChange = (text: string) => {
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    setSelectedDays(isNaN(parsed) ? 0 : Math.min(99, parsed));
  };

  const handleHoursChange = (text: string) => {
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    setSelectedHours(isNaN(parsed) ? 0 : Math.min(23, parsed));
  };

  const handleMinutesChange = (text: string) => {
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    setSelectedMinutes(isNaN(parsed) ? 0 : Math.min(59, parsed));
  };

  // ── Config view (matches settings layout exactly) ─────────────────────────
  if (!settings.isTimerConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>SET TARGET TIMER</Text>
        <Text style={styles.configDesc}>Tap to set the duration for your countdown.</Text>
        
        <View style={styles.durationRow}>
          {/* Days */}
          <View style={styles.durationBlock}>
            <TextInput
              value={selectedDays.toString()}
              onChangeText={handleDaysChange}
              keyboardType="number-pad"
              style={styles.durationInput}
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={styles.durationUnit}>DAYS</Text>
          </View>

          <Text style={styles.durationColon}>:</Text>

          {/* Hours */}
          <View style={styles.durationBlock}>
            <TextInput
              value={selectedHours.toString().padStart(2, '0')}
              onChangeText={handleHoursChange}
              keyboardType="number-pad"
              style={styles.durationInput}
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={styles.durationUnit}>HRS</Text>
          </View>

          <Text style={styles.durationColon}>:</Text>

          {/* Minutes */}
          <View style={styles.durationBlock}>
            <TextInput
              value={selectedMinutes.toString().padStart(2, '0')}
              onChangeText={handleMinutesChange}
              keyboardType="number-pad"
              style={styles.durationInput}
              maxLength={2}
              selectTextOnFocus
            />
            <Text style={styles.durationUnit}>MIN</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>START COUNTDOWN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Running view ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.label}>EVENT COUNTDOWN</Text>
      <Text
        style={styles.timerText}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {timeLeft}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    width: '100%',
  },
  label: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  timerText: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
    width: '100%',
    textAlign: 'center',
  },
  configDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  // ── Duration picker — same style as settings ──────────────────────────────
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 24,
    width: '100%',
  },
  durationBlock: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  durationInput: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    fontVariant: ['tabular-nums'],
    borderCurve: 'continuous',
  },
  durationUnit: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  durationColon: {
    color: Colors.onSurfaceVariant,
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 22, // align with input visually (above the unit label)
  },
  startBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  startBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
