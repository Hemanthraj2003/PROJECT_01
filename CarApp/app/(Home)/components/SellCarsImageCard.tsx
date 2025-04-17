import { View, Text, Dimensions, StyleSheet } from "react-native";
import React from "react";
import { Image } from "expo-image";

type props = {
  item: { Title: string };
  index: number;
};

const { width } = Dimensions.get("screen");

export default function SellCarsImageCard({ item, index }: props) {
  return (
    <View style={styles.imageContainer}>
      <Image
        source={{
          uri: "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg",
        }}
        contentFit="contain"
        transition={1000}
        style={{
          flex: 1,
          width: "100%",
          //   height: 0,
          borderWidth: 0.1,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
