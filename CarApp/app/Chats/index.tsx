import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getMyChats } from "./chatServices";
import { useAuth } from "../context/userContext";
import colorThemes from "../theme";
import dayjs from "dayjs";
import SingleChatCard from "../(Home)/components/SingleChatCard";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

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
  const [myChats, setMyChats] = useState<Chat[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 10;

  const { user } = useAuth();
  const router = useRouter();

  const fetchChats = async (page = 1, reset = false) => {
    if (!user) {
      console.error("No user available in context. Cannot fetch chats.");
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    console.log("Fetching chats for user:", user.id);

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Ensure user.id is valid
      if (!user.id || typeof user.id !== "string") {
        console.error("Invalid user ID:", user.id);
        throw new Error("Invalid user ID");
      }

      const { data, pagination } = await getMyChats(user.id, page, pageSize);

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
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Only fetch chats if user is available
    if (user) {
      console.log("User is available, fetching chats for user ID:", user.id);

      // Validate user ID before fetching
      if (!user.id || typeof user.id !== "string") {
        console.error("Invalid user ID:", user.id);
        setLoading(false);
        return;
      }

      fetchChats(1, true);
    } else {
      console.log("User not available yet, waiting...");
      setLoading(false);
    }
  }, [user]); // Re-run when user changes

  const getUnreadCount = () => {
    return myChats.filter((chat) => !chat.readByUser).length;
  };

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
        contentContainerStyle={styles.chatsContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colorThemes.primary} />
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
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
            })}

            {/* Load More Button */}
            {hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => fetchChats(currentPage)}
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
    color: colorThemes.textLight,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.5,
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
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colorThemes.textPrimary,
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: colorThemes.textSecondary,
    textAlign: "center",
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
    color: colorThemes.textLight,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
