import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { WheelPicker } from './WheelPicker';

const DAYS_DATA = Array.from({ length: 366 }, (_, i) => i);
const HOURS_DATA = Array.from({ length: 24 }, (_, i) => i);
const MINS_DATA = Array.from({ length: 60 }, (_, i) => i);

export function FocusSessionTimer() {
  const { settings, updateSettings } = useStore();
  const [timeLeft, setTimeLeft] = useState(`${settings.countdownDays}D ${settings.countdownHours}H ${settings.countdownMinutes}M`);
  
  // Use state to track picker values before starting
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

    // Immediate initial call for zero delay
    const updateTime = () => {
      const baseNowMs = Date.now();
      
      const effectiveNowMs = settings.timerPausedAt !== null 
        ? settings.timerPausedAt 
        : baseNowMs;
        
      const sessionDurationMs = (
        (settings.countdownDays * 24 * 60 * 60) +
        (settings.countdownHours * 60 * 60) +
        (settings.countdownMinutes * 60)
      ) * 1000;
      const elapsedMs = effectiveNowMs - settings.timerStartAt;
      
      const distance = sessionDurationMs - elapsedMs;
      
      if (distance <= 0) {
        setTimeLeft('0D 00:00:00');
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      let text = '';
      if (days > 0) text += `${days}D `;
      text += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTimeLeft(text);
    };

    updateTime();
    const interval = setInterval(updateTime, 500); // 500ms for responsiveness

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

  if (!settings.isTimerConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>SET TARGET TIMER</Text>
        <Text style={styles.configDesc}>Swipe to set the duration for your event countdown.</Text>
        
        <View style={styles.pickerRow}>
          <WheelPicker
            data={DAYS_DATA}
            selectedValue={selectedDays}
            onValueChange={setSelectedDays}
            label="Days"
          />
          <View style={styles.pickerSeparator} />
          <WheelPicker
            data={HOURS_DATA}
            selectedValue={selectedHours}
            onValueChange={setSelectedHours}
            label="Hrs"
          />
          <View style={styles.pickerSeparator} />
          <WheelPicker
            data={MINS_DATA}
            selectedValue={selectedMinutes}
            onValueChange={setSelectedMinutes}
            label="Min"
          />
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>START COUNTDOWN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>EVENT COUNTDOWN</Text>
      <Text style={styles.timerText} numberOfLines={1} adjustsFontSizeToFit>{timeLeft}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 24,
    padding: 32,
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
    marginBottom: 16,
  },
  timerText: {
    fontSize: 56, 
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -1,
    marginBottom: 24,
  },
  configDesc: {
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 180,
    marginBottom: 32,
  },
  pickerSeparator: {
    width: 1,
    height: '40%',
    backgroundColor: Colors.surfaceBright,
    marginHorizontal: 4,
  },
  startBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  startBtnText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
