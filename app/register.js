import React, { useState, useEffect } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  Platform,
  Alert,
  StyleSheet,
  TextInput,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { apiClient, API_CONFIG } from "../constants/api";
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from "../constants/theme";
import * as Location from 'expo-location';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('vendor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const accountTypes = [
    { label: 'Vendor', value: 'vendor' },
    { label: 'Client', value: 'client' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = position.coords;
        let humanReadable = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const places = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (places && places.length > 0) {
            const p = places[0];
            const parts = [p.name, p.street, p.city, p.region, p.country].filter(Boolean);
            if (parts.length) {
              humanReadable = parts.join(', ');
            }
          }
        } catch (_) {
          // fallback to lat,long already set
        }
        setLocation(humanReadable);
      } catch (e) {
        // ignore errors; user can type manually
      }
    })();
  }, []);

  async function register() {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!username || !password || !email || !phone || !location) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.PROVIDER_REGISTER, {
        email: email,
        phone: phone,
        location: location,
        username: username,
        password: password,
      });

      if (response.data) {
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace('/login')
          }
        ]);
      }
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/join.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Join eKazi Vendor</Text>
            <Text style={styles.subtitle}>Create your vendor account</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            {/* Account Type Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.accountTypeContainer}>
                {accountTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.accountTypeButton,
                      selectedValue === type.value && styles.accountTypeButtonSelected
                    ]}
                    onPress={() => setSelectedValue(type.value)}
                  >
                    <Text style={[
                      styles.accountTypeText,
                      selectedValue === type.value && styles.accountTypeTextSelected
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mobile Number Input */}
            <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
              placeholder="Enter email"
                  placeholderTextColor={COLORS.gray400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter phone number"
              placeholderTextColor={COLORS.gray400}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Location</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter location"
              placeholderTextColor={COLORS.gray400}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter username"
                  placeholderTextColor={COLORS.gray400}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.gray400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.gray400} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Confirm password"
                  placeholderTextColor={COLORS.gray400}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={COLORS.gray400} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={register}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Login here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.xxLarge,
  },
  logoContainer: {
    marginBottom: SPACING.large,
  },
  logo: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  subtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    flex: 2,
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.xxLarge,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.large,
    padding: SPACING.large,
    ...SHADOWS.medium,
  },
  inputContainer: {
    marginBottom: SPACING.large,
  },
  inputLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.small,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.medium,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  accountTypeButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  accountTypeText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.textSecondary,
  },
  accountTypeTextSelected: {
    color: COLORS.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.medium,
    paddingHorizontal: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.small,
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.medium,
  },
  passwordInput: {
    paddingRight: SPACING.large,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.medium,
    padding: SPACING.small,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
    marginTop: SPACING.medium,
    ...SHADOWS.small,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  registerButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.large,
  },
  loginText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
});
