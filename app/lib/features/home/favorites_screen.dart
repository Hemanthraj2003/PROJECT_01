import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/providers/user_provider.dart';
import '../../core/services/car_service.dart';
import '../../core/models/car_model.dart';
import 'car_detail_screen.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final CarService _carService = CarService();
  List<Car> _likedCars = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadLikedCars();
  }

  Future<void> _loadLikedCars() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = Provider.of<UserProvider>(context, listen: false).user;

      if (user == null || user.likedCars.isEmpty) {
        setState(() {
          _likedCars = [];
          _isLoading = false;
        });
        return;
      }

      final cars = await _carService.fetchCarsByIds(user.likedCars);

      if (mounted) {
        setState(() {
          _likedCars = cars;
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

  Future<void> _removeFavorite(String carId) async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);

    try {
      await userProvider.toggleLikedCar(carId);

      // Remove from local list
      setState(() {
        _likedCars.removeWhere((car) => car.id == carId);
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Removed from favorites'),
            backgroundColor: AppColors.success,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to remove: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _carService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadLikedCars,
              color: AppColors.primary,
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    )
                  : _errorMessage != null
                  ? _buildErrorState()
                  : _likedCars.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(12),
                      itemCount: _likedCars.length,
                      itemBuilder: (context, index) {
                        return _buildCarCard(_likedCars[index]);
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16),
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
      child: Text(
        'My Favorites',
        style: AppTypography.h3Style(color: AppColors.primary),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: AppColors.gradientPrimary,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: const Icon(
              Icons.favorite_border,
              size: 60,
              color: AppColors.textLight,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Favorites Yet',
            style: AppTypography.h2Style(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              'Start exploring cars and add them to your favorites',
              style: AppTypography.body1Style(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
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
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              _errorMessage ?? 'Failed to load favorites',
              style: AppTypography.body2Style(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: _loadLikedCars,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
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
            // Refresh the list when coming back in case likes changed
            _loadLikedCars();
          });
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Car Image
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    topRight: Radius.circular(12),
                  ),
                  child: car.images.isNotEmpty
                      ? Image.network(
                          car.images[0],
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          cacheWidth: 800,
                          cacheHeight: 360,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              height: 180,
                              width: double.infinity,
                              color: AppColors.greyLight,
                              child: const Center(
                                child: Icon(
                                  Icons.directions_car,
                                  size: 60,
                                  color: AppColors.grey,
                                ),
                              ),
                            );
                          },
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              height: 180,
                              width: double.infinity,
                              color: AppColors.greyLight,
                              child: Center(
                                child: CircularProgressIndicator(
                                  value:
                                      loadingProgress.expectedTotalBytes != null
                                      ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                      : null,
                                  color: AppColors.primary,
                                ),
                              ),
                            );
                          },
                        )
                      : Container(
                          height: 180,
                          width: double.infinity,
                          color: AppColors.greyLight,
                          child: const Center(
                            child: Icon(
                              Icons.directions_car,
                              size: 60,
                              color: AppColors.grey,
                            ),
                          ),
                        ),
                ),
              ],
            ),

            // Car Details
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Price and Heart Icon
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹ ${car.exceptedPrice.toStringAsFixed(0)}',
                        style: AppTypography.h3Style(color: AppColors.primary),
                      ),
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.15),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => _removeFavorite(car.id),
                            borderRadius: BorderRadius.circular(22),
                            child: Center(
                              child: ShaderMask(
                                shaderCallback: (bounds) => LinearGradient(
                                  colors: AppColors.gradientPrimary,
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ).createShader(bounds),
                                child: const Icon(
                                  Icons.favorite,
                                  color: AppColors.textLight,
                                  size: 24,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Car Name
                  Text(
                    '${car.manufacturingYear} ${car.carBrand} ${car.carModel}',
                    style: AppTypography.subtitle1Style(
                      color: AppColors.textPrimary,
                    ).copyWith(fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),

                  // Car Specs
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildSpecChip(
                        '${(car.kilometerDriven / 1000).toStringAsFixed(0)}k Km',
                      ),
                      _buildSpecChip(car.fuelType),
                      if (car.transmissionType.isNotEmpty)
                        _buildSpecChip(car.transmissionType),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.backgroundDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.greyLight, width: 1),
      ),
      child: Text(
        label,
        style: AppTypography.captionStyle(
          color: AppColors.textSecondary,
        ).copyWith(fontWeight: FontWeight.w600),
      ),
    );
  }
}
