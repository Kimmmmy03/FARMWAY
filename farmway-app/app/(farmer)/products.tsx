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

function ProductCard({ product }: { product: any }) {
    const { t } = useTranslation();
    const isLow = parseFloat(product.stock_quantity) <= 5;
    return (
        <View style={[styles.card, SHADOWS.card]}>
            <View style={styles.cardLeft}>
                <Text style={{ fontSize: 36 }}>🌿</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product.name?.en || JSON.stringify(product.name)}</Text>
                <Text style={styles.productMeta}>
                    RM {parseFloat(product.price_per_unit).toFixed(2)} / {product.unit}
                </Text>
                <Text style={styles.stock}>Stock: {product.stock_quantity} {product.unit}</Text>
            </View>
            {isLow && (
                <View style={styles.lowBadge}>
                    <Text style={styles.lowText}>Low</Text>
                </View>
            )}
        </View>
    );
}

export default function FarmerProductsScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['farmer-products'],
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data;
        },
        staleTime: 1000 * 60 * 2,
    });

    const products: any[] = data?.data ?? [];

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <Text style={styles.headerTitle}>{t('dashboard.my_products')}</Text>
                <Text style={styles.headerSub}>{products.length} products</Text>
            </LinearGradient>

            {isLoading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: SPACING.xxl }} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 56 }}>🌱</Text>
                            <Text style={styles.emptyText}>No products yet. Add your first listing!</Text>
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
    card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    cardLeft: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
    productName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
    productMeta: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
    stock: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
    lowBadge: { backgroundColor: COLORS.error + '18', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4 },
    lowText: { color: COLORS.error, fontSize: FONTS.sizes.xs, fontWeight: '700' },
    empty: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl, marginTop: SPACING.xxl },
    emptyText: { fontSize: FONTS.sizes.md, color: COLORS.textMuted, marginTop: SPACING.md, textAlign: 'center' },
});
