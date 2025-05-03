import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import { Image } from "expo-image";
import colorThemes from "@/app/theme";
import dayjs from "dayjs";
import { sendMessages } from "../chatServices";
import FontAwesome from "@expo/vector-icons/FontAwesome";
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
  let scrollViewRef: ScrollView | null = null;
  const [chat, setChat] = useState<Chat>();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState<string>("");

  const carData: any = JSON.parse(params.carData as string);

  useEffect(() => {
    setChat(JSON.parse(params.chat as string));
  }, []);

  const sendMessage = async (message: string) => {
    if (!chat?.id) return;
    if (message.trim()) {
      const response = await sendMessages(chat?.id, message);
      console.log("Message sent:", message);
      setChat(response);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorThemes.halfWhite,
        justifyContent: "space-between",
      }}
    >
      {/* header , contains car info */}
      <View
        style={{
          padding: 12,
          flexDirection: "row",
          backgroundColor: colorThemes.primary1,
          alignContent: "center",
          gap: 10,
        }}
      >
        <View>
          <Image
            source={{
              uri: carData?.images?.[0] || "https://via.placeholder.com/70",
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 10,
              marginRight: 4,
              backgroundColor: "#e0e0e0",
            }}
            resizeMode="cover"
          />
        </View>
        <View style={{ alignSelf: "center" }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "white",
            }}
          >
            {carData.carBrand} {carData.carModel}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "white",
            }}
          >
            ₹ {carData.exceptedPrice}
          </Text>
        </View>
      </View>
      {/* Chat Tree */}
      <View style={{ flex: 1, padding: 12 }}>
        <ScrollView
          ref={(ref) => {
            scrollViewRef = ref;
          }}
          onContentSizeChange={() => {
            scrollViewRef?.scrollToEnd();
          }}
        >
          {chat?.messages
            .slice()
            .reverse()
            .map((msg, idx) => {
              const isUser = msg.sentBy === "user";

              return (
                <View
                  key={idx}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    backgroundColor: isUser ? "#DCF8C6" : "#fff",
                    padding: 10,
                    borderRadius: 10,
                    marginVertical: 4,
                    borderTopLeftRadius: isUser ? 10 : 0,
                    borderTopRightRadius: isUser ? 0 : 10,
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#333" }}>
                    {msg.message}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#888",
                      textAlign: "right",
                      marginTop: 4,
                    }}
                  >
                    {dayjs(msg.timeStamp).format("hh:mm A")}
                  </Text>
                </View>
              );
            })}
        </ScrollView>
      </View>
      {/* KeyBoard */}
      <ChatmessageKeyBoard sendMessageHook={sendMessage} />
    </View>
  );
};

export default index;

const ChatmessageKeyBoard = ({ sendMessageHook }: any) => {
  const [message, setMessage] = useState<string>("");
  const handleSend = async () => {
    //
    if (message.trim()) {
      sendMessageHook(message);
      setMessage("");
    }
    // }
  };
  return (
    <KeyboardAvoidingView
      // style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
      <View style={{ justifyContent: "flex-end" }}>
        {/* TextInput for message */}
        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            placeholder="Type a message..."
            returnKeyType="send"
            onSubmitEditing={handleSend} // Sending message on return key press
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              padding: 10,
              backgroundColor: colorThemes.primary1,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            marginStart: -5,
            <FontAwesome
              name="send"
              size={20}
              color={colorThemes.halfWhite}
              style={{
                marginStart: -2,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f7f7f7",
    justifyContent: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
});
