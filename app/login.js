import React, { useState } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from "../constants/theme";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function auth_api() {
    try {
      setLoading(true);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.PROVIDER_LOGIN, {
        username: username,
        password: password,
      });

      if (response.data) {
        console.log('Login successful:', response.data);
        
        // Store user data atomically so other screens can read it immediately
        const resolvedUsername = response.data.username || username;
        const resolvedId = response.data.id?.toString() || '';
        const dataToPersist = [
          ['username', resolvedUsername],
          ['userType', 'vendor'],
          // Maintain both "id" and "providerId" keys for backwards compatibility
          ['providerId', resolvedId],
          ['id', resolvedId],
        ];

        if (response.data.access_token) {
          dataToPersist.push(['authToken', response.data.access_token]);
        }

        await AsyncStorage.multiSet(dataToPersist);

        // Confirm storage is ready before navigating to avoid race conditions
        const storedId = await AsyncStorage.getItem('id');
        if (!storedId) {
          console.warn('Login succeeded but vendor id is not yet available in storage.');
        } else {
          console.log('Vendor id cached in storage:', storedId);
        }

        // Navigate to tabs
        router.replace('/(tabs)');
      } else {
        setLoading(false);
        Alert.alert("Error", "Incorrect credentials");
      }
    } catch (error) {
      setLoading(false);
      const message = error?.response?.data?.message || error?.message || 'Network error or server error occurred';
      const status = error?.response?.status;
      console.error('Login error:', { status, message, url: API_CONFIG.ENDPOINTS.PROVIDER_LOGIN });
      Alert.alert(
        'Login Failed',
        status ? `(${status}) ${message}` : message
      );
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
              source={require("../assets/new_logo.jpeg")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>eKazi Vendor</Text>
            <Text style={styles.subtitle}>Sign in to manage your services</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your username"
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
                  placeholder="Enter your password"
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

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => router.push('/Screens/ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={auth_api}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Register here</Text>
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: SPACING.small,
    marginBottom: SPACING.medium,
  },
  forgotPasswordText: {
    fontSize: SIZES.small,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    paddingVertical: SPACING.medium,
    alignItems: 'center',
    marginTop: SPACING.medium,
    ...SHADOWS.medium,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  loginButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.white,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.large,
  },
  registerText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
});
