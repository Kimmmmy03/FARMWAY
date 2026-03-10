import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/theme';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
    return <Text style={{ fontSize: 22, opacity: color === COLORS.primary ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function BuyerLayout() {
    const { t } = useTranslation();
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textMuted,
            tabBarStyle: {
                borderTopWidth: 0,
                elevation: 12,
                shadowOpacity: 0.08,
                paddingBottom: 4,
                backgroundColor: '#fff',
            },
        }}>
            <Tabs.Screen name="marketplace" options={{ title: t('marketplace.title'), tabBarIcon: ({ color }) => <TabIcon emoji="🛒" color={color} /> }} />
            <Tabs.Screen name="orders" options={{ title: t('orders.title'), tabBarIcon: ({ color }) => <TabIcon emoji="📦" color={color} /> }} />
            <Tabs.Screen name="chat" options={{ title: t('messages.title'), tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} /> }} />
            <Tabs.Screen name="profile" options={{ title: t('profile.title'), tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }} />
            <Tabs.Screen name="checkout" options={{ href: null }} />
        </Tabs>
    );
}
