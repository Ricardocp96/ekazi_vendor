import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import createAgoraRtcEngine, {
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  IRtcEngineEventHandler,
} from 'react-native-agora';
import { COLORS, FONT, SIZES, SPACING } from '../../constants/theme';
import { vendorAPI } from '../../constants/api';
import callSocketService from '../../services/callSocketService';

type CallState = 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'error';

const CallScreen = () => {
  console.log('[CallScreen] Component mounting...');
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const callId = params?.callId as string;
  const channelName = params?.channelName as string;
  const appId = params?.appId as string;
  const userId = params?.userId as string;
  const providerId = params?.providerId as string;
  const recipientName = params?.recipientName as string || 'Customer';
  const isIncoming = params?.isIncoming === 'true';

  console.log('[CallScreen] Params received:', {
    callId,
    channelName,
    appId,
    userId,
    providerId,
    isIncoming,
  });

  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ringing' : 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<IRtcEngine | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    console.log('[CallScreen] useEffect running, isIncoming:', isIncoming);
    if (!isIncoming) {
      console.log('[CallScreen] Outgoing call - waiting for acceptance');
    } else {
      console.log('[CallScreen] Incoming call - waiting for user to accept');
    }

    const handleAccepted = () => {
      if (isIncoming) {
        return;
      }
      if (hasStartedRef.current) {
        return;
      }
      console.log('[CallScreen] Call accepted, starting connection');
      setCallState('connecting');
      hasStartedRef.current = true;
      initializeCall();
    };

    const handleRejected = () => {
      console.log('[CallScreen] Call rejected');
      setCallState('rejected');
      setTimeout(() => router.back(), 600);
    };

    const handleEnded = () => {
      console.log('[CallScreen] Call ended');
      endCallLocally();
    };

    const handleFailed = (data: any) => {
      console.log('[CallScreen] Call failed', data);
      setError(data?.reason || 'Call failed');
      setCallState('error');
    };

    callSocketService.on('call_accepted', handleAccepted);
    callSocketService.on('call_rejected', handleRejected);
    callSocketService.on('call_ended', handleEnded);
    callSocketService.on('call_failed', handleFailed);

    return () => {
      console.log('[CallScreen] Cleaning up...');
      callSocketService.off('call_accepted', handleAccepted);
      callSocketService.off('call_rejected', handleRejected);
      callSocketService.off('call_ended', handleEnded);
      callSocketService.off('call_failed', handleFailed);
      cleanup();
    };
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    console.log('[Permission] Starting permission request flow');
    
    if (Platform.OS === 'android') {
      try {
        console.log('[Permission] Checking current permission status...');
        // First check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        
        console.log('[Permission] Current permission status:', checkResult);
        
        if (checkResult) {
          console.log('[Permission] ✅ Microphone permission already granted');
          return true;
        }

        console.log('[Permission] Permission not granted, requesting...');
        // Request permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Ekazi Vendor needs access to your microphone to make voice calls',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        console.log('[Permission] Permission request result:', granted);
        console.log('[Permission] GRANTED constant:', PermissionsAndroid.RESULTS.GRANTED);
        console.log('[Permission] DENIED constant:', PermissionsAndroid.RESULTS.DENIED);
        console.log('[Permission] NEVER_ASK_AGAIN constant:', PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[Permission] ✅ Microphone permission granted by user');
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          console.log('[Permission] ❌ Permission permanently denied');
          // Permission was denied permanently
          Alert.alert(
            'Microphone Permission Required',
            'Microphone permission is required to make calls. Please enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
            ]
          );
          return false;
        } else {
          // Permission was denied (but can be asked again)
          console.log('[Permission] ❌ Microphone permission denied (can ask again)');
          return false;
        }
      } catch (err: any) {
        console.error('[Permission] ❌ Error requesting permission:', err);
        console.error('[Permission] Error type:', typeof err);
        console.error('[Permission] Error message:', err?.message);
        console.error('[Permission] Error code:', err?.code);
        console.error('[Permission] Error stack:', err?.stack);
        console.error('[Permission] Full error object:', err);
        
        // If permission is not declared in manifest, check will throw
        const errorMessage = err?.message || String(err) || 'Unknown error';
        if (
          errorMessage.includes('PERMISSION') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('RECORD_AUDIO') ||
          err?.code === 'E_PERMISSION'
        ) {
          Alert.alert(
            'Permission Not Available',
            'Microphone permission (RECORD_AUDIO) is not declared in the app manifest. The app needs to be rebuilt to include this permission.\n\nPlease rebuild the app using:\n\nnpx expo prebuild --clean\nnpx expo run:android',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Permission Error',
            `Failed to request microphone permission: ${errorMessage}\n\nPlease check app settings or rebuild the app.`,
            [{ text: 'OK' }]
          );
        }
        return false;
      }
    }
    // iOS permissions are handled via Info.plist and requested automatically by the system
    console.log('[Permission] iOS platform - permissions handled via Info.plist');
    return true;
  };

  const initializeCall = async () => {
    try {
      console.log('[Call] Initializing call...');
      console.log('[Call] Platform:', Platform.OS);
      console.log('[Call] isIncoming:', isIncoming);

      setCallState('connecting');
      
      const hasPermission = await requestPermissions();
      console.log('[Call] Permission result:', hasPermission);
      
      if (!hasPermission) {
        console.log('[Call] ❌ Permission denied, showing error');
        setError('Microphone permission is required to make calls. Please grant permission and try again.');
        setCallState('error');
        return;
      }
      
      console.log('[Call] ✅ Permission granted, proceeding with call setup');

      if (!appId || !channelName) {
        // If appId not provided, fetch token first to get it
        const uidBase = parseInt(providerId || '0', 10) || Math.floor(Math.random() * 100000);
        const uid = uidBase + 1000000;
        const tokenResponse = await vendorAPI.generateToken({ channelName, uid });
        const fetchedAppId = tokenResponse.data.appId;
        
        if (!fetchedAppId) {
          setError('Missing call configuration');
          setCallState('error');
          return;
        }

        // Initialize with fetched appId
        await joinChannel(fetchedAppId, tokenResponse.data.token, uid);
        return;
      }

      // Generate token and join channel
      const uidBase = parseInt(providerId || '0', 10) || Math.floor(Math.random() * 100000);
      const uid = uidBase + 1000000;
      const tokenResponse = await vendorAPI.generateToken({ channelName, uid });
      const token = tokenResponse.data.token;

      await joinChannel(appId, token, uid);
    } catch (err: any) {
      console.error('Failed to initialize call:', err);
      setError(err?.message || 'Failed to start call');
      setCallState('error');
    }
  };

  const joinChannel = async (appIdValue: string, token: string, uid: number) => {
    // Initialize Agora engine
    const engine = createAgoraRtcEngine();
    engine.initialize({
      appId: appIdValue,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });
    engineRef.current = engine;

    // Set event handlers
    const eventHandler: IRtcEngineEventHandler = {
      onJoinChannelSuccess: (channel, uid, elapsed) => {
        console.log('Joined channel successfully');
        setCallState('connected');
        startTimeRef.current = new Date();
        startDurationTimer();
      },
      onError: (err, msg) => {
        console.error('Agora error:', err, msg);
        setError(`Call error: ${msg}`);
        setCallState('error');
      },
      onLeaveChannel: () => {
        console.log('Left channel');
      },
      onUserOffline: (uid, reason) => {
        console.log('User offline:', uid, reason);
        handleEndCall();
      },
      onAudioVolumeIndication: (speakers, totalVolume) => {
        const list =
          Array.isArray(speakers)
            ? speakers
            : Array.isArray((speakers as any)?.speakers)
              ? (speakers as any).speakers
              : [];
        list.forEach((speaker) => {
          if (speaker?.volume > 10) {
            console.log(
              `[Audio] uid=${speaker.uid} volume=${speaker.volume} vad=${speaker.vad} total=${totalVolume ?? '-'}`,
            );
          }
        });
      },
    };
    engine.registerEventHandler(eventHandler);

    // Enable audio
    await engine.enableAudio();
    await engine.enableAudioVolumeIndication(300, 3, true);
    await engine.setEnableSpeakerphone(true);
    setIsSpeakerOn(true);
    await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    await engine.joinChannel(token, channelName, uid, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });

    // If incoming call, accept it
    if (isIncoming && callId) {
      callSocketService.acceptCall({
        callId: parseInt(callId, 10),
        userId,
        providerId,
      });
    }
  };

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        setCallDuration(elapsed);
      }
    }, 1000);
  };

  const handleMuteToggle = async () => {
    if (engineRef.current) {
      try {
        await engineRef.current.muteLocalAudioStream(!isMuted);
        setIsMuted(!isMuted);
      } catch (err) {
        console.error('Failed to toggle mute:', err);
      }
    }
  };

  const handleSpeakerToggle = async () => {
    if (engineRef.current) {
      try {
        await engineRef.current.setEnableSpeakerphone(!isSpeakerOn);
        setIsSpeakerOn(!isSpeakerOn);
      } catch (err) {
        console.error('Failed to toggle speaker:', err);
      }
    }
  };

  const endCallLocally = async () => {
    try {
      if (engineRef.current) {
        await engineRef.current.leaveChannel();
        engineRef.current.release();
        engineRef.current = null;
      }

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setCallState('ended');
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (err) {
      console.error('Error ending call:', err);
      router.back();
    }
  };

  const handleEndCall = async () => {
    try {
      if (callId && userId && providerId) {
        callSocketService.endCall({
          callId: parseInt(callId, 10),
          userId,
          providerId,
        });
      }
      await endCallLocally();
    } catch (err) {
      console.error('Error ending call:', err);
      router.back();
    }
  };

  const handleRejectCall = async () => {
    try {
      if (callId && userId && providerId) {
        callSocketService.rejectCall({
          callId: parseInt(callId, 10),
          userId,
          providerId,
        });
      }
      router.back();
    } catch (err) {
      console.error('Error rejecting call:', err);
      router.back();
    }
  };

  const cleanup = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (engineRef.current) {
      engineRef.current.release();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isIncomingRinging = callState === 'ringing' && isIncoming;
  const showEndButton =
    callState === 'connected' ||
    callState === 'connecting' ||
    (callState === 'ringing' && !isIncoming);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.recipientName}>{recipientName}</Text>
          {callState === 'connected' && (
            <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
          )}
          {callState === 'ringing' && (
            <Text style={styles.statusText}>Ringing...</Text>
          )}
          {callState === 'connecting' && (
            <Text style={styles.statusText}>Connecting...</Text>
          )}
          {callState === 'error' && error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        {callState === 'connected' && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={handleMuteToggle}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
              onPress={handleSpeakerToggle}
            >
              <Ionicons
                name={isSpeakerOn ? 'volume-high' : 'volume-low'}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.actions, isIncomingRinging && styles.actionsIncoming]}>
          {isIncomingRinging && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleRejectCall}
              >
                <Ionicons name="call" size={32} color={COLORS.white} style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => {
                  console.log('[CallScreen] Accept button pressed for incoming call');
                  initializeCall();
                }}
              >
                <Ionicons name="call" size={32} color={COLORS.white} />
              </TouchableOpacity>
            </>
          )}

          {showEndButton && (
            <TouchableOpacity
              style={[styles.actionButton, styles.endButton]}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={32} color={COLORS.white} style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          )}

          {callState === 'error' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.endButton]}
                onPress={() => router.back()}
              >
                <Ionicons name="close" size={32} color={COLORS.white} />
              </TouchableOpacity>
              {error && error.includes('permission') && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => {
                      console.log('[CallScreen] Retry button pressed');
                      initializeCall();
                    }}
                  >
                    <Ionicons name="refresh" size={32} color={COLORS.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary, marginLeft: 10 }]}
                    onPress={() => {
                      console.log('[CallScreen] Opening settings...');
                      Linking.openSettings();
                    }}
                  >
                    <Ionicons name="settings" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray900,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  recipientName: {
    fontSize: SIZES.xxxLarge,
    fontFamily: FONT.bold,
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  duration: {
    fontSize: SIZES.large,
    fontFamily: FONT.medium,
    color: COLORS.gray400,
    marginTop: SPACING.sm,
  },
  statusText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.regular,
    color: COLORS.gray400,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginVertical: SPACING.xl,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  actionsIncoming: {
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  endButton: {
    backgroundColor: COLORS.error,
  },
});

export default CallScreen;

