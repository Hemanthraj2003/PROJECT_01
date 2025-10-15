import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/models/car_model.dart';
import '../../core/services/chat_service.dart';
import '../../core/providers/user_provider.dart';
import '../chats/conversation_screen.dart';

class CarDetailScreen extends StatefulWidget {
  final Car car;

  const CarDetailScreen({super.key, required this.car});

  @override
  State<CarDetailScreen> createState() => _CarDetailScreenState();
}

class _CarDetailScreenState extends State<CarDetailScreen> {
  int _currentImageIndex = 0;
  final PageController _pageController = PageController();
  final ChatService _chatService = ChatService();
  bool _isLiked = false;
  bool _isStartingChat = false;
  bool _isTogglingLike = false;

  @override
  void initState() {
    super.initState();
    _checkIfLiked();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _checkIfLiked() {
    final user = Provider.of<UserProvider>(context, listen: false).user;
    if (user != null) {
      setState(() {
        _isLiked = user.likedCars.contains(widget.car.id);
      });
    }
  }

  Future<void> _startChatWithUs() async {
    final user = Provider.of<UserProvider>(context, listen: false).user;

    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login to start a chat'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isStartingChat = true;
    });

    try {
      print('🚗 Starting chat for car: ${widget.car.id}, user: ${user.uid}');

      final chat = await _chatService.startChat(
        carId: widget.car.id,
        userId: user.uid,
      );

      print('✅ Chat created/fetched: ${chat.id}');

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                ConversationScreen(chat: chat, car: widget.car),
          ),
        );
      }
    } catch (e) {
      print('❌ Error starting chat: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start chat: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isStartingChat = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildImageCarousel(),
                _buildPaginationDots(),
                _buildCarInfoCard(),
                _buildOverviewCard(),
                _buildDescriptionCard(),
                const SizedBox(height: 80), // Space for bottom bar
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      backgroundColor: AppColors.primary,
      elevation: 4,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: AppColors.textLight),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        'Car Details',
        style: AppTypography.h3Style(color: AppColors.textLight),
      ),
    );
  }

  Widget _buildImageCarousel() {
    if (widget.car.images.isEmpty) {
      return Container(
        height: 280,
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.greyLight,
          borderRadius: BorderRadius.circular(18),
        ),
        child: const Center(
          child: Icon(Icons.directions_car, size: 80, color: AppColors.grey),
        ),
      );
    }

    return Container(
      height: 280,
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.1),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: PageView.builder(
          controller: _pageController,
          onPageChanged: (index) {
            setState(() {
              _currentImageIndex = index;
            });
          },
          itemCount: widget.car.images.length,
          itemBuilder: (context, index) {
            return Image.network(
              widget.car.images[index],
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: AppColors.greyLight,
                  child: const Icon(
                    Icons.broken_image,
                    size: 60,
                    color: AppColors.grey,
                  ),
                );
              },
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Container(
                  color: AppColors.greyLight,
                  child: Center(
                    child: CircularProgressIndicator(
                      value: loadingProgress.expectedTotalBytes != null
                          ? loadingProgress.cumulativeBytesLoaded /
                                loadingProgress.expectedTotalBytes!
                          : null,
                      color: AppColors.primary,
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildPaginationDots() {
    if (widget.car.images.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(
          widget.car.images.length,
          (index) => AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            margin: const EdgeInsets.symmetric(horizontal: 3.5),
            width: _currentImageIndex == index ? 14 : 10,
            height: _currentImageIndex == index ? 14 : 10,
            decoration: BoxDecoration(
              color: _currentImageIndex == index
                  ? AppColors.primary
                  : AppColors.greyLight,
              shape: BoxShape.circle,
              border: _currentImageIndex == index
                  ? Border.all(color: AppColors.primaryLight, width: 2)
                  : null,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCarInfoCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: AppColors.gradientPrimary,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '₹ ${widget.car.exceptedPrice.toStringAsFixed(0)}',
            style: AppTypography.h1Style(color: AppColors.textLight).copyWith(
              shadows: [
                Shadow(
                  color: AppColors.primaryDark.withOpacity(0.5),
                  offset: const Offset(0, 1),
                  blurRadius: 3,
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            widget.car.carModel,
            style: AppTypography.subtitle1Style(
              color: AppColors.textLight,
            ).copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            widget.car.manufacturingYear,
            style: AppTypography.body2Style(color: AppColors.textLight),
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.only(top: 12),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: AppColors.greyLight.withOpacity(0.3),
                  width: 0.5,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSpecBlock(Icons.local_gas_station, widget.car.fuelType),
                _buildSpecBlock(
                  Icons.speed,
                  '${(widget.car.kilometerDriven / 1000).toStringAsFixed(0)}k km',
                ),
                _buildSpecBlock(Icons.settings, widget.car.transmissionType),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecBlock(IconData icon, String text) {
    return Column(
      children: [
        Icon(icon, size: 22, color: AppColors.textLight),
        const SizedBox(height: 5),
        Text(
          text,
          style: AppTypography.body2Style(
            color: AppColors.textLight,
          ).copyWith(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildOverviewCard() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(10),
            child: Text(
              'Overview',
              style: AppTypography.subtitle1Style(
                color: AppColors.textPrimary,
              ).copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          const Divider(height: 1, color: AppColors.greyLight),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              children: [
                _buildOverviewRow(
                  Icons.calendar_today,
                  'Date',
                  DateTime.now().toString().split(' ')[0],
                ),
                const SizedBox(height: 10),
                _buildOverviewRow(
                  Icons.people_outline,
                  'Owner',
                  '${widget.car.ownerChange}${_getOrdinalSuffix(widget.car.ownerChange)}',
                ),
                const SizedBox(height: 10),
                if (widget.car.location != null)
                  _buildOverviewRow(
                    Icons.location_on_outlined,
                    'Location',
                    widget.car.location!,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getOrdinalSuffix(int number) {
    if (number >= 11 && number <= 13) {
      return 'th';
    }
    switch (number % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  Widget _buildOverviewRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 24, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text(
          '$label - ',
          style: AppTypography.body2Style(
            color: AppColors.textSecondary,
          ).copyWith(fontWeight: FontWeight.bold),
        ),
        Expanded(
          child: Text(
            value,
            style: AppTypography.body2Style(
              color: AppColors.textSecondary,
            ).copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildDescriptionCard() {
    if (widget.car.description == null || widget.car.description!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(10),
            child: Text(
              'Description',
              style: AppTypography.subtitle1Style(
                color: AppColors.textPrimary,
              ).copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          const Divider(height: 1, color: AppColors.greyLight),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.car.description!,
                  style: AppTypography.body1Style(color: AppColors.textPrimary),
                ),
                const SizedBox(height: 10),
                Text(
                  'Contact for more information',
                  style: AppTypography.body2Style(color: AppColors.primary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(18),
          topRight: Radius.circular(18),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.accent2],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isStartingChat ? null : _startChatWithUs,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: _isStartingChat
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.textLight,
                            ),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.chat_bubble_outline,
                              color: AppColors.textLight,
                              size: 24,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Chat With Us',
                              style:
                                  AppTypography.subtitle1Style(
                                    color: AppColors.textLight,
                                  ).copyWith(
                                    letterSpacing: 0.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.background,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _isLiked
                        ? AppColors.primary.withOpacity(0.2)
                        : Colors.black.withOpacity(0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: IconButton(
                icon: ShaderMask(
                  shaderCallback: (bounds) => LinearGradient(
                    colors: AppColors.gradientPrimary,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ).createShader(bounds),
                  child: Icon(
                    _isLiked ? Icons.favorite : Icons.favorite_border,
                    color: AppColors.textLight,
                    size: 28,
                  ),
                ),
                onPressed: _isTogglingLike ? null : _toggleLike,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _toggleLike() async {
    final userProvider = Provider.of<UserProvider>(context, listen: false);

    if (userProvider.user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login to like cars'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() {
      _isTogglingLike = true;
      _isLiked = !_isLiked;
    });

    try {
      await userProvider.toggleLikedCar(widget.car.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _isLiked ? 'Added to favorites' : 'Removed from favorites',
            ),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      // Revert on error
      if (mounted) {
        setState(() {
          _isLiked = !_isLiked;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update favorites: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isTogglingLike = false;
        });
      }
    }
  }
}
