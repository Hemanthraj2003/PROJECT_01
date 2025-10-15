import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/providers/user_provider.dart';
import '../../core/services/car_service.dart';
import '../../core/models/car_model.dart';
import 'car_detail_screen.dart';

class MyCarsScreen extends StatefulWidget {
  const MyCarsScreen({super.key});

  @override
  State<MyCarsScreen> createState() => _MyCarsScreenState();
}

class _MyCarsScreenState extends State<MyCarsScreen>
    with SingleTickerProviderStateMixin {
  final CarService _carService = CarService();
  late TabController _tabController;
  List<Car> _onSaleCars = [];
  List<Car> _boughtCars = [];
  List<Car> _soldCars = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadMyCars();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _carService.dispose();
    super.dispose();
  }

  Future<void> _loadMyCars() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = Provider.of<UserProvider>(context, listen: false).user;

      if (user == null) {
        setState(() {
          _onSaleCars = [];
          _boughtCars = [];
          _soldCars = [];
          _isLoading = false;
        });
        return;
      }

      // Fetch cars from each array separately (matching React Native logic)
      final onSaleCarsFuture = user.onSaleCars.isNotEmpty
          ? _carService.fetchCarsByIds(user.onSaleCars)
          : Future.value(<Car>[]);

      final boughtCarsFuture = user.boughtCars.isNotEmpty
          ? _carService.fetchCarsByIds(user.boughtCars)
          : Future.value(<Car>[]);

      final soldCarsFuture = user.soldCars.isNotEmpty
          ? _carService.fetchCarsByIds(user.soldCars)
          : Future.value(<Car>[]);

      final results = await Future.wait([
        onSaleCarsFuture,
        boughtCarsFuture,
        soldCarsFuture,
      ]);

      if (mounted) {
        setState(() {
          _onSaleCars = results[0];
          _boughtCars = results[1];
          _soldCars = results[2];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: Column(
        children: [
          _buildTabBar(),
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  )
                : _errorMessage != null
                ? _buildErrorState()
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildCarList(_onSaleCars, 'on sale'),
                      _buildCarList(_boughtCars, 'bought'),
                      _buildCarList(_soldCars, 'sold'),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          gradient: const LinearGradient(
            colors: AppColors.gradientPrimary,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        labelColor: AppColors.textLight,
        unselectedLabelColor: AppColors.textSecondary,
        labelStyle: AppTypography.body2Style(
          color: AppColors.textLight,
        ).copyWith(fontWeight: FontWeight.bold),
        unselectedLabelStyle: AppTypography.body2Style(
          color: AppColors.textSecondary,
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        tabs: const [
          Tab(text: 'On Sale'),
          Tab(text: 'Bought'),
          Tab(text: 'Sold'),
        ],
      ),
    );
  }

  Widget _buildCarList(List<Car> cars, String status) {
    if (cars.isEmpty) {
      return _buildEmptyState(status);
    }

    return RefreshIndicator(
      onRefresh: _loadMyCars,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: cars.length,
        itemBuilder: (context, index) {
          return _buildCarCard(cars[index]);
        },
      ),
    );
  }

  Widget _buildCarCard(Car car) {
    return Card(
      elevation: 3,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => CarDetailScreen(car: car)),
          ).then((_) {
            // Refresh the list when coming back
            _loadMyCars();
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Car Image
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: car.images.isNotEmpty
                    ? Image.network(
                        car.images[0],
                        width: 80,
                        height: 80,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 80,
                            height: 80,
                            color: AppColors.greyLight,
                            child: const Icon(
                              Icons.directions_car,
                              size: 40,
                              color: AppColors.grey,
                            ),
                          );
                        },
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Container(
                            width: 80,
                            height: 80,
                            color: AppColors.greyLight,
                            child: Center(
                              child: CircularProgressIndicator(
                                value:
                                    loadingProgress.expectedTotalBytes != null
                                    ? loadingProgress.cumulativeBytesLoaded /
                                          loadingProgress.expectedTotalBytes!
                                    : null,
                                color: AppColors.primary,
                                strokeWidth: 2,
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        width: 80,
                        height: 80,
                        color: AppColors.greyLight,
                        child: const Icon(
                          Icons.directions_car,
                          size: 40,
                          color: AppColors.grey,
                        ),
                      ),
              ),
              const SizedBox(width: 14),

              // Car Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Car Name
                    Text(
                      '${car.carBrand} ${car.carModel}',
                      style: AppTypography.subtitle1Style(
                        color: AppColors.textPrimary,
                      ).copyWith(fontWeight: FontWeight.w600),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),

                    // Price
                    Text(
                      '₹ ${car.exceptedPrice.toStringAsFixed(0)}',
                      style: AppTypography.h3Style(color: AppColors.primary),
                    ),
                    const SizedBox(height: 4),

                    // Details
                    Row(
                      children: [
                        Text(
                          '${car.manufacturingYear} • ',
                          style: AppTypography.body2Style(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        Text(
                          '${(car.kilometerDriven / 1000).toStringAsFixed(0)}k km',
                          style: AppTypography.body2Style(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Status Badge
              _buildStatusBadge(car.carStatus ?? 'pending'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color badgeColor;
    Color textColor;
    IconData icon;

    switch (status.toLowerCase()) {
      case 'approved':
        badgeColor = AppColors.success.withOpacity(0.15);
        textColor = AppColors.success;
        icon = Icons.check_circle;
        break;
      case 'pending':
        badgeColor = AppColors.warning.withOpacity(0.15);
        textColor = AppColors.warning;
        icon = Icons.schedule;
        break;
      case 'rejected':
        badgeColor = AppColors.error.withOpacity(0.15);
        textColor = AppColors.error;
        icon = Icons.cancel;
        break;
      default:
        badgeColor = AppColors.grey.withOpacity(0.15);
        textColor = AppColors.grey;
        icon = Icons.help_outline;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          const SizedBox(width: 4),
          Text(
            status.toUpperCase(),
            style: AppTypography.captionStyle(
              color: textColor,
            ).copyWith(fontWeight: FontWeight.bold, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String status) {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.backgroundDark,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.directions_car_outlined,
                  size: 60,
                  color: AppColors.grey,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'No Cars $status'.toUpperCase(),
                style: AppTypography.h3Style(color: AppColors.textPrimary),
              ),
              const SizedBox(height: 12),
              Text(
                status == 'on sale'
                    ? 'Your cars for sale will appear here'
                    : status == 'bought'
                    ? 'Cars you\'ve purchased will appear here'
                    : 'Cars you\'ve sold will appear here',
                style: AppTypography.body1Style(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              if (status == 'on sale')
                ElevatedButton.icon(
                  onPressed: () {
                    // TODO: Navigate to post car screen
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Post car feature coming soon!'),
                        backgroundColor: AppColors.info,
                      ),
                    );
                  },
                  icon: const Icon(Icons.add, color: AppColors.textLight),
                  label: Text(
                    'Post a Car',
                    style: AppTypography.body1Style(color: AppColors.textLight),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 80, color: AppColors.error),
            const SizedBox(height: 20),
            Text(
              'Oops! Something went wrong',
              style: AppTypography.h3Style(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            Text(
              _errorMessage ?? 'Failed to load your cars',
              style: AppTypography.body2Style(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: _loadMyCars,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(
                  horizontal: 30,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Try Again',
                style: AppTypography.body1Style(color: AppColors.textLight),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
