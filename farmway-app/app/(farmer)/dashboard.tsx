import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const useDashboardStats = () =>
    useQuery({
        queryKey: ['farmer-dashboard'],
        queryFn: async () => {
            const [ordersRes, productsRes] = await Promise.all([
                api.get('/orders?limit=5'),
                api.get('/products'),
            ]);
            return { orders: ordersRes.data, products: productsRes.data };
        },
        staleTime: 1000 * 60 * 2,
    });

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string | number; color?: string }) {
    return (
        <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: (color || COLORS.primary) + '15' }]}>
                <Text style={styles.statEmoji}>{emoji}</Text>
            </View>
            <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: COLORS.warning,
    CONFIRMED: COLORS.info,
    PROCESSING: COLORS.primary,
    SHIPPED: COLORS.primaryLight,
    DELIVERED: COLORS.success,
    CANCELLED: COLORS.error,
};

function OrderRow({ order, onPress }: { order: any; onPress: () => void }) {
    const { t } = useTranslation();
    const statusColor = STATUS_COLORS[order.status] || COLORS.textMuted;
    return (
        <TouchableOpacity style={[styles.orderRow, SHADOWS.card]} onPress={onPress} accessibilityRole="button">
            <View style={{ flex: 1 }}>
                <Text style={styles.orderInvoice}>{order.invoice_number}</Text>
                <Text style={styles.orderMeta}>{order.items?.length ?? '?'} {t('orders.items')} · RM {parseFloat(order.total_amount).toFixed(2)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{t(`orders.${order.status.toLowerCase()}`)}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function FarmerDashboard() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const router = useRouter();
    const { data, isLoading, refetch, isRefetching } = useDashboardStats();

    const orders: any[] = data?.orders?.data ?? [];
    const products: any[] = data?.products?.data ?? [];

    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const activeListings = products.filter((p) => p.status === 'ACTIVE').length;
    const lowStock = products.filter((p) => parseFloat(p.stock_quantity) <= 5 && p.status === 'ACTIVE').length;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.background }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        >
            {/* Header */}
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]} style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>
                            {new Date().getHours() < 12 ? '🌅' : '☀️'} {t('auth.welcome_back')}
                        </Text>
                        <Text style={styles.userName}>{user?.full_name}</Text>
                        {user?.is_verified_seller && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedBadgeText}>✓ {t('marketplace.verified_seller')}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(farmer)/profile')}>
                        <Image source={require('../../logo/logo.png')} style={{ width: 36, height: 36 }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsRow}>
                {isLoading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                ) : (
                    <>
                        <StatCard emoji="📦" label={t('dashboard.pending_orders')} value={pendingOrders} color={pendingOrders > 0 ? COLORS.warning : COLORS.success} />
                        <StatCard emoji="🌿" label={t('dashboard.active_listings')} value={activeListings} color={COLORS.secondary} />
                        <StatCard emoji="⚠️" label={t('dashboard.low_stock_alert')} value={lowStock} color={lowStock > 0 ? COLORS.error : COLORS.success} />
                    </>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsRow}>
                    <QuickAction emoji="➕" label={t('dashboard.add_product')} color={COLORS.accent} onPress={() => router.push('/(farmer)/products')} />
                    <QuickAction emoji="📋" label={t('orders.title')} color={COLORS.primary} onPress={() => router.push('/(farmer)/orders')} />
                    <QuickAction emoji="💬" label={t('messages.title')} color={COLORS.info} onPress={() => router.push('/(farmer)/messages')} />
                    <QuickAction emoji="📊" label={t('dashboard.earnings')} color={COLORS.secondary} onPress={() => {}} />
                </View>
            </View>

            {/* Recent Orders */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('dashboard.recent_orders')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(farmer)/orders')}>
                        <Text style={styles.viewAll}>{t('dashboard.view_all')}</Text>
                    </TouchableOpacity>
                </View>
                {orders.length === 0 && !isLoading && (
                    <Text style={styles.emptyText}>{t('orders.no_orders')}</Text>
                )}
                {orders.slice(0, 5).map((order) => (
                    <OrderRow
                        key={order.id}
                        order={order}
                        onPress={() => router.push({ pathname: '/(farmer)/orders', params: { id: order.id } })}
                    />
                ))}
            </View>

            {/* My Products */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('dashboard.my_products')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(farmer)/products')}>
                        <Text style={styles.viewAll}>{t('dashboard.view_all')}</Text>
                    </TouchableOpacity>
                </View>
                {products.slice(0, 3).map((product) => (
                    <ProductMiniRow key={product.id} product={product} />
                ))}
            </View>

            <View style={{ height: 80 }} />
        </ScrollView>
    );
}

function QuickAction({ emoji, label, color, onPress }: { emoji: string; label: string; color: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.quickAction} onPress={onPress} accessibilityRole="button">
            <View style={[styles.quickIconBg, { backgroundColor: color + '15' }]}>
                <Text style={styles.quickEmoji}>{emoji}</Text>
            </View>
            <Text style={styles.quickLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function ProductMiniRow({ product }: { product: any }) {
    const isLow = parseFloat(product.stock_quantity) <= 5;
    return (
        <View style={[styles.productRow, SHADOWS.card]}>
            <View style={styles.productIcon}>
                <Text style={{ fontSize: 20 }}>🌿</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product.name?.en || JSON.stringify(product.name)}</Text>
                <Text style={styles.productMeta}>
                    RM {parseFloat(product.price_per_unit).toFixed(2)} / {product.unit}
                    {'  ·  '}Stock: {product.stock_quantity}
                </Text>
            </View>
            {isLow && (
                <View style={styles.lowStockPill}>
                    <Text style={styles.lowStockText}>Low</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: SPACING.xxl + 8, paddingHorizontal: SPACING.xl },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    greeting: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.sm },
    userName: { color: '#fff', fontSize: FONTS.sizes.xxl, fontWeight: '800', marginTop: 2 },
    avatarBtn: {
        width: 52,
        height: 52,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        marginTop: SPACING.xs,
        alignSelf: 'flex-start',
    },
    verifiedBadgeText: { color: '#fff', fontSize: FONTS.sizes.xs, fontWeight: '600' },
    statsRow: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.sm, marginTop: -SPACING.xl },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
    statIconBg: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    statEmoji: { fontSize: 20 },
    statValue: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
    statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
    section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
    viewAll: { fontSize: FONTS.sizes.sm, color: COLORS.accent, fontWeight: '600' },
    actionsRow: { flexDirection: 'row', gap: SPACING.sm },
    quickAction: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', ...SHADOWS.card },
    quickIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    quickEmoji: { fontSize: 22 },
    quickLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600' },
    orderRow: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center' },
    orderInvoice: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
    orderMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
    emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.lg },
    productRow: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    productIcon: { width: 40, height: 40, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    productName: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
    productMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
    lowStockPill: { backgroundColor: COLORS.error + '18', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
    lowStockText: { color: COLORS.error, fontSize: FONTS.sizes.xs, fontWeight: '700' },
});
