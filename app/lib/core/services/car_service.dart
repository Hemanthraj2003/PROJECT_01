import '../models/car_model.dart';
import '../constants/app_constants.dart';
import 'api_service.dart';
import 'cache_service.dart';

class CarService {
  final ApiService _apiService = ApiService();
  final CacheService _cache = CacheService();

  // Fetch all cars with pagination
  Future<Map<String, dynamic>> fetchAllCars({
    int page = 1,
    int limit = AppConstants.defaultPageSize,
  }) async {
    try {
      final response = await _apiService.get(
        AppConstants.carsEndpoint,
        queryParams: {'page': page.toString(), 'limit': limit.toString()},
      );

      if (response['success'] == true) {
        final cars = (response['data'] as List)
            .map((car) => Car.fromJson(car))
            .toList();

        return {'cars': cars, 'pagination': response['pagination'] ?? {}};
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch cars');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Fetch filtered cars with caching
  Future<Map<String, dynamic>> fetchFilteredCars({
    List<Map<String, dynamic>> filters = const [],
    String searchTerm = '',
    int page = 1,
    int limit = AppConstants.defaultPageSize,
  }) async {
    try {
      // Create cache key
      final cacheKey =
          'filtered_cars_${filters.toString()}_${searchTerm}_$page';

      // Check cache first (only for first page)
      if (page == 1) {
        final cached = _cache.get<Map<String, dynamic>>(cacheKey);
        if (cached != null) {
          print('✅ Using cached data for: $cacheKey');
          return cached;
        }
      }

      final queryParams = {'page': page.toString(), 'limit': limit.toString()};

      if (searchTerm.isNotEmpty) {
        queryParams['searchTerm'] = searchTerm;
      }

      final response = await _apiService.post(
        AppConstants.carsEndpoint,
        body: {'filters': filters},
        queryParams: queryParams,
      );

      if (response['success'] == true) {
        final cars = (response['data'] as List)
            .map((car) => Car.fromJson(car))
            .toList();

        final result = {
          'cars': cars,
          'pagination': response['pagination'] ?? {},
        };

        // Cache first page only (2 minutes TTL for dynamic content)
        if (page == 1) {
          _cache.set(cacheKey, result, ttl: const Duration(minutes: 2));
        }

        return result;
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch filtered cars');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Fetch cars by IDs
  Future<List<Car>> fetchCarsByIds(List<String> ids) async {
    if (ids.isEmpty) {
      return [];
    }

    try {
      final response = await _apiService.post(
        AppConstants.getMyCarsEndpoint,
        body: {'carsIds': ids},
      );

      if (response['success'] == true) {
        return (response['data'] as List)
            .map((car) => Car.fromJson(car))
            .toList();
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch cars by ID');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Post car for approval
  Future<Map<String, dynamic>> postCarForApproval(
    Map<String, dynamic> carData,
  ) async {
    try {
      final response = await _apiService.post(
        AppConstants.postCarEndpoint,
        body: carData,
      );

      if (response['success'] == true) {
        return response['data'];
      } else {
        throw Exception(
          response['message'] ?? 'Failed to post car for approval',
        );
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  // Upload images
  Future<List<String>> uploadImages(List<dynamic> images) async {
    try {
      final response = await _apiService.uploadImages(images);

      if (response['success'] == true) {
        return List<String>.from(response['imageUrls'] ?? []);
      } else {
        throw Exception(response['message'] ?? 'Failed to upload images');
      }
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  void dispose() {
    _apiService.dispose();
  }
}
