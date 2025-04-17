import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colorThemes from "@/app/theme";

type props = {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
};

type cardProps = {
  image: string;
  deleteImage: () => void;
};

function DeleteImageCard({ image, deleteImage }: cardProps) {
  return (
    <>
      <TouchableOpacity style={styles.deleteButton} onPress={deleteImage}>
        <MaterialIcons name="delete-outline" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        {/* <Text>hello</Text> */}
        <Image
          source={{
            uri: image,
          }}
          contentFit="contain"
          transition={1000}
          style={{ flex: 1, width: 300, height: 150 }}
        />
      </View>
    </>
  );
}

export default function DeleteableCarousol({ images, setImages }: props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / 300);
    setCurrentIndex(index);
  };

  const handleDelete = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <View
      style={{
        height: 250,
        width: 300,
        marginVertical: 10,
      }}
    >
      <FlatList
        data={images}
        renderItem={({ item, index }) => {
          return (
            <DeleteImageCard
              image={item}
              deleteImage={() => handleDelete(index)}
            />
          );
        }}
        horizontal
        pagingEnabled
        // snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        decelerationRate="normal" // Slows down the scrolling effect
        scrollEventThrottle={16}
        onScroll={onScroll}
      />
      <View
        style={{
          marginVertical: 5,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
        }}
      >
        {images.map((_, index) => {
          return (
            <View
              key={index}
              style={[
                {
                  backgroundColor: colorThemes.grey,
                  borderRadius: "50%",
                  width: 10,
                  height: 10,
                },
                currentIndex === index && {
                  backgroundColor: colorThemes.primary2,
                  width: 12,
                  height: 12,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: 300,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: 20,
    elevation: 1,
    right: 20,
    backgroundColor: colorThemes.primary2,
    zIndex: 100,
    padding: 8,
    borderRadius: 10,
  },
});
