import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { vendorAPI } from '../../constants/api';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../../constants/theme';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        setOrders([]);
        return;
      }
      const response = await vendorAPI.getProviderBookings(Number(vendorId));
      setOrders(response.data || []);
    } catch (err) {
      // Backend returns 404 when no bookings exist; treat as empty instead of error
      if (err?.response?.status === 404) {
        setOrders([]);
        setError(null);
      } else {
        console.error('Failed to load bookings:', err);
        setError('Unable to load bookings');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const handleStatusUpdate = useCallback(
    (booking, status) => {
      const title = status === 'declined' ? 'Decline booking' : 'Confirm booking';
      const message = status === 'declined'
        ? 'Are you sure you want to decline this booking?'
        : 'Confirm this booking for the client?';

      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes',
            style: status === 'declined' ? 'destructive' : 'default',
            onPress: async () => {
              try {
                setUpdatingId(booking.id);
                const payload = { status };
                if (status === 'confirmed' && !booking.appointmentDateTime) {
                  payload['appointmentDateTime'] = new Date().toISOString();
                }
                await vendorAPI.updateBookingStatus(booking.id, payload);
                await fetchOrders();
              } catch (err) {
                console.error('Failed to update booking:', err);
                Alert.alert('Update failed', 'Please try again later.');
              } finally {
                setUpdatingId(null);
              }
            },
          },
        ],
      );
    },
    [fetchOrders],
  );

  const segmentedOrders = useMemo(() => {
    const pending = [];
    const upcoming = [];
    const past = [];
    orders.forEach((order) => {
      const bucket = order.status === 'pending'
        ? pending
        : order.status === 'declined'
          ? past
          : upcoming;
      bucket.push(order);
    });
    return { pending, upcoming, past };
  }, [orders]);

  const renderOrderCard = (booking) => {
    const customer = booking.user?.username || booking.user?.name || 'Client';
    const serviceName = booking.service?.servicename || booking.serviceDescription || 'Service request';
    const dateLabel = booking.appointmentDateTime
      ? new Date(booking.appointmentDateTime).toLocaleString()
      : 'Not scheduled';
    const isUpdating = updatingId === booking.id;

    return (
      <View key={booking.id} style={[styles.card, SHADOWS.light]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>{serviceName}</Text>
            <Text style={styles.cardSubtitle}>Requested by {customer}</Text>
          </View>
          <View style={[styles.statusPill, statusStyles(booking.status).background]}>
            <Text style={[styles.statusText, statusStyles(booking.status).foreground]}>{booking.status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.gray400} />
          <Text style={styles.cardRowText}>{dateLabel}</Text>
        </View>

        <Text style={styles.cardNotes}>{booking.serviceDescription}</Text>

        {booking.status === 'pending' && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionPrimary, isUpdating && styles.actionDisabled]}
              onPress={() => handleStatusUpdate(booking, 'confirmed')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.actionPrimaryText}>Confirm</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionDanger}
              onPress={() => handleStatusUpdate(booking, 'declined')}
              disabled={isUpdating}
            >
              <Ionicons name="close" size={16} color={COLORS.error} />
              <Text style={styles.actionDangerText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSection = (title, emptyLabel, items) => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {items.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Ionicons name="file-tray-outline" size={32} color={COLORS.gray300} />
          <Text style={styles.emptyBlockText}>{emptyLabel}</Text>
        </View>
      ) : (
        items.map(renderOrderCard)
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={32} color={COLORS.error} />
        <Text style={styles.loadingText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.contentContainer}>
      {renderSection('Awaiting action', 'No pending orders right now.', segmentedOrders.pending)}
      {renderSection('Upcoming', 'No scheduled orders yet.', segmentedOrders.upcoming)}
      {renderSection('Past / Declined', 'No declined orders.', segmentedOrders.past)}
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
};

const statusStyles = (status = 'pending') => {
  switch (status) {
    case 'confirmed':
      return { background: { backgroundColor: COLORS.success + '20' }, foreground: { color: COLORS.success } };
    case 'scheduled':
      return { background: { backgroundColor: COLORS.secondary + '20' }, foreground: { color: COLORS.secondary } };
    case 'declined':
      return { background: { backgroundColor: COLORS.error + '20' }, foreground: { color: COLORS.error } };
    default:
      return { background: { backgroundColor: COLORS.primary + '20' }, foreground: { color: COLORS.primary } };
  }
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  retryButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  section: {
    gap: SPACING.md,
  },
  sectionHeading: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  emptyBlock: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  emptyBlockText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  statusPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.lg,
  },
  statusText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  cardRowText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  cardNotes: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  actionDisabled: {
    opacity: 0.7,
  },
  actionPrimaryText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  actionDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.error + '12',
  },
  actionDangerText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.error,
  },
});

export default OrdersScreen;
