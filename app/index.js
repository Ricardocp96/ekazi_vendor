import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const id = await AsyncStorage.getItem('id');
        const userType = await AsyncStorage.getItem('userType');
        
        // Check if user is a vendor
        const isVendor = !!(username && id && userType === 'vendor');
        setIsAuthenticated(isVendor);
        
        // Navigate based on authentication status
        if (isVendor) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking user:', err);
        setError(err.message);
        setIsLoading(false);
        router.replace('/login');
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.error, textAlign: 'center', padding: 20 }}>Error: {error}</Text>
      </View>
    );
  }

  return null; // Navigation will handle the rest
}
