import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { FocusSessionTimer } from '@/components/FocusSessionTimer';
import { ProductivityStreak } from '@/components/ProductivityStreak';
import { DailyPulseList } from '@/components/DailyPulseList';
import { SecondaryInsights } from '@/components/SecondaryInsights';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/useStore';

export default function HomeScreen() {
  const router = useRouter();
  const { addTask } = useStore();
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <FocusSessionTimer />
              
              <View style={{ height: 24 }} />
              
              <DailyPulseList />
              
              <View style={{ height: 24 }} />
              
              <SecondaryInsights />

              <View style={{ height: 24 }} />
              
              <ProductivityStreak />
              
              {/* FAB Spacer for scroll */}
              <View style={{ height: 120 }} />
            </ScrollView>

            {/* Floating Add New Time Block */}
            <View style={styles.floatingContainer}>
              {isAdding ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter task title..."
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onSubmitEditing={handleAddTask}
                    autoFocus
                    onBlur={() => setIsAdding(false)}
                  />
                </View>
              ) : (
                <TouchableOpacity style={styles.addBlockBtn} activeOpacity={0.8} onPress={() => setIsAdding(true)}>
                  <MaterialIcons name="add" size={20} color={Colors.primary} />
                  <Text style={styles.addBlockText}>NEW TASK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
    marginTop: Platform.OS === 'android' ? 32 : 0,
  },
  headerBtn: {
    padding: 8,
  },
  headerText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  addBlockBtn: {
    backgroundColor: Colors.surfaceBright,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addBlockText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.5,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceBright,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    width: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  input: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});
