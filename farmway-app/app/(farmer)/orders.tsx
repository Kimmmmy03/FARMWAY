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

const STATUS_COLORS: Record<string, string> = {
    PENDING: COLORS.warning,
    CONFIRMED: COLORS.info,
    PROCESSING: COLORS.primary,
    SHIPPED: COLORS.primaryLight,
    DELIVERED: COLORS.success,
    CANCELLED: COLORS.error,
};

function OrderCard({ order }: { order: any }) {
    const { t } = useTranslation();
    const statusColor = STATUS_COLORS[order.status] || COLORS.textMuted;
    const date = new Date(order.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <View style={[styles.card, SHADOWS.card]}>
            <View style={styles.cardTop}>
                <Text style={styles.invoice}>{order.invoice_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {t(`orders.${order.status.toLowerCase()}`)}
                    </Text>
                </View>
            </View>
            <Text style={styles.date}>{date}</Text>
            <View style={styles.cardBottom}>
                <Text style={styles.items}>{order.items?.length ?? '?'} {t('orders.items')}</Text>
                <Text style={styles.total}>RM {parseFloat(order.total_amount).toFixed(2)}</Text>
            </View>
        </View>
    );
}

export default function FarmerOrdersScreen() {
    const { t } = useTranslation();

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['farmer-orders'],
        queryFn: async () => {
            const res = await api.get('/orders');
            return res.data;
        },
        staleTime: 1000 * 60 * 2,
    });

    const orders: any[] = data?.data ?? [];

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <Text style={styles.headerTitle}>{t('orders.title')}</Text>
                <Text style={styles.headerSub}>{orders.length} orders</Text>
            </LinearGradient>

            {isLoading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: SPACING.xxl }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <OrderCard order={item} />}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 56 }}>📋</Text>
                            <Text style={styles.emptyText}>{t('orders.no_orders')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
    headerTitle: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm, marginTop: 2 },
    list: { padding: SPACING.lg, paddingBottom: 80 },
    card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    invoice: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
    statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
    date: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 4 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
    items: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    total: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.primary },
    empty: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl, marginTop: SPACING.xxl },
    emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, marginTop: SPACING.md },
});
