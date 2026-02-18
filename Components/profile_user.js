import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Alert,
  StatusBar,
  Switch,
  InteractionManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { vendorAPI } from '../constants/api';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../constants/theme';

const LIVE_UPDATE_MIN_INTERVAL_MS = 30000;
const WATCH_DISTANCE_METERS = 20;
const WATCH_TIME_INTERVAL_MS = 10000;
const ACCEPTABLE_ACCURACY_METERS = 50;
const PREFERRED_ACCURACY_METERS = 25;
const LOCATION_TIMEOUT_MS = 15000;

const hasValidCoords = (coords) =>
  coords &&
  typeof coords.latitude === 'number' &&
  typeof coords.longitude === 'number';

const isAccurateEnough = (coords, threshold = ACCEPTABLE_ACCURACY_METERS) => {
  if (!hasValidCoords(coords)) {
    return false;
  }
  if (typeof coords.accuracy !== 'number') {
    return true;
  }
  return coords.accuracy <= threshold;
};

const formatAccuracy = (accuracy) => {
  if (typeof accuracy !== 'number' || Number.isNaN(accuracy)) {
    return null;
  }
  if (accuracy >= 1000) {
    return `${(accuracy / 1000).toFixed(1)} km`;
  }
  return `${Math.round(accuracy)} m`;
};

