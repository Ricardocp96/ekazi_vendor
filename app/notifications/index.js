import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { vendorAPI } from '../../constants/api';
import { COLORS, FONT, SIZES, SPACING } from '../../constants/theme';

const NotificationsScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const providerId = await AsyncStorage.getItem('id');
      if (!providerId) {
        setNotifications([]);
        return;
      }
      const response = await vendorAPI.getNotifications({ providerId, limit: 50 });
      const list = Array.isArray(response.data) ? response.data : [];
      setNotifications(list);
      await vendorAPI.markNotificationsRead({ providerId });
    } catch (err) {
      console.error('Failed to load notifications', err);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const handleClearAll = async () => {
    if (clearing) {
      return;
    }
    try {
      setClearing(true);
      const providerId = await AsyncStorage.getItem('id');
      if (!providerId) {
        setNotifications([]);
        return;
      }
      await vendorAPI.markNotificationsRead({ providerId });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications', err);
      setError(err?.message || 'Failed to clear notifications');
    } finally {
      setClearing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          style={styles.clearButton}
          disabled={clearing || notifications.length === 0}
        >
          <Text
            style={[
              styles.clearButtonText,
              (clearing || notifications.length === 0) && styles.clearButtonTextDisabled,
            ]}
          >
            {clearing ? 'Clearing...' : 'Clear all'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.radius.sm,
  },
  clearButtonText: {
    fontFamily: FONT.medium,
    color: COLORS.primary,
    fontSize: SIZES.small,
  },
  clearButtonTextDisabled: {
    color: COLORS.gray400,
  },
  list: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: SIZES.radius.lg,
    gap: SPACING.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  title: {
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    fontSize: SIZES.medium,
    marginBottom: 2,
  },
  body: {
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    fontSize: SIZES.small,
  },
  time: {
    fontFamily: FONT.regular,
    color: COLORS.gray400,
    fontSize: SIZES.xSmall,
    marginTop: 6,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontFamily: FONT.medium,
    color: COLORS.error,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
