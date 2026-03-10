import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, MIN_TOUCH } from '../../constants/theme';

type Message = {
    id: string;
    sender_id: string;
    content: string;
    message_type: string;
    image_url?: string;
    created_at: string;
    is_read: boolean;
};

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
    const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
            {!isMine && (
                <View style={styles.avatar}><Text style={{ fontSize: 18 }}>🌾</Text></View>
            )}
            <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubblePeer]}>
                <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                    {message.content}
                </Text>
                <Text style={[styles.bubbleTime, isMine && { color: 'rgba(255,255,255,0.7)' }]}>{time}</Text>
            </View>
        </View>
    );
}

export default function ChatScreen() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useLocalSearchParams<{ partnerId: string; partnerName: string; orderId?: string }>();
    const { partnerId, partnerName, orderId } = params;
    const listRef = useRef<FlatList>(null);
    const queryClient = useQueryClient();

    const [input, setInput] = useState('');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['chat', partnerId, orderId],
        queryFn: async () => {
            const queryParams: Record<string, string> = {};
            if (orderId) queryParams.order_id = orderId;
            const res = await api.get(`/messages/${partnerId}`, { params: queryParams });
            return res.data.data as Message[];
        },
        refetchInterval: 5000,
        staleTime: 0,
    });

    const messages = data ?? [];

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages.length]);

    const sendMutation = useMutation({
        mutationFn: async (content: string) => {
            const body: Record<string, string> = {
                recipient_id: partnerId,
                content,
                message_type: 'TEXT',
            };
            if (orderId) body.order_id = orderId;
            const res = await api.post('/messages', body);
            return res.data.data;
        },
        onMutate: async (content) => {
            const optimistic: Message = {
                id: `opt-${Date.now()}`,
                sender_id: user!.id,
                content,
                message_type: 'TEXT',
                created_at: new Date().toISOString(),
                is_read: false,
            };
            queryClient.setQueryData(['chat', partnerId, orderId], (old: Message[] = []) => [...old, optimistic]);
            return { optimistic };
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(['chat', partnerId, orderId], (old: Message[] = []) =>
                old.filter((m) => m.id !== context?.optimistic.id)
            );
        },
        onSettled: () => refetch(),
    });

    const handleSend = () => {
        const content = input.trim();
        if (!content) return;
        setInput('');
        sendMutation.mutate(content);
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.partnerName}>{partnerName || t('messages.title')}</Text>
                    {orderId && <Text style={styles.orderRef}>Re: Order #{orderId?.slice(0, 8)}</Text>}
                </View>
                <View style={styles.onlineIndicator} />
            </LinearGradient>

            {/* Messages */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
                {isLoading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xxl }} />
                ) : messages.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={{ fontSize: 48 }}>💬</Text>
                        <Text style={styles.emptyText}>{t('messages.no_messages')}</Text>
                        <Text style={styles.emptyHint}>Start a conversation about the product or order.</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={listRef}
                        data={messages}
                        keyExtractor={(m) => m.id}
                        renderItem={({ item }) => (
                            <MessageBubble message={item} isMine={item.sender_id === user?.id} />
                        )}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        placeholder={t('messages.type_message')}
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        maxLength={1000}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                        accessibilityLabel={t('messages.type_message')}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                        disabled={!input.trim() || sendMutation.isPending}
                        accessibilityRole="button"
                        accessibilityLabel={t('messages.send')}
                    >
                        {sendMutation.isPending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.sendIcon}>➤</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    backText: { color: '#fff', fontSize: 24 },
    partnerName: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: '700' },
    orderRef: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.xs, marginTop: 2 },
    onlineIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary, borderWidth: 2, borderColor: '#fff' },
    messageList: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md, gap: SPACING.sm },
    bubbleRowMine: { flexDirection: 'row-reverse' },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    bubble: {
        maxWidth: '75%',
        backgroundColor: '#fff',
        borderRadius: RADIUS.lg,
        borderBottomLeftRadius: RADIUS.sm,
        padding: SPACING.md,
        ...SHADOWS.card,
    },
    bubbleMine: {
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: RADIUS.lg,
        borderBottomRightRadius: RADIUS.sm,
    },
    bubblePeer: {},
    bubbleText: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 22 },
    bubbleTextMine: { color: '#fff' },
    bubbleTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, textAlign: 'right' },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.md,
        gap: SPACING.sm,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    textInput: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONTS.sizes.md,
        color: COLORS.textPrimary,
        maxHeight: 100,
        minHeight: MIN_TOUCH,
    },
    sendBtn: {
        width: MIN_TOUCH,
        height: MIN_TOUCH,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendBtnDisabled: { backgroundColor: COLORS.border },
    sendIcon: { color: '#fff', fontSize: 18 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
    emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.textMuted, marginTop: SPACING.md },
    emptyHint: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
});
