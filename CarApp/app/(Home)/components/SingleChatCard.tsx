import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import colorThemes, { DEVAPI } from "@/app/theme";
import { fetchCarsById } from "../Services/backendoperations";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

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

type chatProps = {
  chat: Chat;
};

const SingleChatCard = ({ chat }: chatProps) => {
  const [carData, setCarData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    console.log("Hello");

    (async () => {
      const response = await fetchCarsById([chat.carId]);
      if (response) {
        setCarData(response[0]);
      }
    })();
  }, []);

  const openChat = () => {
    router.push({
      // will work, dont add index, it will break ...
      pathname: "/Chats/Conversation",
      params: {
        chat: JSON.stringify(chat),
        carData: JSON.stringify(carData),
      },
    });
  };

  const isUnread = !chat.readByUser;
  const lastMessage = chat.messages[0]?.message || "No messages yet";
  const lastMessageTime = dayjs(chat.lastMessageAt).format("DD MMM");
  const hasImage = carData?.images?.[0] !== undefined;

  return (
    <TouchableOpacity
      onPress={openChat}
      style={styles.touchable}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{
                uri: carData?.images?.[0],
              }}
              style={styles.carImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[colorThemes.accent2, colorThemes.accent1]}
              style={styles.placeholderContainer}
            >
              <Ionicons name="car" size={28} color={colorThemes.textLight} />
            </LinearGradient>
          )}
        </View>

        <View style={styles.contentPart}>
          <View style={styles.headerRow}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.carTitle, isUnread && styles.unreadText]}
            >
              {carData.carBrand} {carData.carModel}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>
                ₹
                {carData.exceptedPrice
                  ? carData.exceptedPrice.toLocaleString()
                  : ""}
              </Text>
            </View>
          </View>

          <View style={styles.latestText}>
            <View style={styles.messageContainer}>
              {isUnread && <View style={styles.messageDot} />}
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={[styles.messageText, isUnread && styles.unreadText]}
              >
                {lastMessage}
              </Text>
            </View>

            <Text style={[styles.messageTime, isUnread && styles.unreadText]}>
              {lastMessageTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SingleChatCard;

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 12,
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 80,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  carImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colorThemes.backgroundDark,
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  contentPart: {
    flex: 1,
    paddingVertical: 6,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colorThemes.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    backgroundColor: colorThemes.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "600",
    color: colorThemes.primary,
  },
  latestText: {
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  messageContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  messageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colorThemes.primary,
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    color: colorThemes.textSecondary,
  },
  messageTime: {
    fontSize: 12,
    color: colorThemes.grey,
  },
  unreadText: {
    color: colorThemes.primary,
    fontWeight: "500",
  },
});
