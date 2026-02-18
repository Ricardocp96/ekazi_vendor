import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { vendorAPI } from '../constants/api';
import { COLORS, FONT, SIZES, SPACING, SHADOWS } from '../constants/theme';

const INITIAL_STATE = {
  username: '',
  email: '',
  phone: '',
  location: '',
  serviceTitle: '',
  description: '',
};

const EditProfileScreen = () => {
  const router = useRouter();
  const [providerId, setProviderId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const placeholderColor = useMemo(() => COLORS.gray400, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const storedId =
        (await AsyncStorage.getItem('providerId')) || (await AsyncStorage.getItem('id'));
      if (!storedId) {
        throw new Error('Provider ID not found in storage');
      }

      const numericId = Number(storedId);
      setProviderId(numericId);

      const response = await vendorAPI.getProfile(numericId);
      const payload = response?.data?.data ?? response?.data ?? {};
      const profile = Array.isArray(payload) ? payload[0] ?? {} : payload;

      setFormData({
        username: profile?.username || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        serviceTitle: profile?.serviceTitle || profile?.service_title || '',
        description: profile?.description || profile?.about || '',
      });
      setLogo(profile?.logo || null);
    } catch (error) {
      console.error('Failed to load provider profile:', error?.message || error);
      Alert.alert('Error', 'Unable to load your profile details right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = useCallback((key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

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
      setLogo(imageUri);

      if (!providerId) {
        setTimeout(() => {
          Alert.alert('Error', 'Provider ID not found');
        }, 100);
        return;
      }

      setUploadingLogo(true);

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || `logo_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('logo', {
        uri: imageUri,
        name: filename,
        type,
      });

      await vendorAPI.uploadLogo(providerId, formData);
      setTimeout(() => {
        Alert.alert('Success', 'Logo uploaded successfully!');
      }, 100);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to upload logo';
      setTimeout(() => {
        Alert.alert('Error', message);
      }, 100);
      setLogo(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!providerId) {
      Alert.alert('Missing ID', 'Unable to determine your provider profile.');
      return;
    }

    const trimmed = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
      serviceTitle: formData.serviceTitle.trim(),
      description: formData.description.trim(),
    };

    if (!trimmed.username || !trimmed.email || !trimmed.phone) {
      Alert.alert('Missing details', 'Username, email, and phone number cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: trimmed.username,
        email: trimmed.email,
        phone: trimmed.phone,
        location: trimmed.location,
      };

      if (trimmed.serviceTitle) {
        payload.serviceTitle = trimmed.serviceTitle;
      }
      if (trimmed.description) {
        payload.description = trimmed.description;
      }

      await vendorAPI.updateProfile(providerId, payload);
      Alert.alert('Profile updated', 'Your profile has been saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to update provider profile:', error?.response || error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while updating your profile.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  }, [formData, providerId, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>
                Update how customers see your business details.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            {/* Logo Upload Section */}
            <View style={styles.logoSection}>
              <Text style={styles.inputLabel}>Service Logo</Text>
              <TouchableOpacity
                style={styles.logoContainer}
                onPress={handleLogoUpload}
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <View style={styles.logoPlaceholder}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : logo ? (
                  <Image source={{ uri: logo }} style={styles.logoImage} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={COLORS.gray400} />
                    <Text style={styles.logoPlaceholderText}>Tap to upload logo</Text>
                  </View>
                )}
                {logo && !uploadingLogo && (
                  <View style={styles.logoEditBadge}>
                    <Ionicons name="camera" size={16} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="e.g. Bright Cleaners"
                placeholderTextColor={placeholderColor}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="business@email.com"
                placeholderTextColor={placeholderColor}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                placeholder="+255 700 000 000"
                placeholderTextColor={placeholderColor}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => updateField('location', value)}
                placeholder="City or area you serve"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Primary Service</Text>
              <TextInput
                style={styles.input}
                value={formData.serviceTitle}
                onChangeText={(value) => updateField('serviceTitle', value)}
                placeholder="e.g. Home cleaning"
                placeholderTextColor={placeholderColor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Highlight your expertise and what customers can expect."
                placeholderTextColor={placeholderColor}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  headerCopy: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: SIZES.large,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    marginTop: SPACING.xs,
    fontFamily: FONT.regular,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.xl,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  logoSection: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: SIZES.xSmall,
    fontFamily: FONT.regular,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
    fontSize: SIZES.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
});

export default EditProfileScreen;

