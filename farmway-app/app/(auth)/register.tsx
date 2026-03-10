import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, MIN_TOUCH, SHADOWS } from '../../constants/theme';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { register, isLoading } = useAuthStore();

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'BUYER' as 'FARMER' | 'BUYER',
    });

    const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

    const handleRegister = async () => {
        if (!form.full_name || !form.email || !form.password) {
            Alert.alert('', 'Please fill in all required fields.');
            return;
        }
        if (form.password.length < 8) {
            Alert.alert('', 'Password must be at least 8 characters.');
            return;
        }
        try {
            await register(form);
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Registration Failed', err?.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Text style={styles.backText}>← {t('common.back')}</Text>
                    </TouchableOpacity>

                    <View style={styles.logoRow}>
                        <Image source={require('../../logo/logo.png')} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.title}>{t('auth.create_account')}</Text>
                        <Text style={styles.subtitle}>Join Farmway today</Text>

                        {/* Role Picker */}
                        <Text style={styles.label}>{t('auth.iam')}</Text>
                        <View style={styles.roleRow}>
                            {(['BUYER', 'FARMER'] as const).map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                                    onPress={() => set('role', r)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: form.role === r }}
                                >
                                    <Text style={styles.roleEmoji}>{r === 'FARMER' ? '🌾' : '🛒'}</Text>
                                    <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>
                                        {t(`auth.${r.toLowerCase()}`)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Full Name */}
                        <Text style={styles.label}>{t('auth.full_name')} *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ahmad bin Ali"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.full_name}
                            onChangeText={(v) => set('full_name', v)}
                            autoCapitalize="words"
                        />

                        {/* Email */}
                        <Text style={styles.label}>{t('auth.email')} *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.email}
                            onChangeText={(v) => set('email', v)}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        {/* Phone */}
                        <Text style={styles.label}>{t('auth.phone')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="011-12345678"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.phone}
                            onChangeText={(v) => set('phone', v)}
                            keyboardType="phone-pad"
                        />

                        {/* Password */}
                        <Text style={styles.label}>{t('auth.password')} *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Min. 8 characters"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.password}
                            onChangeText={(v) => set('password', v)}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={handleRegister}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[COLORS.accent, COLORS.accentLight]}
                                style={styles.primaryBtnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryBtnText}>{t('auth.create_account')}</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('auth.have_account')} </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.linkText}>{t('auth.login')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: SPACING.xl, paddingTop: 60 },
    backBtn: { marginBottom: SPACING.md },
    backText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: '600' },
    logoRow: { alignItems: 'center', marginBottom: SPACING.lg },
    logo: { width: 64, height: 64 },
    card: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.xl, ...SHADOWS.modal },
    title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.xl },
    label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
    input: {
        height: MIN_TOUCH,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        fontSize: FONTS.sizes.md,
        color: COLORS.textPrimary,
        backgroundColor: COLORS.surface,
        marginBottom: SPACING.lg,
    },
    roleRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
    roleBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
    },
    roleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.verifiedBg },
    roleEmoji: { fontSize: 32, marginBottom: SPACING.xs },
    roleBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
    roleBtnTextActive: { color: COLORS.primary },
    primaryBtn: {
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    primaryBtnGradient: {
        height: MIN_TOUCH + 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    linkText: { color: COLORS.accent, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
