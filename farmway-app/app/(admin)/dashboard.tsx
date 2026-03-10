import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function AdminDashboard() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <Text style={styles.headerSub}>{user?.full_name}</Text>
            </LinearGradient>
            <View style={styles.content}>
                <Text style={styles.placeholder}>Admin panel coming soon.</Text>
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={() => { logout(); router.replace('/'); }}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingTop: 60, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.xl },
    headerTitle: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm, marginTop: 4 },
    content: { flex: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
    placeholder: { fontSize: FONTS.sizes.lg, color: COLORS.textMuted, marginBottom: SPACING.xl },
    logoutBtn: { backgroundColor: COLORS.error + '12', borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl, borderWidth: 1.5, borderColor: COLORS.error + '30' },
    logoutText: { color: COLORS.error, fontSize: FONTS.sizes.md, fontWeight: '700' },
});
