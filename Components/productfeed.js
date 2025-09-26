import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, API_CONFIG } from '../constants/api';
import { COLORS, FONT, SIZES, SPACING, SHADOWS } from '../constants/theme';

export default function Feeds() {
  const [providerId, setProviderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ services: 0, bookingsPending: 0, bookingsTotal: 0 });
  const [recentServices, setRecentServices] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    (async () => {
      const id = (await AsyncStorage.getItem('providerId')) || '';
      setProviderId(id);
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [servicesRes, providerBookingsRes, unconfirmedCountRes] = await Promise.all([
          apiClient.get(`${API_CONFIG.ENDPOINTS.SERVICES_BY_VENDOR}/${id}`),
          apiClient.get(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${id}/id`),
          apiClient.get(`${API_CONFIG.ENDPOINTS.BOOKINGS}/count/unconfirmed/${id}`),
        ]);

        const services = servicesRes.data || [];
        const bookings = providerBookingsRes.data || [];
        const pendingCount = unconfirmedCountRes.data?.count || 0;

        setStats({
          services: Array.isArray(services) ? services.length : 0,
          bookingsPending: pendingCount,
          bookingsTotal: Array.isArray(bookings) ? bookings.length : 0,
        });

        setRecentServices(services.slice(0, 5));
        setRecentBookings(bookings.slice(0, 5));
      } catch (e) {
        // minimal UI if errors occur
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.services}</Text>
          <Text style={styles.cardLabel}>Services</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.bookingsPending}</Text>
          <Text style={styles.cardLabel}>Pending</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.bookingsTotal}</Text>
          <Text style={styles.cardLabel}>Bookings</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Services</Text>
      <FlatList
        data={recentServices}
        keyExtractor={(item) => String(item.id || item._id || Math.random())}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.title || item.name || 'Service'}</Text>
            <Text style={styles.itemSub}>{item.category || item.description || ''}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No services yet.</Text>}
      />

      <Text style={styles.sectionTitle}>Recent Bookings</Text>
      <FlatList
        data={recentBookings}
        keyExtractor={(item) => String(item.id || item._id || Math.random())}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.itemTitle}>#{item.id} • {item.status || 'pending'}</Text>
            <Text style={styles.itemSub}>{item.createdAt || ''}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet.</Text>}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Create Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>View All Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.small,
    marginBottom: SPACING.large,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    padding: SPACING.large,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  cardValue: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
  },
  cardLabel: {
    marginTop: 4,
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    marginTop: SPACING.large,
    marginBottom: SPACING.small,
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
  },
  listItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.medium,
    borderRadius: SIZES.medium,
    marginBottom: SPACING.small,
    ...SHADOWS.small,
  },
  itemTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  empty: {
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    marginBottom: SPACING.medium,
  },
  actions: {
    marginTop: SPACING.large,
    gap: SPACING.small,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  secondaryBtn: {
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.medium,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
});