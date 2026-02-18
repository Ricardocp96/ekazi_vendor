import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { requireOptionalNativeModule } from "expo-modules-core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import callSocketService from "../services/callSocketService";
import { COLORS } from "../constants/theme";

export const unstable_settings = {
  initialRouteName: "index",
};

const Layout = () => {
  const router = useRouter();
  // Suppress non-critical keep-awake errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args[0]?.toString() || '';
      // Suppress keep-awake errors (non-critical)
      if (errorMessage.includes('Unable to activate keep awake') || 
          errorMessage.includes('keep awake')) {
        return;
      }
      originalError.apply(console, args);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      const errorMessage = event?.reason?.message || event?.reason?.toString() || '';
      if (errorMessage.includes('Unable to activate keep awake') || 
          errorMessage.includes('keep awake')) {
        event.preventDefault(); // Suppress the error
        return;
      }
    };

    // Add global error handlers
    if (typeof global !== 'undefined') {
      const originalHandler = global.ErrorUtils?.getGlobalHandler?.();
      if (global.ErrorUtils) {
        global.ErrorUtils.setGlobalHandler((error, isFatal) => {
          const errorMessage = error?.message || error?.toString() || '';
          if (errorMessage.includes('Unable to activate keep awake') || 
              errorMessage.includes('keep awake')) {
            return; // Suppress keep-awake errors
          }
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      }
    }

    return () => {
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    let responseSubscription;
    let active = true;
    let cleanupFn;

    const setup = async () => {
      try {
        const providerId = await AsyncStorage.getItem("id");
        if (providerId && active) {
          callSocketService.connect(null, providerId);
        }
      } catch (error) {
        console.log("[Call] Failed to initialize global socket", error);
      }

      const handleIncomingCall = (data) => {
        router.push({
          pathname: "/Screens/CallScreen",
          params: {
            callId: String(data.callId),
            channelName: data.channelName,
            appId: "",
            userId: data.userId || "",
            providerId: data.providerId || "",
            recipientName: data.callerName || "Customer",
            isIncoming: "true",
          },
        });
      };

      callSocketService.on("call_incoming", handleIncomingCall);

      try {
        const pushTokenManager =
          requireOptionalNativeModule("ExpoPushTokenManager");
        if (!pushTokenManager) {
          console.log("[Push] Notifications not available");
          return;
        }

        const Notifications = await import("expo-notifications");
        if (
          Notifications?.addNotificationResponseReceivedListener &&
          typeof Notifications.addNotificationResponseReceivedListener === "function"
        ) {
          responseSubscription =
            Notifications.addNotificationResponseReceivedListener((response) => {
              const data = response?.notification?.request?.content?.data || {};
              if (data?.type === "call") {
                router.push({
                  pathname: "/Screens/CallScreen",
                  params: {
                    callId: String(data.callId),
                    channelName: data.channelName,
                    appId: "",
                    userId: String(data.userId || ""),
                    providerId: String(data.providerId || ""),
                    recipientName: data.callerName || "Customer",
                    isIncoming: "true",
                  },
                });
              } else if (data?.type === "message") {
                router.push({
                  pathname: "/Screens/Chatroom",
                  params: {
                    userId: String(data.userId || ""),
                    userName: data.senderName || "Customer",
                  },
                });
              }
            });
        } else {
          console.log("[Push] Notifications not available");
        }
      } catch (error) {
        console.log("[Push] Notifications not available", error?.message || error);
      }

      cleanupFn = () => {
        callSocketService.off("call_incoming", handleIncomingCall);
        if (responseSubscription) {
          responseSubscription.remove();
        }
      };
    };

    setup();
    return () => {
      active = false;
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [router]);
  const [fontsLoaded] = useFonts({
    DMBold: require("../assets/fonts/DMSans-Bold.ttf"),
    DMMedium: require("../assets/fonts/DMSans-Medium.ttf"),
    DMRegular: require("../assets/fonts/DMSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontFamily: 'DMBold',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="update-profile"
          options={{ title: 'Edit Profile', headerShown: false }}
        />
        <Stack.Screen name="orders/index" options={{ title: 'Orders' }} />
        <Stack.Screen name="calendar/index" options={{ title: 'Calendar' }} />
        <Stack.Screen
          name="Screens/Chatroom"
          options={{ title: 'Conversation', headerShown: false }}
        />
        <Stack.Screen
          name="Screens/CallScreen"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Screens/ForgotPassword"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Screens/ResetPassword"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Screens/ChangePassword"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
};

export default Layout;
