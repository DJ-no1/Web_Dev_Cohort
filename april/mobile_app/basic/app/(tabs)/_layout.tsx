import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useStore } from '@/store/useStore';

export default function TabLayout() {
  const { purgeArchivedTasks } = useStore();

  React.useEffect(() => {
    const timer = setInterval(() => {
      purgeArchivedTasks();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(timer);
  }, [purgeArchivedTasks]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.transparentSurface,
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 20,
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="timer" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="archive" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
