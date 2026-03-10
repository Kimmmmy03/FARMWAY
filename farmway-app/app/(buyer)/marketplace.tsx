import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    FlatList, Image, ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../utils/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, MIN_TOUCH } from '../../constants/theme';

// ─── Product Card ─────────────────────────────────────────
function ProductCard({ item, onPress }: { item: any; onPress: () => void }) {
    const { t } = useTranslation();
    const price = parseFloat(item.price_per_unit).toFixed(2);
    const primaryImage = item.images?.[0]?.url;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85} accessibilityRole="button">
            <View style={styles.imageContainer}>
                {primaryImage ? (
                    <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
                ) : (
                    <LinearGradient colors={[COLORS.surface, '#dfe9e5']} style={[styles.image, styles.imagePlaceholder]}>
                        <Text style={{ fontSize: 40 }}>🥬</Text>
                    </LinearGradient>
                )}
                {item.stock_quantity <= 0 && (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>{t('marketplace.out_of_stock')}</Text>
                    </View>
                )}
                {item.organic_certified && (
                    <View style={styles.certBadge}>
                        <Text style={styles.certText}>Organic</Text>
                    </View>
                )}
                {item.halal_certified && (
                    <View style={[styles.certBadge, styles.halalBadge, { top: item.organic_certified ? 30 : 8 }]}>
                        <Text style={[styles.certText, { color: COLORS.primary }]}>Halal</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name?.en || item.name}
                </Text>
                <View style={styles.farmerRow}>
                    <Text style={styles.farmerName} numberOfLines={1}>{item.farmer?.full_name}</Text>
                    {item.farmer?.is_verified_seller && (
                        <View style={styles.verifiedPill}><Text style={styles.verifiedText}>✓</Text></View>
                    )}
                </View>
                {item.state && <Text style={styles.location}>📍 {item.district ? `${item.district}, ` : ''}{item.state}</Text>}
                <View style={styles.priceRow}>
                    <Text style={styles.price}>RM {price}</Text>
                    <Text style={styles.unit}>/{item.unit}</Text>
                </View>
                {item.negotiable && <Text style={styles.negotiable}>Negotiable</Text>}
            </View>
        </TouchableOpacity>
    );
}

// ─── Category Pills ───────────────────────────────────────
const CATEGORIES = [
    { slug: '', label: 'All', emoji: '🌾' },
    { slug: 'vegetables', label: 'Sayur', emoji: '🥬' },
    { slug: 'fruits', label: 'Buah', emoji: '🍎' },
    { slug: 'livestock', label: 'Ternakan', emoji: '🐄' },
    { slug: 'aquaculture', label: 'Ikan', emoji: '🐟' },
    { slug: 'grains', label: 'Bijirin', emoji: '🌾' },
    { slug: 'herbs', label: 'Herba', emoji: '🌿' },
];

// ─── Main Screen ─────────────────────────────────────────
export default function MarketplaceScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(search, 600);

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['products', debouncedSearch, category, sort, page],
        queryFn: async () => {
            const params: Record<string, string | number> = { page, limit: 20, sort };
            if (debouncedSearch) params.search = debouncedSearch;
            if (category) params.category = category;
            const res = await api.get('/products', { params });
            return res.data;
        },
        staleTime: 1000 * 60 * 3,
        placeholderData: (prev) => prev,
    });

    const products: any[] = data?.data ?? [];
    const pagination = data?.pagination;

    const renderItem = useCallback(
        ({ item }: { item: any }) => (
            <ProductCard
                item={item}
                onPress={() => router.push({ pathname: '/(buyer)/marketplace' as any, params: { id: item.id } })}
            />
        ),
        [router]
    );

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <Text style={styles.headerTitle}>{t('marketplace.explore')}</Text>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('marketplace.search_placeholder')}
                        placeholderTextColor={COLORS.textMuted}
                        value={search}
                        onChangeText={(v) => { setSearch(v); setPage(1); }}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        accessibilityLabel={t('marketplace.search_placeholder')}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* Categories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesRow}
            >
                {CATEGORIES.map((c) => (
                    <TouchableOpacity
                        key={c.slug}
                        style={[styles.categoryPill, category === c.slug && styles.categoryPillActive]}
                        onPress={() => { setCategory(c.slug); setPage(1); }}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: category === c.slug }}
                    >
                        <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                        <Text style={[styles.categoryLabel, category === c.slug && styles.categoryLabelActive]}>
                            {c.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Row */}
            <View style={styles.sortRow}>
                <Text style={styles.resultsCount}>
                    {pagination?.total ?? '...'} products
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'newest', label: 'Newest' },
                        { key: 'price_asc', label: 'Price ↑' },
                        { key: 'price_desc', label: 'Price ↓' },
                        { key: 'popular', label: 'Popular' },
                    ].map((s) => (
                        <TouchableOpacity
                            key={s.key}
                            style={[styles.sortBtn, sort === s.key && styles.sortBtnActive]}
                            onPress={() => setSort(s.key)}
                        >
                            <Text style={[styles.sortText, sort === s.key && styles.sortTextActive]}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Products Grid */}
            {isLoading && page === 1 ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xxl }} size="large" />
            ) : products.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 64 }}>🔍</Text>
                    <Text style={styles.emptyText}>{t('marketplace.no_results')}</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => {
                        if (pagination && page < pagination.totalPages) setPage((p) => p + 1);
                    }}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        isLoading && page > 1 ? <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.xl }} /> : null
                    }
                />
            )}
        </View>
    );
}

const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
    header: { paddingTop: 56, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    headerTitle: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800', marginBottom: SPACING.md },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        height: MIN_TOUCH,
        ...SHADOWS.card,
    },
    searchIcon: { fontSize: 18, marginRight: SPACING.sm },
    searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
    categoriesRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fff',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryEmoji: { fontSize: 16 },
    categoryLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary },
    categoryLabelActive: { color: '#fff' },
    sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm, gap: SPACING.md },
    resultsCount: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600', flex: 1 },
    sortBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, marginRight: SPACING.xs },
    sortBtnActive: { backgroundColor: COLORS.primary },
    sortText: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.textSecondary },
    sortTextActive: { color: '#fff' },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: 80 },
    row: { justifyContent: 'space-between', marginBottom: SPACING.md },
    card: { width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.card },
    imageContainer: { width: '100%', aspectRatio: 1, position: 'relative' },
    image: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    outOfStockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
    outOfStockText: { color: '#fff', fontSize: FONTS.sizes.xs, fontWeight: '700' },
    certBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.secondary + '22', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
    certText: { fontSize: 10, fontWeight: '700', color: COLORS.secondary },
    halalBadge: { backgroundColor: COLORS.verifiedBg },
    cardBody: { padding: SPACING.sm },
    productName: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
    farmerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    farmerName: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, flex: 1 },
    verifiedPill: { backgroundColor: COLORS.verifiedBg, borderRadius: RADIUS.full, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
    verifiedText: { color: COLORS.verified, fontSize: 9, fontWeight: '800' },
    location: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    price: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.accent },
    unit: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
    negotiable: { fontSize: 10, color: COLORS.secondary, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
    emptyText: { fontSize: FONTS.sizes.lg, color: COLORS.textMuted, marginTop: SPACING.md, textAlign: 'center' },
});
