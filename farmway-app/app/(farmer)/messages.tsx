import React from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../utils/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function FarmerMessagesScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['farmer-conversations'],
        queryFn: async () => {
            const res = await api.get('/messages');
            return res.data;
        },
        staleTime: 1000 * 60,
    });

    const conversations: any[] = data?.data ?? [];

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <Text style={styles.headerTitle}>{t('messages.title')}</Text>
            </LinearGradient>

            {isLoading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: SPACING.xxl }} />
            ) : conversations.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 56 }}>💬</Text>
                    <Text style={styles.emptyText}>{t('messages.no_messages')}</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.card, SHADOWS.card]} activeOpacity={0.85}>
                            <View style={styles.avatar}>
                                <Text style={{ fontSize: 22 }}>👤</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.partner_name || 'Buyer'}</Text>
                                <Text style={styles.preview} numberOfLines={1}>{item.last_message || '...'}</Text>
                            </View>
                            {item.unread_count > 0 && (
                                <View style={styles.unreadBadge}>
                                    <Text style={styles.unreadText}>{item.unread_count}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
    headerTitle: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800' },
    list: { padding: SPACING.lg, paddingBottom: 80 },
    card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
    preview: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
    unreadBadge: { backgroundColor: COLORS.accent, borderRadius: RADIUS.full, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    unreadText: { color: '#fff', fontSize: FONTS.sizes.xs, fontWeight: '800' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
    emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.textMuted, marginTop: SPACING.md },
});
