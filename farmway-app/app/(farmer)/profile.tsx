import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.menuEmoji}>{emoji}</Text>
            <Text style={styles.menuLabel}>{label}</Text>
            <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
    );
}

export default function FarmerProfileScreen() {
    const { t } = useTranslation();
    const { user, logout, setLanguage } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(t('auth.logout'), 'Are you sure you want to logout?', [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('auth.logout'), style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
        ]);
    };

    const handleLanguage = () => {
        Alert.alert(t('profile.language'), 'Select language', [
            { text: 'English', onPress: () => setLanguage('en') },
            { text: 'Bahasa Melayu', onPress: () => setLanguage('ms') },
            { text: '中文', onPress: () => setLanguage('zh') },
            { text: 'தமிழ்', onPress: () => setLanguage('ta') },
        ]);
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Text style={{ fontSize: 36 }}>🌾</Text>
                </View>
                <Text style={styles.name}>{user?.full_name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {user?.is_verified_seller && (
                    <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified Seller</Text>
                    </View>
                )}
            </LinearGradient>

            <View style={styles.section}>
                <View style={[styles.card, SHADOWS.card]}>
                    <MenuItem emoji="🏪" label={t('profile.farm_name')} onPress={() => {}} />
                    <View style={styles.divider} />
                    <MenuItem emoji="🏦" label={t('profile.bank_details')} onPress={() => {}} />
                    <View style={styles.divider} />
                    <MenuItem emoji="🌐" label={t('profile.language')} onPress={handleLanguage} />
                    <View style={styles.divider} />
                    <MenuItem emoji="❓" label={t('profile.help')} onPress={() => {}} />
                    <View style={styles.divider} />
                    <MenuItem emoji="ℹ️" label={t('profile.about')} onPress={() => {}} />
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                    <Text style={styles.logoutText}>{t('auth.logout')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 80 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: SPACING.xxl, alignItems: 'center' },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    name: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800' },
    email: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm, marginTop: 4 },
    verifiedBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        marginTop: SPACING.sm,
    },
    verifiedText: { color: '#fff', fontSize: FONTS.sizes.xs, fontWeight: '700' },
    section: { padding: SPACING.lg },
    card: { backgroundColor: '#fff', borderRadius: RADIUS.lg, overflow: 'hidden' },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    menuEmoji: { fontSize: 22, marginRight: SPACING.md },
    menuLabel: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
    menuArrow: { fontSize: 22, color: COLORS.textMuted },
    divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg },
    logoutBtn: {
        backgroundColor: COLORS.error + '12',
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        marginTop: SPACING.lg,
        borderWidth: 1.5,
        borderColor: COLORS.error + '30',
    },
    logoutText: { color: COLORS.error, fontSize: FONTS.sizes.md, fontWeight: '700' },
});
