import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../constants/theme';
import { vendorAPI } from '../constants/api';

const quickActions = [
  {
    id: 'view-orders',
    label: 'Orders',
    icon: 'receipt-outline',
  },
  {
    id: 'manage-calendar',
    label: 'Calendar',
    icon: 'calendar-outline',
  },
];

const productivityTips = [
  {
    id: 'tip-1',
    title: 'Set response reminders',
    description: 'Follow up faster with automated reminders so leads never go cold.',
  },
  {
    id: 'tip-2',
    title: 'Showcase customer reviews',
    description: 'Adding testimonials to your profile increases bookings by 24%.',
  },
];

const formatDateTime = (dateString) => {
  if (!dateString) {
    return 'Awaiting scheduling';
  }
  const value = new Date(dateString);
  if (Number.isNaN(value.getTime())) {
    return 'Awaiting scheduling';
  }
  return value.toLocaleString();
};

const renderSummaryCard = ({ item }) => (
  <View key={item.id} style={[styles.metricCard, SHADOWS.light]}>
    <View style={[styles.metricIcon, { backgroundColor: item.accent + '1A' }]}>
      <Ionicons name={item.icon} size={24} color={item.accent} />
    </View>
    <Text style={styles.metricValue}>{item.value}</Text>
    <Text style={styles.metricLabel}>{item.label}</Text>
  </View>
);

const renderAppointment = (appointment) => (
  <View key={appointment.id} style={[styles.appointmentCard, SHADOWS.light]}>
    <View style={styles.appointmentHeader}>
      <Text style={styles.appointmentTitle}>{appointment.title}</Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusBadgeText}>{appointment.status}</Text>
      </View>
    </View>
    <View style={styles.appointmentMeta}>
      <Ionicons name="person-outline" size={16} color={COLORS.gray400} />
      <Text style={styles.appointmentMetaText}>{appointment.customer}</Text>
    </View>
    <View style={styles.appointmentMeta}>
      <Ionicons name="time-outline" size={16} color={COLORS.gray400} />
      <Text style={styles.appointmentMetaText}>{appointment.time}</Text>
    </View>
  </View>
);

const renderTip = (tip) => (
  <View key={tip.id} style={[styles.tipCard, SHADOWS.light]}>
    <Text style={styles.tipTitle}>{tip.title}</Text>
    <Text style={styles.tipDescription}>{tip.description}</Text>
  </View>
);

