import React, { useState } from "react";
import { 
  ScrollView, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  StyleSheet, 
  ActivityIndicator,
  Text,
  TextInput,
  Alert,
  Platform
} from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../../constants/theme';
import { vendorAPI } from '../../constants/api';

export default function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestReset = async () => {
    if (!usernameOrEmail.trim()) {
      Alert.alert("Error", "Please enter your username or email");
      return;
    }

    setLoading(true);
    try {
      const response = await vendorAPI.requestPasswordReset(usernameOrEmail);
      
      // In production, token is sent via email, not returned in response
      if (response.data && response.data.token) {
        // Development mode - token returned for testing
        Alert.alert(
          "Reset Token Generated",
          `Your reset token is: ${response.data.token}\n\nPlease use this token to reset your password.\n\n(Note: In production, this will be sent to your email)`,
          [
            {
              text: "Continue to Reset",
              onPress: () => router.push({
                pathname: '/Screens/ResetPassword',
                params: { token: response.data.token }
              })
            }
          ]
        );
      } else {
        // Production mode - token sent via email
        Alert.alert(
          "Check Your Email",
          response.data?.message || "If an account with that username or email exists, a password reset email has been sent. Please check your email for the reset token.",
          [
            {
              text: "I Have the Token",
              onPress: () => router.push('/Screens/ResetPassword')
            },
            {
              text: "OK",
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Unknown error';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="key-outline" size={40} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.welcomeText}>Forgot Password?</Text>
          <Text style={styles.subtitleText}>
            Enter your username or email and we'll send you a reset token
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Username or Email"
                placeholderTextColor={COLORS.gray400}
                value={usernameOrEmail}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setUsernameOrEmail}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRequestReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>Request Reset Token</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.backToLoginLink}>Sign In</Text>
            </TouchableOpacity>
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
    paddingHorizontal: SPACING.large,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: SPACING.xLarge,
    paddingBottom: SPACING.xxLarge,
  },
  backButton: {
    position: 'absolute',
    top: SPACING.xLarge,
    left: SPACING.large,
    padding: SPACING.small,
  },
  logoContainer: {
    marginTop: SPACING.xxLarge,
    marginBottom: SPACING.large,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  welcomeText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.large,
  },
  formSection: {
    flex: 1,
    paddingTop: SPACING.xLarge,
  },
  inputContainer: {
    marginBottom: SPACING.large,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.medium,
    height: 56,
  },
  inputIcon: {
    marginRight: SPACING.small,
  },
  textInput: {
    flex: 1,
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textPrimary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    paddingVertical: SPACING.medium,
    marginTop: SPACING.large,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginRight: SPACING.small,
  },
  buttonIcon: {
    marginLeft: SPACING.xs,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xLarge,
  },
  backToLoginText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },
  backToLoginLink: {
    fontSize: SIZES.medium,
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
});

