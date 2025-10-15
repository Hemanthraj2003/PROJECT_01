import 'package:flutter/foundation.dart';
import '../models/car_model.dart';
import '../services/car_service.dart';
import '../constants/app_constants.dart';

class CarProvider with ChangeNotifier {
  final CarService _carService = CarService();

  List<Car> _cars = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String _searchTerm = '';
  List<Map<String, dynamic>> _filters = [];

  List<Car> get cars => _cars;
  bool get isLoading => _isLoading;
  bool get hasMore => _hasMore;
  int get currentPage => _currentPage;

  // Fetch cars with pagination
  Future<void> fetchCars({bool refresh = false}) async {
    if (_isLoading) return;
    if (!refresh && !_hasMore) return;

    _isLoading = true;
    notifyListeners();

    try {
      if (refresh) {
        _currentPage = 1;
        _cars = [];
        _hasMore = true;
      }

      final result = await _carService.fetchAllCars(
        page: _currentPage,
        limit: AppConstants.defaultPageSize,
      );

      final newCars = result['cars'] as List<Car>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      if (refresh) {
        _cars = newCars;
      } else {
        _cars.addAll(newCars);
      }

      _hasMore = pagination['hasMore'] ?? false;
      _currentPage++;
    } catch (e) {
      debugPrint('Fetch cars error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch filtered cars
  Future<void> fetchFilteredCars({
    List<Map<String, dynamic>>? filters,
    String? searchTerm,
    bool refresh = false,
  }) async {
    if (_isLoading) return;

    _isLoading = true;
    notifyListeners();

    try {
      if (refresh) {
        _currentPage = 1;
        _cars = [];
        _hasMore = true;
      }

      if (filters != null) _filters = filters;
      if (searchTerm != null) _searchTerm = searchTerm;

      final result = await _carService.fetchFilteredCars(
        filters: _filters,
        searchTerm: _searchTerm,
        page: _currentPage,
        limit: AppConstants.defaultPageSize,
      );

      final newCars = result['cars'] as List<Car>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      if (refresh) {
        _cars = newCars;
      } else {
        _cars.addAll(newCars);
      }

      _hasMore = pagination['hasMore'] ?? false;
      _currentPage++;
    } catch (e) {
      debugPrint('Fetch filtered cars error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch cars by IDs
  Future<List<Car>> fetchCarsByIds(List<String> ids) async {
    try {
      return await _carService.fetchCarsByIds(ids);
    } catch (e) {
      debugPrint('Fetch cars by IDs error: $e');
      rethrow;
    }
  }

  // Post car for approval
  Future<Map<String, dynamic>> postCar(Map<String, dynamic> carData) async {
    try {
      _isLoading = true;
      notifyListeners();

      final carResponse = await _carService.postCarForApproval(carData);
      return carResponse;
    } catch (e) {
      debugPrint('Post car error: $e');
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear filters and search
  void clearFilters() {
    _filters = [];
    _searchTerm = '';
    _currentPage = 1;
    _hasMore = true;
    notifyListeners();
  }

  @override
  void dispose() {
    _carService.dispose();
    super.dispose();
  }
}