const DashboardHome = () => {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [confirmedJobs, setConfirmedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const metrics = useMemo(
    () => [
      {
        id: 'pending-requests',
        label: 'Pending Requests',
        value: String(pendingRequests.length),
        icon: 'notifications-outline',
        accent: COLORS.secondary,
      },
      {
        id: 'upcoming',
        label: 'Upcoming Jobs',
        value: String(confirmedJobs.length),
        icon: 'calendar-outline',
        accent: COLORS.primary,
      },
      {
        id: 'earnings',
        label: 'Earnings (30d)',
        value: '$1,840',
        icon: 'cash-outline',
        accent: COLORS.success,
      },
    ],
    [pendingRequests.length, confirmedJobs.length],
  );

  const fetchPendingRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        return;
      }
      const response = await vendorAPI.getPendingRequests(Number(vendorId));
      setPendingRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
      setRequestsError('Unable to load requests');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const fetchConfirmedJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const vendorId = await AsyncStorage.getItem('id');
      if (!vendorId) {
        setConfirmedJobs([]);
        return;
      }
      const response = await vendorAPI.getProviderBookings(Number(vendorId));
      const bookings = Array.isArray(response.data) ? response.data : [];
      const confirmed = bookings
        .filter((booking) => {
          const normalized = (booking?.status || '').toLowerCase();
          return ['confirmed', 'scheduled'].includes(normalized);
        })
        .map((booking) => ({
          id: booking.id ?? Math.random().toString(),
          title:
            booking?.service?.servicename ||
            booking?.service?.name ||
            booking?.serviceName ||
            booking?.serviceDescription ||
            'Service job',
          customer:
            booking?.user?.username ||
            booking?.user?.name ||
            booking?.user?.email ||
            'Customer',
          time: formatDateTime(booking?.appointmentDateTime),
          status:
            (booking?.status || 'Confirmed').charAt(0).toUpperCase() +
            (booking?.status || 'Confirmed').slice(1),
        }));
      setConfirmedJobs(confirmed);
    } catch (error) {
      // Backend returns 404 when there are no bookings; treat it as empty instead of an error
      if (error?.response?.status === 404) {
        setConfirmedJobs([]);
        setJobsError(null);
      } else {
        console.error('Failed to fetch confirmed jobs:', error);
        setJobsError('Unable to load confirmed jobs');
        setConfirmedJobs([]);
      }
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPendingRequests();
      fetchConfirmedJobs();
      const loadUnread = async () => {
        try {
          const providerId = await AsyncStorage.getItem('id');
          if (!providerId) {
            return;
          }
          const response = await vendorAPI.getUnreadNotificationsCount(providerId);
          const count = response?.data?.count ?? 0;
          setUnreadNotifications(count);
        } catch (error) {
          console.log('Failed to load notification count', error);
        }
      };
      loadUnread();
    }, [fetchPendingRequests, fetchConfirmedJobs]),
  );

  const handleQuickAction = useCallback(
    (action) => {
      switch (action.id) {
        case 'view-orders':
          router.push('/orders');
          break;
        case 'manage-calendar':
          router.push('/calendar');
          break;
        default:
          break;
      }
    },
    [router],
  );

  const updateRequestStatus = useCallback(
    async (bookingId, payload) => {
      try {
        setUpdatingRequestId(bookingId);
        await vendorAPI.updateBookingStatus(bookingId, payload);
        await fetchPendingRequests();
      } catch (error) {
        console.error('Failed to update booking status:', error);
        Alert.alert('Update failed', 'Could not update the request. Please try again.');
      } finally {
        setUpdatingRequestId(null);
      }
    },
    [fetchPendingRequests],
  );

  const handleConfirm = useCallback(
    (request) => {
      const appointment = request.appointmentDateTime
        ? new Date(request.appointmentDateTime).toISOString()
        : new Date().toISOString();
      updateRequestStatus(request.id, {
        status: 'confirmed',
        appointmentDateTime: appointment,
      });
    },
    [updateRequestStatus],
  );

  const handleDecline = useCallback(
    (request) => {
      Alert.alert(
        'Decline request',
        'Are you sure you want to decline this request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, decline',
            style: 'destructive',
            onPress: () => updateRequestStatus(request.id, { status: 'declined' }),
          },
        ],
      );
    },
    [updateRequestStatus],
  );

  const openScheduleModal = useCallback((request) => {
    setSelectedRequest(request);
    if (request.appointmentDateTime) {
      const dateValue = new Date(request.appointmentDateTime);
      if (!Number.isNaN(dateValue.getTime())) {
        setScheduleDate(dateValue.toISOString().slice(0, 10));
        setScheduleTime(dateValue.toISOString().slice(11, 16));
      }
    } else {
      const now = new Date();
      setScheduleDate(now.toISOString().slice(0, 10));
      setScheduleTime(now.toISOString().slice(11, 16));
    }
    setScheduleModalVisible(true);
  }, []);

  const closeScheduleModal = useCallback(() => {
    setScheduleModalVisible(false);
    setSelectedRequest(null);
  }, []);

  const handleScheduleSubmit = useCallback(async () => {
    if (!selectedRequest) {
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      Alert.alert('Incomplete details', 'Please provide both a date and time.');
      return;
    }
    const isoString = new Date(scheduleDate + 'T' + scheduleTime + ':00').toISOString();
    await updateRequestStatus(selectedRequest.id, {
      status: 'scheduled',
      appointmentDateTime: isoString,
    });
    closeScheduleModal();
  }, [closeScheduleModal, scheduleDate, scheduleTime, selectedRequest, updateRequestStatus]);

  const renderRequestCard = useCallback(
    (request) => {
      const customerName = request.user?.username || request.user?.name || 'Client';
      const serviceName = request.service?.servicename || request.serviceDescription || 'Service request';
      const appointmentLabel = formatDateTime(request.appointmentDateTime);
      const isUpdating = updatingRequestId === request.id;

      return (
        <View key={request.id} style={[styles.requestCard, SHADOWS.light]}>
          <View style={styles.requestHeader}>
            <Text style={styles.requestTitle}>{serviceName}</Text>
            <View style={styles.requestStatusBadge}>
              <Text style={styles.requestStatusText}>{(request.status || 'pending').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.requestMetaBlock}>
            <Text style={styles.requestMetaLabel}>Requested by</Text>
            <Text style={styles.requestMetaValue}>{customerName}</Text>
          </View>

          <View style={styles.requestMetaBlock}>
            <Text style={styles.requestMetaLabel}>Preferred schedule</Text>
            <Text style={styles.requestMetaValue}>{appointmentLabel}</Text>
          </View>

          <Text style={styles.requestNotes}>{request.serviceDescription}</Text>

          <View style={styles.requestActionsRow}>
            <TouchableOpacity
              style={[styles.primaryAction, isUpdating && styles.disabledAction]}
              onPress={() => handleConfirm(request)}
              disabled={isUpdating}
              activeOpacity={0.85}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => openScheduleModal(request)}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.secondaryActionText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dangerAction}
              onPress={() => handleDecline(request)}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={16} color={COLORS.error} />
              <Text style={styles.dangerActionText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [handleConfirm, handleDecline, openScheduleModal, updatingRequestId],
  );

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {Math.min(unreadNotifications, 9)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroGreeting}>Hi, Vendor!</Text>
          <Text style={styles.heroSubtitle}>
            Track your performance, manage services, and respond to new requests all in one place.
          </Text>
        </View>
          <Image source={require('../assets/track.png')} style={styles.heroIllustration} resizeMode="contain" />
        </View>

        <FlatList
          data={metrics}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderSummaryCard}
          contentContainerStyle={styles.metricsList}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderContent}>
            <Text style={styles.sectionTitle}>Incoming Requests</Text>
            <Text style={styles.sectionCaption}>Review new customer enquiries and respond quickly.</Text>
          </View>
          <TouchableOpacity onPress={fetchPendingRequests} activeOpacity={0.8} style={styles.sectionHeaderAction}>
            <Text style={styles.sectionLink}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {requestsLoading ? (
          <View style={styles.requestsLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingLabel}>Loading requests...</Text>
          </View>
        ) : requestsError ? (
          <View style={styles.requestsLoading}>
            <Ionicons name="warning-outline" size={32} color={COLORS.error} />
            <Text style={styles.loadingLabel}>{requestsError}</Text>
          </View>
        ) : pendingRequests.length === 0 ? (
          <View style={[styles.emptyRequestsCard, SHADOWS.light]}>
            <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
            <Text style={styles.emptyRequestsTitle}>No pending requests</Text>
            <Text style={styles.emptyRequestsSubtitle}>
              You’ll be notified here when customers request your services.
            </Text>
          </View>
        ) : (
          pendingRequests.map(renderRequestCard)
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/update-profile')}>
            <Text style={styles.sectionLink}>Customize</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickActionsRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickAction}
              activeOpacity={0.85}
              onPress={() => handleQuickAction(action)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/calendar')}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        {jobsLoading ? (
          <View style={styles.requestsLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingLabel}>Loading upcoming jobs...</Text>
          </View>
        ) : jobsError ? (
          <View style={styles.requestsLoading}>
            <Ionicons name="warning-outline" size={32} color={COLORS.error} />
            <Text style={styles.loadingLabel}>{jobsError}</Text>
            <TouchableOpacity onPress={fetchConfirmedJobs} activeOpacity={0.8}>
              <Text style={styles.sectionLink}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : confirmedJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={40} color={COLORS.gray300} />
            <Text style={styles.emptyTitle}>No upcoming jobs</Text>
            <Text style={styles.emptySubtitle}>Your confirmed bookings will show up here once scheduled.</Text>
          </View>
        ) : (
          confirmedJobs.map(renderAppointment)
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grow Your Business</Text>
        </View>
        {productivityTips.map(renderTip)}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeScheduleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.medium]}>
            <Text style={styles.modalTitle}>Reschedule request</Text>
            <Text style={styles.modalSubtitle}>Select a new date and time that works for you.</Text>

            <Text style={styles.modalLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              value={scheduleDate}
              onChangeText={setScheduleDate}
              style={styles.modalInput}
              placeholder="2025-01-15"
              placeholderTextColor={COLORS.gray400}
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Time (HH:MM)</Text>
            <TextInput
              value={scheduleTime}
              onChangeText={setScheduleTime}
              style={styles.modalInput}
              placeholder="14:30"
              placeholderTextColor={COLORS.gray400}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeScheduleModal} activeOpacity={0.85}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={handleScheduleSubmit} activeOpacity={0.85}>
                <Text style={styles.modalSubmitText}>Save schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingVertical: SPACING.lg,
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: SIZES.radius.xl,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerBar: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.textPrimary,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs / 2,
  },
  notificationText: {
    color: COLORS.white,
    fontSize: SIZES.xSmall,
    fontFamily: FONT.bold,
  },
  heroCopy: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroGreeting: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.white + 'B3',
    marginBottom: SPACING.md,
  },
  heroButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    gap: SPACING.xs,
  },
  heroButtonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.primary,
  },
  heroIllustration: {
    width: 110,
    height: 110,
  },
  metricsList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  metricCard: {
    width: 150,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginRight: SPACING.md,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xxLarge,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  metricLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderContent: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  sectionCaption: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeaderAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xs,
    paddingLeft: SPACING.md,
  },
  requestsLoading: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingLabel: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  emptyRequestsCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyRequestsTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
  },
  emptyRequestsSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  requestCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  requestStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.secondary + '1A',
  },
  requestStatusText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.secondary,
  },
  requestMetaBlock: {
    gap: 2,
  },
  requestMetaLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  requestMetaValue: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
  },
  requestNotes: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  requestActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  disabledAction: {
    opacity: 0.7,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.primary + '12',
  },
  secondaryActionText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.error + '12',
  },
  dangerActionText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.error,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  quickAction: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickActionDisabled: {
    opacity: 0.6,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  quickActionHint: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  emptyState: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionLink: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  appointmentCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appointmentTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.primary + '1F',
  },
  statusBadgeText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 4,
  },
  appointmentMetaText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  tipCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
  },
  tipTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tipCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tipCtaText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  modalLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textPrimary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  modalCancel: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.gray100,
  },
  modalCancelText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  modalSubmit: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.primary,
  },
  modalSubmitText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
});

export default DashboardHome;
