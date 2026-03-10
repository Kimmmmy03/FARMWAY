import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  bool _isHydrated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isHydrated => _isHydrated;
  bool get isLoggedIn => _user != null;

  Future<void> hydrate() async {
    try {
      await ApiService.loadTokens();
      final prefs = await SharedPreferences.getInstance();
      final userRaw = prefs.getString('user');
      if (userRaw != null) {
        _user = User.fromJson(jsonDecode(userRaw));
      }
    } catch (e) {
      debugPrint('Hydration error: $e');
    } finally {
      _isHydrated = true;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService.post('/auth/login', {
        'email': email,
        'password': password,
      });
      final data = res['data'];
      _user = User.fromJson(data['user']);
      await ApiService.setTokens(data['accessToken'], data['refreshToken']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user', jsonEncode(data['user']));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await ApiService.clearTokens();
    _user = null;
    notifyListeners();
  }
}
