import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Alert,
  StatusBar 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_CONFIG } from '../constants/api';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../constants/theme';

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
  const router = useRouter();

  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('id');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const data = await response.json();
      setProfileData({
        username: data.username || 'Vendor',
        email: data.email || 'No email provided',
        phone: data.mobile || 'No phone provided',
        profilePicture: data.profilePicture || null,
        businessName: data.businessName || 'My Business',
        rating: data.rating || 0,
        totalServices: data.totalServices || 0,
        totalEarnings: data.totalEarnings || 0,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error.message);
      // Set default data if API fails
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
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
      id: 'services',
      title: 'My Services',
      icon: 'grid-outline',
      onPress: () => router.push('/(tabs)/services'),
    },
    {
      id: 'orders',
      title: 'Orders & Bookings',
      icon: 'calendar-outline',
      onPress: () => Alert.alert('Orders', 'Coming soon!'),
    },
    {
      id: 'earnings',
      title: 'Earnings & Analytics',
      icon: 'trending-up-outline',
      onPress: () => Alert.alert('Earnings', 'Coming soon!'),
    },
    {
      id: 'reviews',
      title: 'Reviews & Ratings',
      icon: 'star-outline',
      onPress: () => Alert.alert('Reviews', 'Coming soon!'),
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => Alert.alert('Payments', 'Coming soon!'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Notifications', 'Coming soon!'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Coming soon!'),
    },
    {
      id: 'about',
      title: 'About eKazi',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'eKazi - Service Marketplace v1.0.0'),
    },
  ];

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
              <View style={styles.avatarContainer}>
                {profileData.profilePicture ? (
                  <Image source={{ uri: profileData.profilePicture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="business" size={40} color={COLORS.white} />
                  </View>
                )}
              </View>
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
