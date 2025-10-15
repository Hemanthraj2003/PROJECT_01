class AppConstants {
  // API URLs
  static const String prodApi = 'https://friendscars.vercel.app/api';
  static const String devApi = 'http://192.168.0.106:5000';

  // Use this to switch between dev and prod
  static const String baseUrl = prodApi;

  // API Endpoints
  static const String carsEndpoint = '/cars';
  static const String usersEndpoint = '/users';
  static const String chatsEndpoint = '/chats';
  static const String postCarEndpoint = '/cars/post';
  static const String getMyCarsEndpoint = '/cars/getMyCars';
  static const String uploadImagesEndpoint = '/upload-images';

  // Storage Keys
  static const String userKey = 'user_data';
  static const String authTokenKey = 'auth_token';
  static const String userIdKey = 'user_id';
  static const String likedCarsKey = 'liked_cars';

  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 100;

  // Error Messages
  static const String offlineError =
      'No internet connection. Please check your network.';
  static const String serverError =
      'Server error occurred. Please try again later.';
  static const String unknownError = 'An unexpected error occurred';
}
