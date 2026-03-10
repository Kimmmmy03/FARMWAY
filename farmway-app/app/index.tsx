import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Index() {
    const { user, isHydrated } = useAuthStore();

    if (!isHydrated) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!user) return <Redirect href="/(auth)/login" />;
    if (user.role === 'FARMER') return <Redirect href="/(farmer)/dashboard" />;
    if (user.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;
    return <Redirect href="/(buyer)/marketplace" />;
}
