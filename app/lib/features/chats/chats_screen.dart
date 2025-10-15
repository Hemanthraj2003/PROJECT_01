import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/chat_model.dart';
import '../../core/models/car_model.dart';
import '../../core/services/chat_service.dart';
import '../../core/services/car_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/providers/user_provider.dart';
import 'widgets/chat_card.dart';
import 'conversation_screen.dart';

class ChatsScreen extends StatefulWidget {
  const ChatsScreen({super.key});

  @override
  State<ChatsScreen> createState() => _ChatsScreenState();
}

class _ChatsScreenState extends State<ChatsScreen> {
  final ChatService _chatService = ChatService();
  final CarService _carService = CarService();
  final ScrollController _scrollController = ScrollController();

  List<Chat> _chats = [];
  Map<String, Car> _cars = {}; // Map of carId to Car
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadChats();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _chatService.dispose();
    _carService.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
            _scrollController.position.maxScrollExtent * 0.8 &&
        !_isLoading &&
        _hasMore) {
      _loadMoreChats();
    }
  }

  Future<void> _loadChats() async {
    if (_isLoading) return;

    final user = Provider.of<UserProvider>(context, listen: false).user;
    if (user == null) {
      setState(() {
        _errorMessage = 'Please login to view chats';
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print(
        '📱 ChatsScreen: Loading chats - UserId: ${user.uid}, Page: $_currentPage',
      );

      final result = await _chatService.fetchChats(
        userId: user.uid,
        page: _currentPage,
      );
      final chats = result['chats'] as List<Chat>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      print('✅ ChatsScreen: Loaded ${chats.length} chats');
      print('📊 Pagination: $pagination');

      setState(() {
        _chats = chats;
        final totalPages = pagination['totalPages'] ?? 1;
        _hasMore = _currentPage < totalPages;
        _isLoading = false;
      });

      // Fetch car details for the chats
      _fetchCarsForChats(chats);
    } catch (e) {
      print('❌ ChatsScreen Error: $e');
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMoreChats() async {
    if (_isLoading || !_hasMore) return;

    final user = Provider.of<UserProvider>(context, listen: false).user;
    if (user == null) return;

    setState(() {
      _isLoading = true;
      _currentPage++;
    });

    try {
      print('📱 ChatsScreen: Loading more chats - Page: $_currentPage');

      final result = await _chatService.fetchChats(
        userId: user.uid,
        page: _currentPage,
      );
      final chats = result['chats'] as List<Chat>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      print('✅ ChatsScreen: Loaded ${chats.length} more chats');

      setState(() {
        _chats.addAll(chats);
        final totalPages = pagination['totalPages'] ?? 1;
        _hasMore = _currentPage < totalPages;
        _isLoading = false;
      });

      // Fetch car details for the new chats
      _fetchCarsForChats(chats);
    } catch (e) {
      print('❌ ChatsScreen Error: $e');
      setState(() {
        _currentPage--;
        _isLoading = false;
      });
    }
  }

  Future<void> _refreshChats() async {
    setState(() {
      _currentPage = 1;
      _hasMore = true;
      _chats.clear();
      _cars.clear(); // Clear car cache too
    });
    await _loadChats();
  }

  Future<void> _fetchCarsForChats(List<Chat> chats) async {
    try {
      // Get unique car IDs that we don't already have
      final carIdsToFetch = chats
          .map((chat) => chat.carId)
          .where((carId) => !_cars.containsKey(carId))
          .toList();

      if (carIdsToFetch.isEmpty) return;

      print('📱 ChatsScreen: Fetching ${carIdsToFetch.length} car details');

      final cars = await _carService.fetchCarsByIds(carIdsToFetch);

      if (mounted) {
        setState(() {
          for (var car in cars) {
            _cars[car.id] = car;
          }
        });
        print('✅ ChatsScreen: Fetched ${cars.length} cars');
      }
    } catch (e) {
      print('❌ ChatsScreen: Error fetching cars: $e');
      // Don't show error to user, just fall back to showing car IDs
    }
  }

  void _navigateToConversation(Chat chat) async {
    final car = _cars[chat.carId]; // Get car if we have it

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ConversationScreen(
          chat: chat,
          car: car, // Pass car to conversation screen
        ),
      ),
    );

    // Refresh the chat list when returning from conversation
    if (result == true) {
      _refreshChats();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: _buildBody());
  }

  Widget _buildBody() {
    // Error State
    if (_errorMessage != null && _chats.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                'Error Loading Chats',
                style: AppTypography.h2Style(color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                style: AppTypography.body1Style(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _refreshChats,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                ),
                child: Text(
                  'Retry',
                  style: AppTypography.subtitle1Style(
                    color: AppColors.textLight,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Loading State (first load)
    if (_isLoading && _chats.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      );
    }

    // Empty State
    if (_chats.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: AppColors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              'No chats yet',
              style: AppTypography.h2Style(color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Text(
              'Start a conversation by viewing a car',
              style: AppTypography.body1Style(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    // Chat List
    return RefreshIndicator(
      onRefresh: _refreshChats,
      color: AppColors.primary,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: _chats.length + (_hasMore && _isLoading ? 1 : 0),
        itemBuilder: (context, index) {
          if (index >= _chats.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              ),
            );
          }

          final chat = _chats[index];
          final car = _cars[chat.carId]; // Get car if available

          return ChatCard(
            chat: chat,
            car: car,
            onTap: () => _navigateToConversation(chat),
          );
        },
      ),
    );
  }
}
