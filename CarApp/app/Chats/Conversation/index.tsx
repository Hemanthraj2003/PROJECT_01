import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { Image } from "expo-image";
import colorThemes from "@/app/theme";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { sendMessages } from "../chatServices";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { typography } from "@/app/theme";

// Initialize dayjs plugins
dayjs.extend(relativeTime);
type ChatMessage = {
  sentBy: "admin" | "user";
  message: string;
  timeStamp: string;
};
type Chat = {
  id: string;
  carId: string;
  userId: string;
  readByAdmin: boolean;
  readByUser: boolean;
  lastMessageAt: string;
  messages: ChatMessage[];
};

const index = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [chat, setChat] = useState<Chat>();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();

  const carData: any = JSON.parse(params.carData as string);

  useEffect(() => {
    try {
      setChat(JSON.parse(params.chat as string));
    } catch (error) {
      console.error("Error parsing chat data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (message: string) => {
    if (!chat?.id || !message.trim()) return;

    try {
      setSending(true);
      const response = await sendMessages(chat?.id, message);
      setChat(response);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const formatMessageTime = (timestamp: string) => {
    const messageDate = dayjs(timestamp);
    const now = dayjs();

    // If message is from today, show time
    if (messageDate.isSame(now, "day")) {
      return messageDate.format("hh:mm A");
    }

    // If message is from yesterday, show "Yesterday"
    if (messageDate.isSame(now.subtract(1, "day"), "day")) {
      return "Yesterday";
    }

    // If message is from this week, show day name
    if (messageDate.isAfter(now.subtract(7, "day"))) {
      return messageDate.format("ddd");
    }

    // Otherwise show date
    return messageDate.format("DD MMM");
  };

  const hasImage = carData?.images?.[0] !== undefined;

  return (
    <View style={styles.container}>
      {/* Header with car info */}
      <LinearGradient
        colors={[colorThemes.primary, colorThemes.accent2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colorThemes.textLight}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.carImageContainer}>
              {hasImage ? (
                <Image
                  source={{
                    uri: carData?.images?.[0],
                  }}
                  style={styles.carImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons
                    name="car"
                    size={24}
                    color={colorThemes.textLight}
                  />
                </View>
              )}
            </View>

            <View style={styles.carInfoContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.carTitle}
              >
                {carData.carBrand} {carData.carModel}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.carPrice}
              >
                ₹ {carData.exceptedPrice?.toLocaleString() || ""}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorThemes.primary} />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          >
            {!chat?.messages?.length ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={60}
                  color={colorThemes.greyLight}
                />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>
                  Start the conversation by sending a message
                </Text>
              </View>
            ) : (
              <>
                {/* Date separator at the top */}
                <View style={styles.dateSeparator}>
                  <Text style={styles.dateSeparatorText}>
                    {dayjs(
                      chat.messages[chat.messages.length - 1]?.timeStamp
                    ).format("MMM DD, YYYY")}
                  </Text>
                </View>

                {/* Messages */}
                {chat.messages
                  .slice()
                  .reverse()
                  .map((msg, idx) => {
                    const isUser = msg.sentBy === "user";
                    const showTimeSeparator =
                      idx > 0 &&
                      dayjs(msg.timeStamp).diff(
                        dayjs(
                          chat.messages[chat.messages.length - 1 - idx]
                            ?.timeStamp
                        ),
                        "hour"
                      ) > 1;

                    return (
                      <React.Fragment key={idx}>
                        {showTimeSeparator && (
                          <View style={styles.timeSeparator}>
                            <Text style={styles.timeSeparatorText}>
                              {dayjs(msg.timeStamp).format("MMM DD, hh:mm A")}
                            </Text>
                          </View>
                        )}

                        <View
                          style={[
                            styles.messageWrapper,
                            isUser
                              ? styles.userMessageWrapper
                              : styles.adminMessageWrapper,
                          ]}
                        >
                          {isUser ? (
                            <View style={styles.userMessage}>
                              <Text style={styles.messageText}>
                                {msg.message}
                              </Text>
                              <Text style={styles.messageTime}>
                                {formatMessageTime(msg.timeStamp)}
                              </Text>
                            </View>
                          ) : (
                            <LinearGradient
                              colors={["#FFFFFF", "#F8F8F8"]}
                              style={styles.adminMessage}
                            >
                              <Text style={styles.messageText}>
                                {msg.message}
                              </Text>
                              <Text style={styles.messageTime}>
                                {formatMessageTime(msg.timeStamp)}
                              </Text>
                            </LinearGradient>
                          )}
                        </View>
                      </React.Fragment>
                    );
                  })}
              </>
            )}
          </ScrollView>
        )}
      </View>

      {/* Message Input */}
      <ChatmessageKeyBoard sendMessageHook={sendMessage} sending={sending} />
    </View>
  );
};

export default index;

interface ChatMessageKeyboardProps {
  sendMessageHook: (message: string) => Promise<void>;
  sending?: boolean;
}

const ChatmessageKeyBoard = ({
  sendMessageHook,
  sending = false,
}: ChatMessageKeyboardProps) => {
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const messageToSend = message;
    setMessage(""); // Clear input immediately for better UX
    await sendMessageHook(messageToSend);

    // Focus the input after sending
    inputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colorThemes.textSecondary}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
            maxLength={500}
            editable={!sending}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim() || sending}
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colorThemes.textLight} />
            ) : (
              <Ionicons name="send" size={20} color={colorThemes.textLight} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorThemes.backgroundLight,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  carImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  carImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  carInfoContainer: {
    flex: 1,
  },
  carTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textLight,
    marginBottom: 2,
  },
  carPrice: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle2,
    lineHeight: typography.lineHeights.subtitle2,
    color: "rgba(255, 255, 255, 0.9)",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colorThemes.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textSecondary,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    color: colorThemes.textPrimary,
    textAlign: "center",
  },
  emptySubText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    color: colorThemes.textSecondary,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeSeparator: {
    alignItems: "center",
    marginVertical: 12,
  },
  timeSeparatorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.small,
    lineHeight: typography.lineHeights.small,
    color: colorThemes.textSecondary,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  messageWrapper: {
    maxWidth: "80%",
    marginVertical: 4,
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
  },
  adminMessageWrapper: {
    alignSelf: "flex-start",
  },
  userMessage: {
    backgroundColor: colorThemes.accent2,
    padding: 12,
    borderRadius: 16,
    borderTopRightRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  adminMessage: {
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textPrimary,
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "right",
    marginTop: 4,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: colorThemes.greyLight,
    backgroundColor: colorThemes.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colorThemes.backgroundLight,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: colorThemes.textPrimary,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorThemes.accent2, // Changed from primary (red) to accent2 (orange)
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colorThemes.greyLight,
    opacity: 0.7,
  },
});
