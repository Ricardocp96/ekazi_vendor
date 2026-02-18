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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from '../../constants/theme';
import { vendorAPI } from '../../constants/api';

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const [token, setToken] = useState(params?.token || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!token.trim()) {
      Alert.alert("Error", "Please enter the reset token");
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await vendorAPI.resetPassword({
        token,
        newPassword,
      });
      
      Alert.alert(
        "Success",
        response.data?.message || "Password has been successfully reset. You can now login with your new password.",
        [
          {
            text: "Go to Login",
            onPress: () => router.replace('/login')
          }
        ]
      );
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
              <Ionicons name="lock-closed-outline" size={40} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.welcomeText}>Reset Password</Text>
          <Text style={styles.subtitleText}>
            Enter your reset token and new password
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Reset Token"
                placeholderTextColor={COLORS.gray400}
                value={token}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                onChangeText={setToken}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="New Password"
                placeholderTextColor={COLORS.gray400}
                value={newPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={!isPasswordVisible}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.gray400} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="Confirm New Password"
                placeholderTextColor={COLORS.gray400}
                value={confirmPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={!isConfirmPasswordVisible}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                <Ionicons 
                  name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} 
                  size={20} 
                  color={COLORS.gray400} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>Reset Password</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} style={styles.buttonIcon} />
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
  passwordInput: {
    paddingRight: SPACING.large,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.medium,
    padding: SPACING.small,
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

