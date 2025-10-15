class ChatMessage {
  final String sentBy; // "admin" or "user"
  final String message;
  final String timeStamp;

  ChatMessage({
    required this.sentBy,
    required this.message,
    required this.timeStamp,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      sentBy: json['sentBy']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      timeStamp: json['timeStamp']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sentBy': sentBy,
      'message': message,
      'timeStamp': timeStamp,
    };
  }
}

class Chat {
  final String id;
  final String carId;
  final String userId;
  final bool readByAdmin;
  final bool readByUser;
  final String lastMessageAt;
  final List<ChatMessage> messages;

  Chat({
    required this.id,
    required this.carId,
    required this.userId,
    required this.readByAdmin,
    required this.readByUser,
    required this.lastMessageAt,
    required this.messages,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id']?.toString() ?? '',
      carId: json['carId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      readByAdmin: json['readByAdmin'] == true,
      readByUser: json['readByUser'] == true,
      lastMessageAt: json['lastMessageAt']?.toString() ?? '',
      messages: json['messages'] != null
          ? (json['messages'] as List)
              .map((msg) => ChatMessage.fromJson(msg))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'carId': carId,
      'userId': userId,
      'readByAdmin': readByAdmin,
      'readByUser': readByUser,
      'lastMessageAt': lastMessageAt,
      'messages': messages.map((msg) => msg.toJson()).toList(),
    };
  }

  bool get isUnread => !readByUser;

  ChatMessage? get lastMessage =>
      messages.isNotEmpty ? messages.first : null;
}
