import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import colorThemes, { DEVAPI } from "@/app/theme";
import { fetchCarsById } from "../Services/backendoperations";
import { Image } from "expo-image";
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

  return (
    <TouchableOpacity onPress={openChat}>
      <View style={styles.container}>
        <View>
          <Image
            source={{
              uri: carData?.images?.[0] || "https://via.placeholder.com/70",
            }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 10,
              marginRight: 4,
              backgroundColor: "#e0e0e0",
            }}
            resizeMode="cover"
          />
        </View>
        <View style={styles.contentPart}>
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: chat.readByUser ? colorThemes.grey : "black",
              }}
            >
              {carData.carBrand} - {carData.carModel}
            </Text>
          </View>
          {/*  MESSAGE PART [>_] */}
          <View style={styles.latestText}>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              style={[
                styles.messageText,
                {
                  color: chat.readByUser
                    ? colorThemes.grey
                    : colorThemes.primary1,
                },
              ]}
            >
              {chat.messages[0]?.message + "sad saas d asd asd asd asd " ||
                "No messages yet"}
            </Text>
            <Text
              style={[
                styles.messageTime,
                {
                  color: chat.readByAdmin
                    ? colorThemes.grey
                    : colorThemes.primary1,
                },
              ]}
            >
              {dayjs(chat.lastMessageAt).format("DD MMM")}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SingleChatCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    minHeight: 60,
  },
  latestText: {
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    flex: 1,
    alignItems: "center",
    gap: 10,
  },

  messageText: {
    flex: 1,
    fontSize: 12,
  },
  messageTime: {
    // flexShrink: 0,
    fontSize: 12,
    color: colorThemes.grey,
    // alignSelf: "flex-end",
  },
  contentPart: {
    flex: 1,
    padding: 5,
    justifyContent: "space-between",
  },
});
