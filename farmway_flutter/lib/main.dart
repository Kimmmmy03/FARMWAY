import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/theme.dart';
import 'services/auth_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/buyer/buyer_home_screen.dart';
import 'screens/farmer/farmer_home_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthService()..hydrate(),
      child: const FarmwayApp(),
    ),
  );
}

class FarmwayApp extends StatelessWidget {
  const FarmwayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Farmway',
      theme: AppTheme.theme,
      debugShowCheckedModeBanner: false,
      home: const _AppRouter(),
    );
  }
}

class _AppRouter extends StatelessWidget {
  const _AppRouter();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();

    if (!auth.isHydrated) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (!auth.isLoggedIn) {
      return const LoginScreen();
    }

    switch (auth.user!.role) {
      case 'FARMER':
        return const FarmerHomeScreen();
      case 'BUYER':
        return const BuyerHomeScreen();
      default:
        return const BuyerHomeScreen();
    }
  }
}
