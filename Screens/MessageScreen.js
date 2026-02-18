
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vendorAPI } from '../constants/api';
import { COLORS, FONT, SIZES, SPACING } from '../constants/theme';

const Messaging = () => {
  const router = useRouter();
  const [providerId, setProviderId] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const ensureProviderId = useCallback(async () => {
    if (providerId) {
      return providerId;
    }
    const stored = (await AsyncStorage.getItem('providerId')) || (await AsyncStorage.getItem('id'));
    if (stored) {
      setProviderId(stored);
    }
    return stored;
  }, [providerId]);

  const loadConversations = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const resolvedProviderId = await ensureProviderId();
      if (!resolvedProviderId) {
        setError('Unable to determine provider account. Please sign in again.');
        setPreviews([]);
        return;
      }

      const numericProviderId = Number(resolvedProviderId);
      const bookingsPromise = Number.isNaN(numericProviderId)
        ? vendorAPI.getProviderBookings(resolvedProviderId)
        : vendorAPI.getProviderBookings(numericProviderId);
      const conversationsPromise = vendorAPI.getProviderConversations(resolvedProviderId);

      const [bookingsResponse, conversationsResponse] = await Promise.all([
        bookingsPromise.catch((err) => {
          if (err?.response?.status === 404) {
            return { data: [] };
          }
          throw err;
        }),
        conversationsPromise.catch((err) => {
          if (err?.response?.status === 404) {
            return { data: [] };
          }
          throw err;
        }),
      ]);

      const bookingsRaw = bookingsResponse?.data;
      const conversationsRaw = conversationsResponse?.data;

      const bookings = Array.isArray(bookingsRaw)
        ? bookingsRaw
        : Array.isArray(bookingsRaw?.data)
          ? bookingsRaw.data
          : [];
      const conversations = Array.isArray(conversationsRaw)
        ? conversationsRaw
        : Array.isArray(conversationsRaw?.data)
          ? conversationsRaw.data
          : [];

      const map = new Map();

      const upsertPreview = (userId) => {
        if (!map.has(userId)) {
          map.set(userId, {
            userId,
            userName: `Customer ${userId}`,
            serviceName: undefined,
            appointmentDate: undefined,
            lastMessage: undefined,
            lastMessageAt: undefined,
            lastActivity: undefined,
          });
        }
        return map.get(userId);
      };

      bookings.forEach((booking) => {
        const user =
          booking?.user ||
          booking?.User ||
          booking?.customer ||
          booking?.client ||
          {};
        const userId =
          user?.id?.toString?.() ||
          booking?.userId?.toString?.() ||
          null;
        if (!userId) {
          return;
        }

        const entry = upsertPreview(userId);

        const serviceName =
          booking?.service?.servicename ||
          booking?.service?.name ||
          booking?.serviceName ||
          entry.serviceName;
        const userName =
          user?.username ||
          user?.name ||
          user?.email ||
          entry.userName;

        if (serviceName) {
          entry.serviceName = serviceName;
        }
        if (userName) {
          entry.userName = userName;
        }
        if (!entry.appointmentDate) {
          const appointmentSource = booking?.appointmentDateTime || booking?.appointmentDate;
          if (appointmentSource) {
            const appointment = new Date(appointmentSource);
            if (!Number.isNaN(appointment.getTime())) {
              entry.appointmentDate = appointment.toISOString();
            }
          }
        }

        const appointmentForActivity = entry.appointmentDate
          ? new Date(entry.appointmentDate)
          : null;
        if (appointmentForActivity && !Number.isNaN(appointmentForActivity.getTime())) {
          const iso = appointmentForActivity.toISOString();
          if (!entry.lastActivity || new Date(iso) > new Date(entry.lastActivity)) {
            entry.lastActivity = iso;
          }
        }
      });

      conversations.forEach((message) => {
        const userId = message?.userId?.toString?.();
        if (!userId) {
          return;
        }
        const entry = upsertPreview(userId);
        if (message?.content) {
          entry.lastMessage = message.content;
        }
        if (message?.createdAt) {
          const createdAt = new Date(message.createdAt);
          if (!Number.isNaN(createdAt.getTime())) {
            const iso = createdAt.toISOString();
            entry.lastMessageAt = iso;
            if (!entry.lastActivity || createdAt > new Date(entry.lastActivity)) {
              entry.lastActivity = iso;
            }
          }
        }
      });

      const combined = Array.from(map.values())
        .map((preview) => {
          if (!preview.lastActivity) {
            const fallback = preview.lastMessageAt || preview.appointmentDate;
            if (fallback) {
              const fallbackDate = new Date(fallback);
              if (!Number.isNaN(fallbackDate.getTime())) {
                preview.lastActivity = fallbackDate.toISOString();
              }
            }
          }
          return preview;
        })
        .sort((a, b) => {
          const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          return bTime - aTime;
        });

      setPreviews(combined);
    } catch (err) {
      console.error('Failed to load conversations', err);
      setError(err?.message || 'Unable to load conversations.');
      setPreviews([]);
    } finally {
      setLoading(false);
    }
  }, [ensureProviderId]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchData = async () => {
        if (isMounted) {
          await loadConversations();
        }
      };
      fetchData();
      return () => {
        isMounted = false;
      };
    }, [loadConversations]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleOpenChat = useCallback(
    (preview) => {
      router.push({
        pathname: '/Screens/Chatroom',
        params: {
          userId: preview.userId,
          userName: preview.userName,
        },
      });
    },
    [router],
  );

  const getMetaLabel = useCallback((preview) => {
    if (preview?.lastMessageAt) {
      try {
        return `Last message: ${new Date(preview.lastMessageAt).toLocaleString()}`;
      } catch {
        return null;
      }
    }
    if (preview?.appointmentDate) {
      try {
        return `Appointment: ${new Date(preview.appointmentDate).toLocaleDateString()}`;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const emptyState = useMemo(() => {
    if (loading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Image source={require('../assets/request.png')} style={styles.emptyImage} />
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptySubtitle}>
          Once a customer messages you or books a service, their conversation will appear here.
        </Text>
      </View>
    );
  }, [loading]);

  const renderItem = ({ item }) => {
    const metaLabel = getMetaLabel(item);
    return (
      <TouchableOpacity style={styles.previewCard} onPress={() => handleOpenChat(item)}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.white} />
        </View>
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>{item.userName}</Text>
          {item.lastMessage ? (
            <Text style={styles.previewSubtitle} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          ) : item.serviceName ? (
            <Text style={styles.previewSubtitle}>{item.serviceName}</Text>
          ) : null}
          {metaLabel ? <Text style={styles.previewMeta}>{metaLabel}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <Text style={styles.headerSubtitle}>
            Keep track of customer conversations and bookings.
          </Text>
        </View>
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={previews}
            keyExtractor={(item) => item.userId}
            renderItem={renderItem}
            contentContainerStyle={[
              styles.listContent,
              previews.length === 0 && styles.listContentEmpty,
            ]}
            ListEmptyComponent={emptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
  },
  previewSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  previewMeta: {
    fontFamily: FONT.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default Messaging;
