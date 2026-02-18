import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';
import { vendorAPI } from '../constants/api';

const loadExpoNotifications = async () => {
  try {
    const pushTokenManager = requireOptionalNativeModule('ExpoPushTokenManager');
    if (!pushTokenManager) {
      console.log('[Push] expo-notifications not available in this build');
      return null;
    }

    const Notifications = await import('expo-notifications');
    const Device = await import('expo-device');
    const Constants = await import('expo-constants');
    return { Notifications, Device, Constants: Constants.default || Constants };
  } catch (error) {
    console.log('[Push] expo-notifications not available in this build');
    return null;
  }
};

const configureAndroidChannels = async (Notifications) => {
  if (Platform.OS !== 'android') {
    return;
  }
  if (!Notifications?.setNotificationChannelAsync) {
    return;
  }
  const importance = Notifications.AndroidImportance?.HIGH;
  const maxImportance = Notifications.AndroidImportance?.MAX;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: importance ?? 4,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });

  await Notifications.setNotificationChannelAsync('alerts', {
    name: 'Alerts',
    importance: maxImportance ?? 5,
    sound: 'default',
    vibrationPattern: [0, 400, 400, 400],
    lightColor: '#FF6600',
  });

  await Notifications.setNotificationChannelAsync('calls', {
    name: 'Calls',
    importance: maxImportance ?? 5,
    sound: 'default',
    vibrationPattern: [0, 500, 500, 500],
    lightColor: '#FF0000',
  });
};

export const registerVendorPushToken = async (providerId) => {
  if (!providerId) {
    return;
  }

  const modules = await loadExpoNotifications();
  if (!modules) {
    return;
  }

  const { Notifications, Device, Constants } = modules;

  await configureAndroidChannels(Notifications);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (!Device.isDevice) {
    console.log('[Push] Physical device required for push notifications');
    return;
  }

  const resolveProjectId = () => {
    return (
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      undefined
    );
  };

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return;
  }

  try {
    const projectId = resolveProjectId();
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const pushToken = tokenResponse?.data;
    if (pushToken) {
      await vendorAPI.updatePushToken(providerId, pushToken);
      console.log('[Push] Vendor push token registered');
    }
  } catch (error) {
    console.error('[Push] Failed to register push token', error);
  }
};
