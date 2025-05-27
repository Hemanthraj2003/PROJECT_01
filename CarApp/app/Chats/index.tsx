import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { getMyChats } from "./chatServices";
import { useAuth } from "../context/userContext";
import colorThemes from "../theme";
import dayjs from "dayjs";
import SingleChatCard from "../(Home)/components/SingleChatCard";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { typography } from "@/app/theme";
import { useNotification } from "@/app/context/notificationContext";
import NetInfo from "@react-native-community/netinfo";
import { useServerError } from "../_layout";

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

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const index = () => {
  const [myChats, setMyChats] = useState<Chat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const reconnectTimer = useRef<NodeJS.Timeout>();

  const { user } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { setServerError } = useServerError();

  // Add retry mechanism for failed operations
  const retryOperation = async (operation: () => Promise<void>) => {
    try {
      await operation();
      setRetryCount(0);
      setError(null);
    } catch (error) {
      console.error("Operation failed:", error);
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setRetryCount((prev) => prev + 1);
        reconnectTimer.current = setTimeout(
          () => retryOperation(operation),
          RETRY_DELAY * (retryCount + 1)
        );
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Operation failed";
        setError(errorMessage);
        showNotification(errorMessage, "error");
      }
    }
  };

  // Enhanced network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = isOffline;
      setIsOffline(!state.isConnected);

      if (!state.isConnected && !wasOffline) {
        showNotification(
          "You are offline. Chat updates will resume when you're back online.",
          "warning"
        );
      } else if (state.isConnected && wasOffline) {
        showNotification("You are back online! Refreshing chats...", "success");
        // Reset retry counter when back online
        setRetryCount(0);
        handleRetry();
      }
    });

    return () => {
      unsubscribe();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [isOffline]);

  // Enhanced fetch chats with validation and error handling
  const fetchChats = async (page = 1, reset = false) => {
    if (!user?.id || typeof user.id !== "string") {
      setError("Session expired. Please log in again.");
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (isOffline) {
      setError("No internet connection. Please check your network.");
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const { data, pagination } = await getMyChats(user.id, page, 10);

      if (data) {
        if (reset || page === 1) {
          setMyChats(data);
        } else {
          setMyChats((prev) => [...prev, ...data]);
        }
      }

      if (pagination) {
        setHasMore(pagination.hasMore || false);
        setCurrentPage(page + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      if (error instanceof Error && error.message === "SERVER_ERROR") {
        setServerError(true);
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load chats. Please try again.";

        setError(errorMessage);
        showNotification(errorMessage, "error");

        if (!isOffline) {
          retryOperation(() => fetchChats(page, reset));
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Initialize chats with enhanced error handling
  useEffect(() => {
    const initChats = async () => {
      if (!user?.id) {
        console.warn("User not available yet");
        setLoading(false);
        setError("Please log in to view your chats");
        return;
      }

      try {
        await fetchChats(1, true);
      } catch (error) {
        console.error("Error initializing chats:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load chats. Please try again.";
        setError(errorMessage);
        showNotification(errorMessage, "error");
      }
    };

    initChats();
  }, [user]);

  // Enhanced retry handler
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    fetchChats(1, true);
  };

  // Enhanced refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    setRetryCount(0);
    fetchChats(1, true);
  };

  const getUnreadCount = () => {
    return myChats.filter((chat) => !chat.readByUser).length;
  };

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons
        name="alert-circle-outline"
        size={60}
        color={colorThemes.greyLight}
      />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRetry}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colorThemes.primary, colorThemes.accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.retryGradient}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.body}>
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
            <Text style={styles.headerText}>My Chats</Text>
            {getUnreadCount() > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{getUnreadCount()}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.chatsContainer,
          (!myChats.length || error) && styles.centerContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colorThemes.primary]}
            tintColor={colorThemes.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorThemes.primary} />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : error ? (
          renderError()
        ) : myChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={60}
              color={colorThemes.greyLight}
            />
            <Text style={styles.emptyText}>No chats found</Text>
            <Text style={styles.emptySubText}>
              Your conversations will appear here
            </Text>
          </View>
        ) : (
          <>
            {myChats.map((chat) => {
              const isUnread = !chat.readByUser;
              return (
                <View
                  key={chat.id}
                  style={[styles.singleChat, isUnread && styles.unreadChat]}
                >
                  {isUnread && <View style={styles.unreadIndicator} />}
                  <SingleChatCard chat={chat} />
                </View>
              );
            })}{" "}
            {/* Load More Button */}
            {hasMore && !error && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={async () => {
                  if (isOffline) {
                    showNotification("Cannot load more while offline", "error");
                    return;
                  }
                  try {
                    await fetchChats(currentPage);
                  } catch (error) {
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : "Failed to load more chats";
                    showNotification(errorMessage, "error");
                  }
                }}
                disabled={loadingMore}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colorThemes.primary, colorThemes.accent2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loadMoreGradient}
                >
                  {loadingMore ? (
                    <ActivityIndicator
                      size="small"
                      color={colorThemes.textLight}
                    />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More Chats</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  body: {
    height: "100%",
    flex: 1,
    backgroundColor: colorThemes.backgroundLight,
  },
  header: {
    paddingVertical: 16,
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
    justifyContent: "space-between",
  },
  headerText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.tight,
  },
  badgeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: colorThemes.textLight,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  chatsContainer: {
    padding: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colorThemes.textSecondary,
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
  },
  emptySubText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textSecondary,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    width: "60%",
    maxWidth: 200,
  },
  retryGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  singleChat: {
    borderRadius: 12,
    backgroundColor: colorThemes.background,
    maxWidth: "100%",
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
  },
  unreadChat: {
    borderLeftWidth: 4,
    borderLeftColor: colorThemes.primary,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 3,
    shadowOpacity: 0.15,
  },
  unreadIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colorThemes.primary,
  },
  loadMoreButton: {
    marginVertical: 20,
    marginHorizontal: 40,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loadMoreGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.wide,
  },
});