const Profile = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    profilePicture: null,
    businessName: '',
    rating: 0,
    totalServices: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const router = useRouter();
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState(null);
  const [lastAccuracy, setLastAccuracy] = useState(null);
  const locationWatcherRef = useRef(null);
  const lastUpdateTimestampRef = useRef(0);
  const isSendingRef = useRef(false);
  const providerIdRef = useRef(null);
  const lastCoordsRef = useRef(null);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const providerId =
        (await AsyncStorage.getItem('providerId')) || (await AsyncStorage.getItem('id'));
      if (providerId) {
        providerIdRef.current = providerId;
      }

      if (!providerId) {
        throw new Error('Vendor ID not found in storage');
      }

      const response = await vendorAPI.getProfile(providerId);
      const payload = response?.data?.data ?? response?.data ?? {};
      const profile = Array.isArray(payload) ? payload[0] ?? {} : payload;

      const ratingValue = parseFloat(
        profile?.rating ??
        profile?.averageRating ??
        profile?.ratings ??
        0,
      );

      const totalServicesValue = parseInt(
        profile?.totalServices ??
        profile?.servicesCount ??
        profile?.serviceCount ??
        0,
        10,
      );

      const totalEarningsValue = parseFloat(
        profile?.totalEarnings ??
        profile?.earnings ??
        profile?.totalRevenue ??
        0,
      );

      setProfileData({
        username: profile?.username || profile?.contactName || 'Vendor',
        email: profile?.email || profile?.contactEmail || 'No email provided',
        phone: profile?.mobile || profile?.contactPhone || profile?.phone || 'No phone provided',
        profilePicture: profile?.logo || profile?.profilePicture || profile?.profile_image || null,
        businessName:
          profile?.businessName ||
          profile?.business_name ||
          profile?.companyName ||
          profile?.username ||
          'My Business',
        rating: Number.isFinite(ratingValue) ? ratingValue : 0,
        totalServices: Number.isFinite(totalServicesValue) ? totalServicesValue : 0,
        totalEarnings: Number.isFinite(totalEarningsValue) ? totalEarningsValue : 0,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error?.message || error);
      setProfileData({
        username: 'Vendor',
        email: 'No email provided',
        phone: 'No phone provided',
        profilePicture: null,
        businessName: 'My Business',
        rating: 0,
        totalServices: 0,
        totalEarnings: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProfileData]);

  const resolveProviderId = useCallback(async () => {
    if (providerIdRef.current) {
      return providerIdRef.current;
    }
    const providerId =
      (await AsyncStorage.getItem('providerId')) || (await AsyncStorage.getItem('id'));
    if (providerId) {
      providerIdRef.current = providerId;
    }
    return providerId;
  }, []);

  const getPreciseLocation = useCallback(async () => {
    const accuracyAttempts = [
      Location.Accuracy.BestForNavigation,
      Location.Accuracy.Highest,
      Location.Accuracy.High,
    ];

    let lastPosition = null;

    for (const accuracy of accuracyAttempts) {
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy,
          maximumAge: 0,
          timeout: LOCATION_TIMEOUT_MS,
          mayShowUserSettingsDialog: true,
        });

        if (position?.coords && hasValidCoords(position.coords)) {
          lastPosition = position;
          if (isAccurateEnough(position.coords, PREFERRED_ACCURACY_METERS)) {
            return position;
          }
        }
      } catch (error) {
        console.log('High-accuracy location attempt failed:', error?.message || error);
      }
    }

    return lastPosition;
  }, []);

  const sendLocationUpdate = useCallback(
    async (latitude, longitude, accuracy) => {
      try {
        const providerId = await resolveProviderId();
        if (!providerId) {
          throw new Error('Provider ID not found');
        }
        await vendorAPI.updateLocation(providerId, latitude, longitude);
        setLastLiveUpdate(new Date().toISOString());
        setLastAccuracy(typeof accuracy === 'number' ? accuracy : null);
        return true;
      } catch (error) {
        console.error('Failed to update live location:', error?.message || error);
        return false;
      }
    },
    [resolveProviderId],
  );

  const stopLiveTracking = useCallback(() => {
    if (locationWatcherRef.current) {
      locationWatcherRef.current.remove();
      locationWatcherRef.current = null;
    }
    isSendingRef.current = false;
  }, []);

  const startLiveTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'Location permission is required to share your live position.',
        );
        setIsLiveTracking(false);
        return;
      }

      const initialPosition = await getPreciseLocation();
      if (initialPosition?.coords && hasValidCoords(initialPosition.coords)) {
        const { latitude, longitude, accuracy } = initialPosition.coords;
        lastCoordsRef.current = { latitude, longitude, accuracy };

        if (isAccurateEnough(initialPosition.coords)) {
          const sent = await sendLocationUpdate(latitude, longitude, accuracy);
          if (sent) {
            lastUpdateTimestampRef.current = Date.now();
          }
        } else {
          Alert.alert(
            'Waiting for Better GPS',
            'Live tracking will begin once we detect a clearer GPS fix. Try moving to an open area.',
          );
        }
      }

      if (locationWatcherRef.current) {
        // already running
        return;
      }

      locationWatcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: WATCH_DISTANCE_METERS,
          timeInterval: WATCH_TIME_INTERVAL_MS,
          mayShowUserSettingsDialog: true,
        },
        async ({ coords }) => {
          if (!hasValidCoords(coords)) {
            return;
          }

          lastCoordsRef.current = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          };

          if (!isAccurateEnough(coords)) {
            return;
          }

          const now = Date.now();
          if (now - lastUpdateTimestampRef.current < LIVE_UPDATE_MIN_INTERVAL_MS) {
            return;
          }

          if (isSendingRef.current) {
            return;
          }

          isSendingRef.current = true;
          try {
            const sent = await sendLocationUpdate(coords.latitude, coords.longitude, coords.accuracy);
            if (sent) {
              lastUpdateTimestampRef.current = now;
            }
          } finally {
            isSendingRef.current = false;
          }
        },
      );
    } catch (error) {
      console.error('Unable to start live tracking:', error?.message || error);
      Alert.alert('Error', 'Unable to start live location updates. Please try again later.');
      setIsLiveTracking(false);
      stopLiveTracking();
    }
  }, [getPreciseLocation, sendLocationUpdate, stopLiveTracking]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  useEffect(() => {
    if (isLiveTracking) {
      startLiveTracking();
    } else {
      stopLiveTracking();
    }

    return () => {
      stopLiveTracking();
    };
  }, [isLiveTracking, startLiveTracking, stopLiveTracking]);

  const handleUpdateLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to update your location');
        return;
      }

      // Show loading alert
      Alert.alert('Updating Location', 'Fetching your current location...');

      // Get current location
      const position = await getPreciseLocation();
      if (!position || !hasValidCoords(position.coords)) {
        Alert.alert('Error', 'Unable to obtain a valid GPS position. Please try again outdoors.');
        return;
      }

      const { latitude, longitude, accuracy } = position.coords;

      if (!isAccurateEnough(position.coords)) {
        const accuracyLabel = formatAccuracy(position.coords.accuracy);
        Alert.alert(
          'Weak GPS Signal',
          `We could not get a precise fix${
            accuracyLabel ? ` (accuracy ~ +/-${accuracyLabel})` : ''
          }. Please step outside or move to an open area, then try again.`,
        );
        return;
      }

      // Get provider ID
      const providerId = 
        (await AsyncStorage.getItem('providerId')) || (await AsyncStorage.getItem('id'));

      if (!providerId) {
        Alert.alert('Error', 'Provider ID not found');
        return;
      }
      providerIdRef.current = providerId;

      // Update location on backend
      const sent = await sendLocationUpdate(latitude, longitude, accuracy);
      if (!sent) {
        throw new Error('Failed to push coordinates');
      }

      Alert.alert(
        'Success',
        `Location updated successfully!
Latitude: ${latitude.toFixed(6)}
Longitude: ${longitude.toFixed(6)}${
          typeof accuracy === 'number' ? `
Accuracy: +/-${formatAccuracy(accuracy)}` : ''
        }`
      );
    } catch (error) {
      console.error('Failed to update location:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    }
  };

  const handleLogoUpload = async () => {
    try {
      // Wait for interactions to complete and native modules to be ready
      await new Promise(resolve => {
        InteractionManager.runAfterInteractions(() => {
          // Additional small delay to ensure native module is initialized
          setTimeout(resolve, 200);
        });
      });

      // Launch image picker directly (permissions are requested automatically)
      // Note: MediaTypeOptions is deprecated but MediaType is not available in this version
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const providerId = await resolveProviderId();

      if (!providerId) {
        setTimeout(() => {
          Alert.alert('Error', 'Provider ID not found');
        }, 100);
        return;
      }

      setUploadingLogo(true);

      // Create FormData
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `logo_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('logo', {
        uri: imageUri,
        name: filename,
        type,
      });

      // Upload logo
      console.log('Uploading logo for provider ID:', providerId);
      await vendorAPI.uploadLogo(providerId, formData);

      // Refresh profile data
      await fetchUserProfile();

      setTimeout(() => {
        Alert.alert('Success', 'Logo uploaded successfully!');
      }, 100);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      const isTimeoutError = error?.code === 'ECONNABORTED' || (error?.message && (error.message.includes('timeout') || error.message === 'Network Error'));
      const statusCode = error?.response?.status;
      
      let message = 'Failed to upload logo';
      if (isTimeoutError) {
        // For timeout errors, the upload might have succeeded but the response timed out
        // Check if we got a successful response before the timeout
        if (statusCode === 200 || statusCode === 201) {
          // Server responded with success before timeout - refresh profile to check
          await fetchUserProfile();
          message = 'Upload may have succeeded. Please check your profile. If the logo is not updated, please try again.';
        } else {
          message = 'Upload timed out. Please check your connection and try again.';
        }
      } else {
        message = error?.response?.data?.message || error?.message || 'Failed to upload logo';
      }
      
      setTimeout(() => {
        Alert.alert(isTimeoutError ? 'Connection Issue' : 'Error', message);
      }, 100);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace('/login');
            } catch (error) {
              console.error('Failed to clear AsyncStorage data:', error);
            }
          }
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'business',
      title: 'Business Profile',
      icon: 'business-outline',
      onPress: () => router.push('/update-profile'),
    },
    {
      id: 'password',
      title: 'Change Password',
      icon: 'key-outline',
      onPress: () => router.push('/Screens/ChangePassword'),
    },
    {
      id: 'location',
      title: 'Update My Location',
      icon: 'location-outline',
      onPress: handleUpdateLocation,
    },
    {
      id: 'services',
      title: 'My Services',
      icon: 'grid-outline',
      onPress: () => router.push('/(tabs)/services'),
    },
    {
      id: 'orders',
      title: 'Orders & Bookings',
      icon: 'calendar-outline',
      onPress: () => router.push('/orders'),
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => Alert.alert('Payments', 'Coming soon!'),
    },
    {
      id: 'about',
      title: 'About eKazi',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'eKazi - Service Marketplace v1.0.0'),
    },
  ];

  const lastAccuracyLabel = formatAccuracy(lastAccuracy);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handleLogoUpload}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <View style={styles.avatar}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                  </View>
                ) : profileData.profilePicture ? (
                  <Image source={{ uri: profileData.profilePicture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="business" size={40} color={COLORS.white} />
                  </View>
                )}
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={16} color={COLORS.white} />
                </View>
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{profileData.businessName}</Text>
                <Text style={styles.userEmail}>{profileData.email}</Text>
                <Text style={styles.userPhone}>{profileData.phone}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.ratingText}>{profileData.rating.toFixed(1)}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push('/update-profile')}
              >
                <Ionicons name="pencil" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="grid-outline" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{profileData.totalServices}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>${profileData.totalEarnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star-outline" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{profileData.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Live tracking toggle */}
          <View style={styles.liveTrackingCard}>
            <View style={styles.liveTrackingTextContainer}>
              <Text style={styles.liveTrackingTitle}>Live Location Sharing</Text>
              <Text style={styles.liveTrackingSubtitle}>
                Keep this on while you are available so customers can see you in Nearby results.
              </Text>
              {lastLiveUpdate ? (
                <Text style={styles.liveTrackingMeta}>
                  Last update{' '}
                  {new Date(lastLiveUpdate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {lastAccuracyLabel ? ` | +/-${lastAccuracyLabel}` : ''}
                </Text>
              ) : null}
            </View>
            <Switch
              value={isLiveTracking}
              onValueChange={setIsLiveTracking}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary + '55' }}
              thumbColor={isLiveTracking ? COLORS.primary : COLORS.white}
            />
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: SPACING.lg,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.white + 'CC',
    marginBottom: SPACING.xs,
  },
  userPhone: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.white + 'CC',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  editButton: {
    backgroundColor: COLORS.primary + '40',
    borderRadius: SIZES.radius.lg,
    padding: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statNumber: {
    fontSize: SIZES.xLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  liveTrackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  liveTrackingTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  liveTrackingTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  liveTrackingSubtitle: {
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  liveTrackingMeta: {
    fontSize: SIZES.xSmall,
    fontFamily: FONT.medium,
    color: COLORS.gray500,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: SIZES.radius.xl,
    paddingVertical: SPACING.sm,
    ...SHADOWS.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
  },
  logoutContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    borderRadius: SIZES.radius.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  logoutText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default Profile;
