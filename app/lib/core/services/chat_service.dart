import '../models/chat_model.dart';
import 'api_service.dart';

class ChatService {
  final ApiService _apiService = ApiService();

  // Fetch all chats with pagination
  Future<Map<String, dynamic>> fetchChats({
    required String userId,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      print('📱 ChatService: Fetching chats - UserId: $userId, Page: $page, Limit: $limit');
      
      final response = await _apiService.post(
        '/chats/user/$userId',
        body: {
          'currentPage': page,
          'pageSize': limit,
        },
      );

      print('✅ ChatService: Response received - Success: ${response['success']}');

      if (response['success'] == true) {
        final chats = (response['data'] as List)
            .map((chat) => Chat.fromJson(chat))
            .toList();

        print('✅ ChatService: Parsed ${chats.length} chats');

        final pagination = response['pagination'] as Map<String, dynamic>?;
        
        return {
          'chats': chats,
          'pagination': pagination ?? {},
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch chats');
      }
    } catch (e) {
      print('❌ ChatService Error: $e');
      throw Exception('Error fetching chats: ${e.toString()}');
    }
  }

  // Start a new chat (or get existing one)
  Future<Chat> startChat({
    required String carId,
    required String userId,
  }) async {
    try {
      print('📱 ChatService: Starting chat - CarId: $carId, UserId: $userId');
      
      final response = await _apiService.post(
        '/chats/start',
        body: {
          'carId': carId,
          'userId': userId,
        },
      );

      print('✅ ChatService: Start chat response - Success: ${response['success']}');

      if (response['success'] == true) {
        return Chat.fromJson(response['chat']);
      } else {
        throw Exception(response['message'] ?? 'Failed to start chat');
      }
    } catch (e) {
      print('❌ ChatService Error: $e');
      throw Exception('Error starting chat: ${e.toString()}');
    }
  }

  // Send a message in a chat
  Future<Chat> sendMessage({
    required String chatId,
    required String userId,
    required String content,
  }) async {
    try {
      if (content.trim().isEmpty) {
        throw Exception('Message cannot be empty');
      }

      if (content.length > 1000) {
        throw Exception('Message is too long. Maximum 1000 characters allowed.');
      }

      print('📱 ChatService: Sending message to chat: $chatId');

      final messageData = {
        'message': content.trim(),
        'sentBy': 'user',
        'timeStamp': DateTime.now().toIso8601String(),
      };

      final response = await _apiService.post(
        '/chats/send',
        body: {
          'chatId': chatId,
          'userId': userId,
          'messageData': messageData,
        },
      );

      print('✅ ChatService: Message sent - Success: ${response['success']}');

      if (response['success'] == true) {
        return Chat.fromJson(response['data']);
      } else {
        throw Exception(response['message'] ?? 'Failed to send message');
      }
    } catch (e) {
      print('❌ ChatService Error: $e');
      throw Exception('Error sending message: ${e.toString()}');
    }
  }

  // Mark chat as read
  Future<void> markAsRead(String chatId) async {
    try {
      print('📱 ChatService: Marking chat as read: $chatId');
      
      final response = await _apiService.post(
        '/chats/read',
        body: {
          'chatId': chatId,
        },
      );

      if (response['success'] != true) {
        throw Exception(response['message'] ?? 'Failed to mark as read');
      }
      
      print('✅ ChatService: Chat marked as read');
    } catch (e) {
      print('❌ ChatService Error: $e');
      throw Exception('Error marking as read: ${e.toString()}');
    }
  }

  void dispose() {
    _apiService.dispose();
  }
}
