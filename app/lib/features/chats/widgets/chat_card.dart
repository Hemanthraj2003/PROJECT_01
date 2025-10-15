import 'package:flutter/material.dart';
import '../../../core/models/chat_model.dart';
import '../../../core/models/car_model.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import 'package:intl/intl.dart';

class ChatCard extends StatelessWidget {
  final Chat chat;
  final Car? car;
  final VoidCallback onTap;

  const ChatCard({
    super.key,
    required this.chat,
    this.car,
    required this.onTap,
  });

  String _formatTime(String timestamp) {
    try {
      final messageDate = DateTime.parse(timestamp);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final messageDay = DateTime(
        messageDate.year,
        messageDate.month,
        messageDate.day,
      );

      if (messageDay == today) {
        // Today - show time
        return DateFormat('hh:mm a').format(messageDate);
      } else if (messageDay == today.subtract(const Duration(days: 1))) {
        // Yesterday
        return 'Yesterday';
      } else if (now.difference(messageDate).inDays < 7) {
        // This week - show day name
        return DateFormat('EEE').format(messageDate);
      } else {
        // Older - show date
        return DateFormat('MMM dd').format(messageDate);
      }
    } catch (e) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final lastMessage = chat.lastMessage;
    final isUnread = chat.isUnread;

    return Card(
      elevation: isUnread ? 6 : 2,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isUnread
            ? BorderSide(color: AppColors.primary.withOpacity(0.5), width: 2)
            : BorderSide.none,
      ),
      shadowColor: isUnread
          ? AppColors.primary.withOpacity(0.3)
          : Colors.black.withOpacity(0.1),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: isUnread
              ? BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: LinearGradient(
                    colors: [
                      AppColors.primaryLight.withOpacity(0.05),
                      AppColors.background,
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                )
              : null,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Car Icon/Avatar
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isUnread
                          ? AppColors.gradientPrimary
                          : [AppColors.greyLight, AppColors.grey],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: isUnread
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: const Icon(
                    Icons.directions_car,
                    color: AppColors.textLight,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 12),

                // Chat Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Car Title
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              car != null
                                  ? '${car!.carBrand} ${car!.carModel}'
                                  : 'Car #${chat.carId.substring(chat.carId.length > 8 ? chat.carId.length - 8 : 0)}',
                              style:
                                  AppTypography.subtitle1Style(
                                    color: AppColors.textPrimary,
                                  ).copyWith(
                                    fontWeight: isUnread
                                        ? FontWeight.bold
                                        : FontWeight.w600,
                                  ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          // Time
                          Text(
                            _formatTime(chat.lastMessageAt),
                            style:
                                AppTypography.captionStyle(
                                  color: isUnread
                                      ? AppColors.primary
                                      : AppColors.textSecondary,
                                ).copyWith(
                                  fontWeight: isUnread
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),

                      // Last Message
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              lastMessage?.message ?? 'No messages yet',
                              style:
                                  AppTypography.body2Style(
                                    color: isUnread
                                        ? AppColors.textPrimary
                                        : AppColors.textSecondary,
                                  ).copyWith(
                                    fontWeight: isUnread
                                        ? FontWeight.w500
                                        : FontWeight.normal,
                                  ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isUnread) ...[
                            const SizedBox(width: 8),
                            // Unread Badge with pulse effect
                            Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: AppColors.gradientPrimary,
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withOpacity(0.5),
                                    blurRadius: 8,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                              child: const Center(
                                child: Icon(
                                  Icons.circle,
                                  color: AppColors.textLight,
                                  size: 10,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
