import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { vendorAPI } from '../../constants/api';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../../constants/theme';

const formatDateTime = (value) => {
  if (!value) {
    return 'TBD';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'TBD';
  }
  return date.toLocaleString();
};

const CalendarScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        setBookings([]);
        return;
      }
      const response = await vendorAPI.getProviderBookings(Number(vendorId));
      setBookings(response.data || []);
    } catch (err) {
      // Backend returns 404 when there are no bookings; show empty state instead of error
      if (err?.response?.status === 404) {
        setBookings([]);
        setError(null);
      } else {
        console.error('Failed to load calendar entries:', err);
        setError('Unable to load schedule');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchBookings();
    } finally {
      setRefreshing(false);
    }
  }, [fetchBookings]);

  const upcoming = useMemo(() => {
    return bookings
      .filter((booking) => booking.status === 'confirmed' || booking.status === 'scheduled')
      .sort((a, b) => {
        const dateA = a.appointmentDateTime ? new Date(a.appointmentDateTime).getTime() : Infinity;
        const dateB = b.appointmentDateTime ? new Date(b.appointmentDateTime).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [bookings]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={32} color={COLORS.error} />
        <Text style={styles.loadingText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {upcoming.length === 0 ? (
        <View style={[styles.emptyCard, SHADOWS.light]}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No scheduled jobs yet</Text>
          <Text style={styles.emptySubtitle}>Confirmed and scheduled jobs will appear here automatically.</Text>
        </View>
      ) : (
        upcoming.map((booking) => {
          const customer = booking.user?.username || booking.user?.name || 'Client';
          const serviceName = booking.service?.servicename || booking.serviceDescription || 'Service';
          const dateLabel = formatDateTime(booking.appointmentDateTime);

          return (
            <View key={booking.id} style={[styles.eventCard, SHADOWS.light]}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{serviceName}</Text>
                <View style={styles.eventStatus}>
                  <Ionicons name="ellipse" size={8} color={COLORS.success} />
                  <Text style={styles.eventStatusText}>{booking.status?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.eventRow}>
                <Ionicons name="person-outline" size={16} color={COLORS.gray400} />
                <Text style={styles.eventRowText}>{customer}</Text>
              </View>
              <View style={styles.eventRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.gray400} />
                <Text style={styles.eventRowText}>{dateLabel}</Text>
              </View>
              <Text style={styles.eventNotes}>{booking.serviceDescription}</Text>
            </View>
          );
        })
      )}
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  loadingText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventStatusText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.success,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  eventRowText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  eventNotes: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default CalendarScreen;
