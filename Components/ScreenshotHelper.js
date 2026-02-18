import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { COLORS, FONT, SIZES, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * ScreenshotHelper Component
 * 
 * This component helps capture screenshots of screens for Google Play Console.
 * Add this component to any screen you want to capture.
 * 
 * Usage:
 * 1. Wrap your screen content with a View and add ref={screenshotRef}
 * 2. Add <ScreenshotHelper viewRef={screenshotRef} screenName="Dashboard" />
 * 
 * The screenshots will be saved to the device's document directory.
 */
export default function ScreenshotHelper({ viewRef, screenName = 'Screen' }) {
  const captureScreenshot = async () => {
    if (!viewRef?.current) {
      Alert.alert('Error', 'View reference not available');
      return;
    }

    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Create screenshots directory if it doesn't exist
      const screenshotsDir = `${FileSystem.documentDirectory}screenshots/`;
      const dirInfo = await FileSystem.getInfoAsync(screenshotsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(screenshotsDir, { intermediates: true });
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${screenName}_${timestamp}.png`;
      const destination = `${screenshotsDir}${filename}`;

      // Move file to screenshots directory
      await FileSystem.moveAsync({
        from: uri,
        to: destination,
      });

      Alert.alert(
        'Screenshot Saved!',
        `Saved to: ${destination}\n\nYou can find it in your device's document directory.`,
        [
          { text: 'OK' },
          {
            text: 'Copy Path',
            onPress: () => {
              // On some platforms, you might want to copy to clipboard
              console.log('Screenshot path:', destination);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      Alert.alert('Error', `Failed to capture screenshot: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={captureScreenshot}>
        <Ionicons name="camera" size={20} color={COLORS.white} />
        <Text style={styles.buttonText}>Capture Screenshot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 9999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  buttonText: {
    fontFamily: FONT.medium,
    fontSize: SIZES.small,
    color: COLORS.white,
  },
});
