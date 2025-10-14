import '../models/user_model.dart';
import '../constants/app_constants.dart';
import 'api_service.dart';

class UserService {
  final ApiService _apiService = ApiService();

  // Fetch user by ID
  Future<User> fetchUserById(String userId) async {
    try {
      final response = await _apiService.get(
        '${AppConstants.usersEndpoint}/$userId',
      );

      if (response['success'] == true) {
        return User.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch user');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Register new user
  Future<User> registerNewUser(Map<String, dynamic> userInfo) async {
    try {
      final response = await _apiService.post(
        '${AppConstants.usersEndpoint}/register',
        body: userInfo,
      );

      if (response['success'] == true) {
        return User.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to register user');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Update user data
  Future<User> updateUserData(Map<String, dynamic> userInfo) async {
    try {
      final response = await _apiService.put(
        '${AppConstants.usersEndpoint}/${userInfo['uid']}',
        body: userInfo,
      );

      if (response['success'] == true) {
        return User.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to update user');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Check for registered user
  Future<Map<String, dynamic>> checkForRegisteredUser(String phone) async {
    try {
      print('Checking user exists for phone: $phone');
      print(
        'API endpoint: ${AppConstants.usersEndpoint}/isExists?phone=$phone',
      );

      final response = await _apiService.get(
        '${AppConstants.usersEndpoint}/isExists',
        queryParams: {'phone': phone},
      );

      print('API Response: $response');

      if (response['success'] == true) {
        final isExists = response['isExists'] ?? false;
        print('User exists: $isExists');

        return {
          'isExists': isExists,
          'user': isExists && response['data'] != null
              ? User.fromJson(response['data'])
              : null,
        };
      }
      return {'isExists': false, 'user': null};
    } catch (e) {
      print('Error checking user: $e');
      return {'isExists': false, 'user': null};
    }
  }

  void dispose() {
    _apiService.dispose();
  }
}
