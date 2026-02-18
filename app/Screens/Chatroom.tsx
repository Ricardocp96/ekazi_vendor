import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT, SIZES, SPACING } from '../../constants/theme';
import { vendorAPI } from '../../constants/api';
import callSocketService from '../../services/callSocketService';

type MessageShape = {
  id: number;
  userId: string;
  providerId: string;
  senderType: 'user' | 'provider';
  content: string;
  createdAt: string;
};

const POLL_INTERVAL_MS = 5000;

const Chatroom = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const userIdParam = useMemo(() => {
    const raw = params?.userId;
    if (Array.isArray(raw)) {
      return raw[0];
    }
    return raw ?? null;
  }, [params]);

  const userName = useMemo(() => {
    const raw = params?.userName;
    if (Array.isArray(raw)) {
      return raw[0];
    }
    return raw ?? 'Customer';
  }, [params]);

  const [providerId, setProviderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageShape[]>([]);
  const [composerText, setComposerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  const userId = userIdParam;

  const ensureProviderId = useCallback(async () => {
    if (providerId) {
      return providerId;
    }
    const stored =
      (await AsyncStorage.getItem('providerId')) ||
      (await AsyncStorage.getItem('id'));
    if (stored) {
      setProviderId(stored);
    }
    return stored;
  }, [providerId]);

  const fetchMessages = useCallback(
    async (showLoader = false) => {
      const resolvedProviderId = await ensureProviderId();
      if (!resolvedProviderId || !userId) {
        setLoading(false);
        return;
      }
      try {
        if (showLoader) {
          setLoading(true);
        }
        setError(null);
        const response = await vendorAPI.getConversation(userId, resolvedProviderId);
        const data = Array.isArray(response.data) ? response.data : [];
        setMessages(
          data
            .map((item) => ({
              ...item,
              id: item.id ?? Number(item.createdAt ?? Date.now()),
              userId: item.userId?.toString?.() ?? userId,
              providerId: item.providerId?.toString?.() ?? resolvedProviderId,
            }))
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            ),
        );
      } catch (err: any) {
        console.error('Failed to fetch provider conversation', err);
        setError(err?.message || 'Unable to load messages.');
      } finally {
        setLoading(false);
      }
    },
    [ensureProviderId, userId],
  );

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const bootstrap = async () => {
        if (!isMounted) return;
        await fetchMessages(true);
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
        pollRef.current = setInterval(() => {
          fetchMessages(false);
        }, POLL_INTERVAL_MS);
      };
      bootstrap();

      return () => {
        isMounted = false;
        if (pollRef.current) {
          clearInterval(pollRef.current);
        }
      };
    }, [fetchMessages]),
  );

  useEffect(() => {
    // Connect to call socket when providerId is available
    const connectCallSocket = async () => {
      const resolvedProviderId = await ensureProviderId();
      if (resolvedProviderId) {
        callSocketService.connect(null, resolvedProviderId);
      }
    };
    connectCallSocket();

    // Set up incoming call listener
    const handleIncomingCall = (data: any) => {
      router.push({
        pathname: '/Screens/CallScreen',
        params: {
          callId: String(data.callId),
          channelName: data.channelName,
          appId: '', // Will be fetched from token endpoint
          userId: data.userId,
          providerId: providerId || '',
          recipientName: userName || 'Customer',
          isIncoming: 'true',
        },
      });
    };

    callSocketService.on('call_incoming', handleIncomingCall);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      callSocketService.off('call_incoming', handleIncomingCall);
    };
  }, [providerId, userId, userName, router, ensureProviderId]);

  const handleSend = useCallback(async () => {
    const trimmed = composerText.trim();
    if (!trimmed) {
      return;
    }
    const resolvedProviderId = await ensureProviderId();
    if (!userId || !resolvedProviderId) {
      setError('Unable to identify chat participants.');
      return;
    }
    try {
      setSending(true);
      await vendorAPI.sendMessage({
        userId,
        providerId: resolvedProviderId,
        senderType: 'provider',
        content: trimmed,
      });
      setComposerText('');
      await fetchMessages(false);
    } catch (err: any) {
      console.error('Failed to send provider message', err);
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [composerText, ensureProviderId, fetchMessages, userId]);

  const handleCall = useCallback(async () => {
    if (!userId || !providerId || isCalling) {
      return;
    }

    try {
      setIsCalling(true);
      const callResponse = await vendorAPI.createCall({ userId, providerId });
      const call = callResponse.data;

      const uid = parseInt(providerId, 10) || Math.floor(Math.random() * 100000);
      const tokenResponse = await vendorAPI.generateToken({
        channelName: call.channelName,
        uid,
      });

      callSocketService.inviteCall({
        callId: call.id,
        userId,
        providerId,
        channelName: call.channelName,
        callerName: 'Vendor',
      });

      router.push({
        pathname: '/Screens/CallScreen',
        params: {
          callId: String(call.id),
          channelName: call.channelName,
          appId: tokenResponse.data.appId,
          userId,
          providerId,
          recipientName: userName,
          isIncoming: 'false',
        },
      });
    } catch (err: any) {
      console.error('Failed to initiate call:', err);
      setError(err?.message || 'Unable to start call. Please try again.');
    } finally {
      setIsCalling(false);
    }
  }, [userId, providerId, isCalling, router, userName]);

  const renderMessage = ({ item }: { item: MessageShape }) => {
    const isProvider = item.senderType === 'provider';
    return (
      <View
        style={[
          styles.messageRow,
          isProvider ? styles.messageRowProvider : styles.messageRowUser,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isProvider ? styles.providerBubble : styles.userBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              !isProvider && styles.userMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTimestamp,
              !isProvider && styles.userTimestamp,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const keyExtractor = (item: MessageShape) => `${item.id}`;

  const canChat = Boolean(userId && providerId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerSubtitle}>Keep your customer informed</Text>
        </View>
        {canChat && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            disabled={isCalling}
          >
            {isCalling ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="call" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {canChat && (
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchMessages(true)}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={keyExtractor}
              renderItem={renderMessage}
              contentContainerStyle={[
                styles.listContent,
                messages.length === 0 && styles.emptyListContent,
              ]}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptyStateText}>
                  No messages yet. Start the conversation to coordinate with your customer.
                </Text>
              }
            />
          )}
        </View>

        <View style={styles.composerContainer}>
          <TextInput
            style={styles.composerInput}
            placeholder="Type your message…"
            placeholderTextColor={COLORS.textSecondary}
            value={composerText}
            onChangeText={setComposerText}
            editable={canChat && !sending}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!composerText.trim() || sending || !canChat) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!composerText.trim() || sending || !canChat}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={18} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.gray100,
  },
  headerInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  callButton: {
    padding: SPACING.xs,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.gray100,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontFamily: FONT.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.error,
    fontFamily: FONT.medium,
    fontSize: SIZES.medium,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  retryText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
  },
  messageRow: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
  },
  messageRowProvider: {
    justifyContent: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radius.lg,
  },
  providerBubble: {
    backgroundColor: COLORS.primary,
  },
  userBubble: {
    backgroundColor: COLORS.gray100,
  },
  messageText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.white,
  },
  userMessageText: {
    color: COLORS.textPrimary,
  },
  messageTimestamp: {
    marginTop: 4,
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
    opacity: 0.7,
    color: COLORS.white,
    textAlign: 'right',
  },
  userTimestamp: {
    color: COLORS.textSecondary,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: SIZES.radius.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: FONT.regular,
    fontSize: SIZES.medium,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.gray50,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
});

export default Chatroom;
