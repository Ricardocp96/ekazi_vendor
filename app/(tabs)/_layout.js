import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS, FONT } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: COLORS.shadow,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontFamily: FONT.medium,
          fontSize: 12,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ color, fontSize: size, fontWeight: focused ? 'bold' : 'normal' }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ color, fontSize: size, fontWeight: focused ? 'bold' : 'normal' }}>⚙️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ color, fontSize: size, fontWeight: focused ? 'bold' : 'normal' }}>💬</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ color, fontSize: size, fontWeight: focused ? 'bold' : 'normal' }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
