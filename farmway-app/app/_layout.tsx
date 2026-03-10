import '../i18n';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5,  // 5 min — reduce data usage in rural areas
            gcTime: 1000 * 60 * 30,
        },
    },
});

export default function RootLayout() {
    const hydrate = useAuthStore((s) => s.hydrate);

    useEffect(() => {
        hydrate();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(farmer)" />
                <Stack.Screen name="(buyer)" />
                <Stack.Screen name="(admin)" />
            </Stack>
        </QueryClientProvider>
    );
}
