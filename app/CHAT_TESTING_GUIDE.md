# 🧪 Chat System Testing Guide

## Quick Start
1. **Run the app**: `flutter run`
2. **Login** with your credentials
3. **Click the Chats button** on the home screen

## What to Look For

### 📱 Console Output
When you click the Chats button, you should see this output in your console:

```
📱 ChatsScreen: Loading chats - Page: 1
📱 ChatService: Fetching chats - Page: 1, Limit: 10
Making GET request to: https://friendscars.vercel.app/api/chats?page=1&limit=10
Response status: 200
Response body: {"success":true,"data":[...],"pagination":{...}}
✅ ChatService: Response received - Success: true
✅ ChatService: Parsed X chats
✅ ChatsScreen: Loaded X chats
📊 Pagination: {hasMore: true, currentPage: 1, totalPages: 2}
```

### ✅ Success Indicators
- Chat list loads with your conversations
- Each chat shows car ID, last message, and timestamp
- Unread chats have a blue dot badge
- Pull to refresh works
- Scrolling loads more chats (if you have many)

### ❌ Error Indicators
If you see errors, check these:

#### "Network error" or "Offline"
- Check your internet connection
- Verify API URL in `app_constants.dart`

#### "Error fetching chats" or 401/403 status
- Make sure you're logged in
- Check if auth token is valid
- Backend might require authentication

#### Empty list but console shows data
- Check Chat model JSON parsing
- Verify data structure matches backend response

## Testing Scenarios

### Scenario 1: First Time User (No Chats)
**Expected:**
- Empty state screen
- Message: "No chats yet"
- Subtitle: "Start a conversation by viewing a car"

**Console Output:**
```
📱 ChatsScreen: Loading chats - Page: 1
✅ ChatsScreen: Loaded 0 chats
```

### Scenario 2: User with Chats
**Expected:**
- List of chats appears
- Most recent chat at the top
- Unread badges on new chats

**Console Output:**
```
📱 ChatsScreen: Loading chats - Page: 1
✅ ChatsScreen: Loaded 5 chats
```

### Scenario 3: Opening a Conversation
**Steps:**
1. Click on a chat card
2. Conversation screen opens
3. Messages appear in chronological order

**Expected:**
- Messages load instantly (from Chat object)
- Oldest message at top, newest at bottom
- User messages on right (blue gradient)
- Admin messages on left (grey)

### Scenario 4: Sending a Message
**Steps:**
1. Open a conversation
2. Type a message
3. Click send button

**Expected:**
- Send button shows loading spinner
- Message appears immediately
- Success snackbar: "Message sent!"
- Auto-scroll to bottom

**Console Output:**
```
📱 ConversationScreen: Sending message
📱 ChatService: Sending message to chat: abc123
Making POST request to: https://friendscars.vercel.app/api/chats/send
Response status: 200
✅ ChatService: Message sent - Success: true
✅ ConversationScreen: Message sent successfully
```

### Scenario 5: Network Error
**Steps:**
1. Turn off WiFi/mobile data
2. Try to load chats

**Expected:**
- Error screen appears
- Message: "No internet connection"
- Retry button available

**Console Output:**
```
❌ ChatService Error: Exception: No internet connection
❌ ChatsScreen Error: Error fetching chats: No internet connection
```

## Debug Commands

### View Full API Response
Add this to `chat_service.dart` after receiving response:
```dart
print('Full response: ${jsonEncode(response)}');
```

### Check Auth Token
Add this to `api_service.dart` before making request:
```dart
// Get token from your auth service
final token = await AuthService.getToken();
print('Auth token: ${token?.substring(0, 20)}...');
```

### Monitor Network Calls
Run app with verbose logging:
```bash
flutter run --verbose
```

## Common Issues & Fixes

### Issue: Chats not loading
**Check:**
1. Console output for errors
2. API endpoint URL
3. Auth token exists and is valid
4. Backend API is running
5. Network connectivity

**Fix:**
```dart
// In app_constants.dart, verify:
static const String baseUrl = 'https://friendscars.vercel.app/api';
```

### Issue: Empty chat list when you have chats
**Check:**
1. Response structure in console
2. Chat model JSON parsing
3. Backend returns data in expected format

**Fix:**
Add debug in `chat_model.dart`:
```dart
factory Chat.fromJson(Map<String, dynamic> json) {
  print('Parsing chat: $json');
  // ... rest of code
}
```

### Issue: Messages not sending
**Check:**
1. Console output for error details
2. Message length (max 1000 chars)
3. Chat ID is valid
4. Auth token is valid

**Fix:**
Check `conversation_screen.dart` console logs

### Issue: App crashes on chat click
**Check:**
1. Chat data structure
2. Messages array exists
3. All required fields present

**Fix:**
Add null checks in `Chat` model:
```dart
messages: json['messages'] != null
    ? (json['messages'] as List).map((msg) => ChatMessage.fromJson(msg)).toList()
    : [],
```

## Performance Testing

### Load Time
- **Target:** Chat list loads in < 2 seconds
- **Check:** Time from click to data display

### Pagination
- **Target:** Smooth scrolling with no lag
- **Check:** Scroll to bottom and verify more chats load

### Message Sending
- **Target:** Message appears in < 1 second
- **Check:** Time from send click to message display

## API Testing (Optional)

Test endpoints directly using curl:

### GET /chats
```bash
curl -X GET "https://friendscars.vercel.app/api/chats?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /chats/start
```bash
curl -X GET "https://friendscars.vercel.app/api/chats/start?carId=CAR_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /chats/send
```bash
curl -X POST "https://friendscars.vercel.app/api/chats/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"chatId":"CHAT_ID","message":"Test message"}'
```

## Success Criteria
✅ Chat list loads successfully
✅ Chats sorted by most recent
✅ Unread badges display correctly
✅ Conversation opens on chat click
✅ Messages display in correct order
✅ Can send messages
✅ Error handling works
✅ Pull to refresh works
✅ Pagination works
✅ Empty states display correctly

## Next Steps After Testing
1. If everything works ✅ - You're done!
2. If errors occur ❌ - Share console output for debugging
3. Optional: Add "Chat With Us" button to car detail screen
4. Optional: Add unread count badge to Chats tab

## Need Help?
Share this information:
1. Full console output (copy from terminal)
2. Screenshots of error screens
3. Steps to reproduce the issue
4. Expected vs actual behavior
