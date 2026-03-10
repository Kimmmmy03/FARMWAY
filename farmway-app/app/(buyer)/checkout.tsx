import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const PAYMENT_METHODS = [
    { key: 'FPX', label: 'FPX (Online Banking)', emoji: '🏦', desc: 'Maybank, CIMB, RHB & more' },
    { key: 'TNG_EWALLET', label: "Touch 'n Go eWallet", emoji: '💚', desc: "Malaysia's most popular e-wallet" },
    { key: 'GRABPAY', label: 'GrabPay', emoji: '🟢', desc: 'Pay with your GrabPay wallet' },
    { key: 'DUITNOW', label: 'DuitNow QR', emoji: '🔶', desc: 'Scan & pay instantly' },
    { key: 'CREDIT_CARD', label: 'Credit / Debit Card', emoji: '💳', desc: 'Visa, Mastercard, UnionPay' },
    { key: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', emoji: '💵', desc: 'Pay when you receive' },
];

function SummaryRow({ label, value, bold = false, color }: { label: string; value: string; bold?: boolean; color?: string }) {
    return (
        <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, bold && { fontWeight: '700' }]}>{label}</Text>
            <Text style={[styles.summaryValue, bold && { fontWeight: '800', fontSize: FONTS.sizes.lg }, color ? { color } : {}]}>
                {value}
            </Text>
        </View>
    );
}

export default function CheckoutScreen() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const router = useRouter();
    const params = useLocalSearchParams<{ orderId: string }>();
    const orderId = params.orderId;

    const [selectedMethod, setSelectedMethod] = useState<string>('FPX');

    const { data: orderData, isLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await api.get(`/orders/${orderId}`);
            return res.data.data;
        },
        enabled: !!orderId,
    });

    const payMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/payments/initiate', {
                order_id: orderId,
                method: selectedMethod,
            });
            return res.data.data;
        },
        onSuccess: (paymentData) => {
            Alert.alert(
                'Payment Initiated',
                `Order ${orderData?.invoice_number}\n\nPayment ID: ${paymentData.payment_id}\nMethod: ${selectedMethod}\nAmount: RM ${paymentData.amount}`,
                [{ text: 'View Order', onPress: () => router.replace('/(buyer)/orders') }]
            );
        },
        onError: (err: any) => {
            Alert.alert('Payment Failed', err?.response?.data?.message || 'Please try again.');
        },
    });

    const order = orderData;

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
                <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.lg }}>Order not found.</Text>
            </View>
        );
    }

    const commissionRate = parseFloat(order.commission?.commission_rate ?? '8');

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>← {t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <Text style={styles.headerSubtitle}>{order.invoice_number}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Order Items */}
                <View style={[styles.card, SHADOWS.card]}>
                    <Text style={styles.cardTitle}>📦 Order Summary</Text>
                    {order.items?.map((item: any) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemName} numberOfLines={1}>
                                {item.product_name?.en || item.product_name}
                            </Text>
                            <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
                            <Text style={styles.itemPrice}>RM {parseFloat(item.line_total).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <SummaryRow label="Subtotal" value={`RM ${parseFloat(order.subtotal_amount).toFixed(2)}`} />
                    <SummaryRow label="Delivery Fee" value={`RM ${parseFloat(order.delivery_fee).toFixed(2)}`} />
                    {parseFloat(order.discount_amount) > 0 && (
                        <SummaryRow label="Discount" value={`-RM ${parseFloat(order.discount_amount).toFixed(2)}`} color={COLORS.success} />
                    )}
                    <SummaryRow label="Platform Commission"
                        value={`${commissionRate}% (RM ${parseFloat(order.commission_amount).toFixed(2)})`}
                        color={COLORS.textMuted}
                    />
                    <View style={styles.divider} />
                    <SummaryRow label="Total to Pay" value={`RM ${parseFloat(order.total_amount).toFixed(2)}`} bold color={COLORS.accent} />
                </View>

                {/* Delivery Address */}
                <View style={[styles.card, SHADOWS.card]}>
                    <Text style={styles.cardTitle}>📍 Delivery Address</Text>
                    <Text style={styles.addressText}>
                        {typeof order.delivery_address === 'object'
                            ? `${order.delivery_address.address_line1 || ''}, ${order.delivery_address.postcode || ''} ${order.delivery_address.district || ''}, ${order.delivery_address.state || ''}`
                            : order.delivery_address
                        }
                    </Text>
                    {order.delivery_notes && (
                        <Text style={styles.addressNotes}>Note: {order.delivery_notes}</Text>
                    )}
                </View>

                {/* Payment Method */}
                <View style={[styles.card, SHADOWS.card]}>
                    <Text style={styles.cardTitle}>💳 Choose Payment Method</Text>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.key}
                            style={[styles.methodRow, selectedMethod === method.key && styles.methodRowActive]}
                            onPress={() => setSelectedMethod(method.key)}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selectedMethod === method.key }}
                        >
                            <Text style={styles.methodEmoji}>{method.emoji}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.methodLabel, selectedMethod === method.key && { color: COLORS.primary }]}>
                                    {method.label}
                                </Text>
                                <Text style={styles.methodDesc}>{method.desc}</Text>
                            </View>
                            <View style={[styles.radio, selectedMethod === method.key && styles.radioActive]}>
                                {selectedMethod === method.key && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.terms}>
                    By proceeding, you agree to Farmway's Terms of Service. The platform commission ({commissionRate}%) will be deducted from the seller's payout automatically.
                </Text>

                {/* Pay Button */}
                <TouchableOpacity
                    style={styles.payBtnWrapper}
                    onPress={() => payMutation.mutate()}
                    disabled={payMutation.isPending}
                    accessibilityRole="button"
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={[COLORS.accent, COLORS.accentLight]}
                        style={styles.payBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {payMutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.payBtnText}>
                                    Pay RM {parseFloat(order.total_amount).toFixed(2)}
                                </Text>
                                <Text style={styles.payBtnSub}>via {PAYMENT_METHODS.find((m) => m.key === selectedMethod)?.label}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
    backBtn: { marginBottom: SPACING.sm },
    backText: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.sm, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: FONTS.sizes.xxl, fontWeight: '800' },
    headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm, marginTop: 2 },
    content: { padding: SPACING.lg },
    card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
    cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    itemName: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, fontWeight: '600' },
    itemQty: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginHorizontal: SPACING.sm },
    itemPrice: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
    summaryLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
    summaryValue: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
    addressText: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, lineHeight: 22 },
    addressNotes: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: SPACING.xs, fontStyle: 'italic' },
    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        gap: SPACING.md,
    },
    methodRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.verifiedBg },
    methodEmoji: { fontSize: 28 },
    methodLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
    methodDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: COLORS.primary },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
    terms: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginVertical: SPACING.md, lineHeight: 18 },
    payBtnWrapper: { borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm },
    payBtn: { padding: SPACING.lg, alignItems: 'center' },
    payBtnText: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800' },
    payBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.xs, marginTop: 2 },
});
