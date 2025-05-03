import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { getMyChats } from "./chatServices";
import { useAuth } from "../context/userContext";
import colorThemes from "../theme";
import dayjs from "dayjs";
import SingleChatCard from "../(Home)/components/SingleChatCard";

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
  const [paginationData, setPaginationData] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    (async () => {
      //TODO: send in Pagination parameters also ...
      const { data, pagination } = await getMyChats(user.id);
      if (data) {
        setMyChats(data);
        // console.log(data);
      }
      if (pagination) {
        setPaginationData(pagination);
      }
    })();
  }, []);
  return (
    <View style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Chats</Text>
      </View>
      <View style={styles.chatsContainer}>
        {myChats.length === 0 ? (
          <Text>No chats found</Text>
        ) : (
          myChats.map((chat) => {
            return (
              <View
                key={chat.id}
                style={[
                  styles.singleChat,
                  {
                    boxShadow: !chat.readByUser
                      ? `2px 2px 5px 2px ${colorThemes.primary1}`
                      : "none",
                  },
                ]}
              >
                <SingleChatCard chat={chat} />
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  body: {
    height: "100%",
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colorThemes.primary1,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  chatsContainer: {
    padding: 20,
    backgroundColor: colorThemes.halfWhite,
    minHeight: "100%",
  },
  singleChat: {
    // elevation: 1,
    borderRadius: 10,
    backgroundColor: "white",
    maxWidth: "100%",
    padding: 10,
    marginBottom: 8,
  },
});
