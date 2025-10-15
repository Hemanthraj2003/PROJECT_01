import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/models/car_model.dart';
import '../../core/services/car_service.dart';
import 'car_detail_screen.dart';
import 'widgets/filter_bottom_sheet.dart';
import 'widgets/car_card.dart';

class BuyCarsScreen extends StatefulWidget {
  const BuyCarsScreen({super.key});

  @override
  State<BuyCarsScreen> createState() => _BuyCarsScreenState();
}

class _BuyCarsScreenState extends State<BuyCarsScreen> {
  final CarService _carService = CarService();
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<Car> _cars = [];
  bool _isLoading = false;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String _searchTerm = '';
  List<Map<String, dynamic>> _activeFilters = [
    {'field': 'carStatus', 'condition': '==', 'value': 'approved'},
  ];

  @override
  void initState() {
    super.initState();
    _loadCars(reset: true);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    _carService.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent - 200 &&
        !_isLoadingMore &&
        _hasMore) {
      _loadCars();
    }
  }

  Future<void> _loadCars({bool reset = false}) async {
    if (_isLoading || _isLoadingMore) return;

    setState(() {
      if (reset) {
        _isLoading = true;
        _currentPage = 1;
        _cars = [];
      } else {
        _isLoadingMore = true;
      }
    });

    try {
      final result = await _carService.fetchFilteredCars(
        filters: _activeFilters,
        searchTerm: _searchTerm,
        page: _currentPage,
      );

      if (mounted) {
        setState(() {
          if (reset) {
            _cars = result['cars'] as List<Car>;
          } else {
            _cars.addAll(result['cars'] as List<Car>);
          }

          final pagination = result['pagination'] as Map<String, dynamic>;
          _hasMore = pagination['hasMore'] ?? false;
          _currentPage++;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isLoadingMore = false;
        });
      }
    }
  }

  void _onSearch(String query) {
    setState(() {
      _searchTerm = query;
    });
    _loadCars(reset: true);
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FilterBottomSheet(
        activeFilters: _activeFilters,
        onApplyFilters: (filters) {
          setState(() {
            _activeFilters = filters;
          });
          _loadCars(reset: true);
        },
        onReset: () {
          setState(() {
            _activeFilters = [
              {'field': 'carStatus', 'condition': '==', 'value': 'approved'},
            ];
          });
          _loadCars(reset: true);
        },
      ),
    );
  }

  Future<void> _onRefresh() async {
    setState(() {
      _searchTerm = '';
      _searchController.clear();
      _activeFilters = [
        {'field': 'carStatus', 'condition': '==', 'value': 'approved'},
      ];
    });
    await _loadCars(reset: true);
  }

  int get _activeFilterCount {
    // Count non-status filters
    return _activeFilters.where((f) => f['field'] != 'carStatus').length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : _cars.isEmpty
                ? _buildEmptyState()
                : _buildCarsList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.greyLight),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                style: AppTypography.body1Style(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Search cars...',
                  hintStyle: AppTypography.body1Style(
                    color: AppColors.textSecondary,
                  ),
                  prefixIcon: const Icon(
                    Icons.search,
                    color: AppColors.textSecondary,
                  ),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(
                            Icons.close,
                            color: AppColors.textSecondary,
                          ),
                          onPressed: () {
                            _searchController.clear();
                            _onSearch('');
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                ),
                onSubmitted: _onSearch,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Stack(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: _activeFilterCount > 0
                      ? AppColors.primary
                      : AppColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _activeFilterCount > 0
                        ? AppColors.primary
                        : AppColors.greyLight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 2,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: IconButton(
                  icon: Icon(
                    Icons.filter_list,
                    color: _activeFilterCount > 0
                        ? AppColors.textLight
                        : AppColors.textPrimary,
                  ),
                  onPressed: _showFilterSheet,
                ),
              ),
              if (_activeFilterCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: AppColors.accent2,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 18,
                      minHeight: 18,
                    ),
                    child: Center(
                      child: Text(
                        '$_activeFilterCount',
                        style: AppTypography.captionStyle(
                          color: AppColors.textLight,
                        ).copyWith(fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 80, color: AppColors.greyLight),
          const SizedBox(height: 20),
          Text(
            _searchTerm.isNotEmpty
                ? 'No cars found for "$_searchTerm"'
                : 'No cars available',
            style: AppTypography.h3Style(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 10),
          Text(
            'Try adjusting your search or filters',
            style: AppTypography.body2Style(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildCarsList() {
    return RefreshIndicator(
      onRefresh: _onRefresh,
      color: AppColors.primary,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(12),
        itemCount: _cars.length + (_isLoadingMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _cars.length) {
            return const Padding(
              padding: EdgeInsets.all(24.0),
              child: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            );
          }

          final car = _cars[index];
          return CarCard(
            car: car,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CarDetailScreen(car: car),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
