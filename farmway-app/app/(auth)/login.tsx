import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading } = useAuthStore();

    const handleRoleSelect = async (role: 'farmer' | 'buyer') => {
        try {
            if (role === 'farmer') {
                await login('farmer@farmway.my', 'farmer123');
            } else {
                await login('buyer@farmway.my', 'buyer123');
            }
            router.replace('/');
        } catch (err: any) {
            Alert.alert('Login Failed', err?.response?.data?.message || 'Error occurred during login');
        }
    };

    return (
        <LinearGradient colors={['#1B5E5B', '#2B7A78', '#3AAFA9']} style={styles.gradient}>
            <View style={styles.container}>
                {/* Logo & Brand */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../logo/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.appName}>Farmway</Text>
                    <Text style={styles.tagline}>Farm-to-table marketplace</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>Select Role to Continue</Text>
                    <Text style={styles.subtitle}>Choose how you'd like to explore</Text>

                    <TouchableOpacity
                        style={styles.roleBtn}
                        onPress={() => handleRoleSelect('farmer')}
                        disabled={isLoading}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                    >
                        <LinearGradient
                            colors={[COLORS.primaryDark, COLORS.primary]}
                            style={styles.roleBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.roleIconCircle}>
                                <Text style={styles.roleIcon}>🌾</Text>
                            </View>
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleText}>Login as Farmer</Text>
                                <Text style={styles.roleDesc}>Manage your farm & sell produce</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.roleBtn}
                        onPress={() => handleRoleSelect('buyer')}
                        disabled={isLoading}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                    >
                        <LinearGradient
                            colors={[COLORS.accent, COLORS.accentLight]}
                            style={styles.roleBtnGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.roleIconCircle}>
                                <Text style={styles.roleIcon}>🛒</Text>
                            </View>
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleText}>Login as Buyer</Text>
                                <Text style={styles.roleDesc}>Browse & buy fresh produce</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {isLoading && <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: SPACING.md }} />}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New here? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={styles.linkText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, justifyContent: 'center', padding: SPACING.xl },
    header: { alignItems: 'center', marginBottom: SPACING.xxl },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.modal,
    },
    logoImage: { width: 72, height: 72 },
    appName: { fontSize: FONTS.sizes.hero, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
    tagline: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    card: {
        backgroundColor: '#fff',
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        ...SHADOWS.modal,
    },
    title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
    subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, marginBottom: SPACING.xl },
    roleBtn: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        ...SHADOWS.card,
    },
    roleBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    roleIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    roleIcon: { fontSize: 24 },
    roleInfo: { flex: 1 },
    roleText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: '700' },
    roleDesc: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.xs, marginTop: 2 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
    footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    linkText: { color: COLORS.accent, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
