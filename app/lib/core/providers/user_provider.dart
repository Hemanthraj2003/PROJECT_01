import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user_model.dart';
import '../constants/app_constants.dart';
import '../services/user_service.dart';

class UserProvider with ChangeNotifier {
  final UserService _userService = UserService();
  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  // Initialize and validate session
  Future<bool> validateSession() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString(AppConstants.userIdKey);
      final userData = prefs.getString(AppConstants.userKey);

      if (userId != null && userData != null) {
        _user = User.fromJson(jsonDecode(userData));
        _isAuthenticated = true;

        // Optionally fetch fresh user data from server
        try {
          final freshUser = await _userService.fetchUserById(userId);
          _user = freshUser;
          await _saveUserToPrefs(freshUser);
        } catch (e) {
          // Continue with cached data if fetch fails
          debugPrint('Failed to fetch fresh user data: $e');
        }

        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Session validation error: $e');
    }

    _isLoading = false;
    _isAuthenticated = false;
    notifyListeners();
    return false;
  }

  // Set user and save to preferences
  Future<void> setUser(User user) async {
    _user = user;
    _isAuthenticated = true;
    await _saveUserToPrefs(user);
    notifyListeners();
  }

  // Update user
  Future<void> updateUser(Map<String, dynamic> updates) async {
    if (_user == null) return;

    try {
      _isLoading = true;
      notifyListeners();

      // Merge current user data with updates and include 'id' field for backend
      final updatedData = {
        ..._user!.toJson(),
        ...updates,
        'id': _user!.uid, // Backend expects 'id' field
      };

      final updatedUser = await _userService.updateUserData(updatedData);
      await setUser(updatedUser);
    } catch (e) {
      debugPrint('Update user error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Remove user and clear session
  Future<void> removeUser() async {
    _user = null;
    _isAuthenticated = false;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userKey);
    await prefs.remove(AppConstants.userIdKey);
    await prefs.remove(AppConstants.authTokenKey);

    notifyListeners();
  }

  // Save user to SharedPreferences
  Future<void> _saveUserToPrefs(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
    await prefs.setString(AppConstants.userIdKey, user.uid);
  }

  // Toggle liked car
  Future<void> toggleLikedCar(String carId) async {
    if (_user == null) return;

    final likedCars = List<String>.from(_user!.likedCars);

    if (likedCars.contains(carId)) {
      likedCars.remove(carId);
    } else {
      likedCars.add(carId);
    }

    await updateUser({'likedCars': likedCars});
  }

  @override
  void dispose() {
    _userService.dispose();
    super.dispose();
  }
}
