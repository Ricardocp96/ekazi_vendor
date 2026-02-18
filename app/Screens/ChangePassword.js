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
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SIZES, SHADOWS, SPACING } from "../../constants/theme";
import { vendorAPI } from "../../constants/api";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
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

    if (oldPassword === newPassword) {
      Alert.alert("Error", "New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      const response = await vendorAPI.changePassword({
        oldPassword,
        newPassword,
      });

      Alert.alert(
        "Success",
        response.data?.message || "Password updated successfully.",
        [{ text: "OK", onPress: () => router.back() }],
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unknown error";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="key-outline" size={40} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.welcomeText}>Change Password</Text>
          <Text style={styles.subtitleText}>
            Enter your current password and a new one
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.gray400}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="Current Password"
                placeholderTextColor={COLORS.gray400}
                value={oldPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={!isOldPasswordVisible}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity
                onPress={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isOldPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.gray400}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.passwordInput]}
                placeholder="New Password"
                placeholderTextColor={COLORS.gray400}
                value={newPassword}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={!isNewPasswordVisible}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isNewPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.gray400}
                style={styles.inputIcon}
              />
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
              <TouchableOpacity
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color={COLORS.gray400}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>Update Password</Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
              </View>
            )}
          </TouchableOpacity>
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
    alignItems: "center",
    paddingTop: SPACING.xLarge,
    paddingBottom: SPACING.xxLarge,
  },
  backButton: {
    position: "absolute",
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
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  welcomeText: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.small,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
});
