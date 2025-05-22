import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Pressable,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import SellCarsImageCard from "./SellCarsImageCard";
import Navbar from "./Navbar";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/context/userContext";
import { updateUserData } from "../Services/backendoperations";
import colorThemes, { typography } from "@/app/theme";
import { startChat } from "@/app/Chats/chatServices";
import { LinearGradient } from "expo-linear-gradient";

type Car = {
  carBrand: string;
  carModel: string;
  carStatus: string;
  exceptedPrice: number;
  fuelType: string;
  id: string;
  images: string[];
  km: number;
  location: string;
  modelYear: string;
  ownerName: string;
  ownerNumber: string;
  phoneNumber: string;
  postedBy: string;
  postedDate: string;
  registrationNumber: string;
  transmissionType: string;
  description: string;
};

interface Styles {
  container: ViewStyle;
  greytext: TextStyle;
  overviewBlocks: ViewStyle;
  price: TextStyle;
  model: TextStyle;
  year: TextStyle;
  specBlock: ViewStyle;
  specText: TextStyle;
  sectionContainer: ViewStyle;
  sectionHeader: ViewStyle;
  sectionTitle: TextStyle;
  overviewText: TextStyle;
  descriptionText: TextStyle;
  contactText: TextStyle;
  bottomBar: ViewStyle;
  chatButton: ViewStyle;
  chatGradient: ViewStyle;
  chatContent: ViewStyle;
  chatIcon: ViewStyle;
  chatText: TextStyle;
  likeButtonContainer: ViewStyle;
}

export default function BuyCarPage() {
  const params = useLocalSearchParams();
  const [liked, setLiked] = useState<boolean>(false);
  const { user, forceSetUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const car: Car | null = params.data
    ? JSON.parse(params.data as string)
    : null;

  useEffect(() => {
    if (car && user) {
      const isLiked = user?.likedCars?.some((likedCar) => likedCar === car.id);
      setLiked(isLiked);
    }
  }, []);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / Dimensions.get("screen").width
    );
    setCurrentIndex(index);
  };

  const toggleLikedCars = async () => {
    if (!user || !car) return;
    setLiked((liked) => {
      let userData = user;
      const updatedLikedList = liked
        ? user?.likedCars.filter((carId) => carId !== car.id)
        : [...(user.likedCars || []), car.id];
      userData.likedCars = updatedLikedList;
      const updateBackend = async () => {
        const updatedData = await updateUserData(userData);
        forceSetUser();
      };

      updateBackend();
      return !liked;
    });
  };

  const handleInterested = async () => {
    if (!car) {
      console.error("No car data available");
      return;
    }

    if (!user) {
      console.error("No user data available");
      return;
    }

    // Ensure we have a valid user ID
    if (!user.id || typeof user.id !== "string") {
      console.error("Invalid user ID:", user.id);
      return;
    }

    console.log("Starting chat for car:", car.id, "user:", user.id);

    try {
      // Force refresh user data from AsyncStorage to ensure we have the latest
      forceSetUser();

      const chat = await startChat(car.id, user.id);
      console.log("Chat created:", chat);

      if (chat) {
        router.push({
          // will work, dont add index, it will break ...
          pathname: "/Chats/Conversation",
          params: {
            chat: JSON.stringify(chat),
            carData: JSON.stringify(car),
          },
        });
      } else {
        console.error("Failed to create chat");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  if (!car) {
    return (
      <View style={styles.container}>
        <Text>Car details not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ScrollView
        style={{ padding: 5, backgroundColor: colorThemes.backgroundLight }}
      >
        {/* Image Carousel section */}
        <View
          style={{
            flex: 1,
            height: 280,
            marginBottom: 10,
            backgroundColor: "white",
            elevation: 0.2,
            justifyContent: "center",
            alignItems: "center",
            width: Dimensions.get("screen").width,
          }}
        >
          <FlatList
            data={car.images || []}
            renderItem={({ item, index }) => (
              <SellCarsImageCard index={index} item={{ URI: item }} />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={flatListRef}
            onScroll={onScroll}
          />
        </View>

        {/* Pagination dots */}
        <View
          style={{
            marginVertical: 5,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
        >
          {(car.images || []).map((_, index) => (
            <View
              key={index}
              style={[
                {
                  backgroundColor: "grey",
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
          ))}
        </View>

        {/* Car details */}
        <View
          style={{
            backgroundColor: colorThemes.background,
            marginVertical: 4,
            marginHorizontal: 10,
            elevation: 0.2,
            padding: 10,
            borderRadius: 7,
          }}
        >
          <Text style={[styles.price]}>₹ {car.exceptedPrice}</Text>
          <Text style={[styles.model]}>{car.carModel}</Text>

          <Text style={[styles.year]}>{car.modelYear}</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              padding: 12,
              marginTop: 18,
              alignItems: "center",
              margin: "auto",
              borderTopWidth: 0.21,
              borderTopColor: colorThemes.greyLight,
            }}
          >
            {/* Fuel Type */}
            <View style={styles.specBlock}>
              <Ionicons
                name="funnel-outline"
                size={22}
                color={colorThemes.textSecondary}
              />
              <Text style={styles.specText}>{car.fuelType}</Text>
            </View>

            {/* Mileage */}
            <View style={styles.specBlock}>
              <Ionicons
                name="speedometer-outline"
                size={22}
                color={colorThemes.textSecondary}
              />
              <Text style={styles.specText}>
                {(car.km / 1000).toFixed(0)}k km
              </Text>
            </View>

            {/* Gear Type */}
            <View style={styles.specBlock}>
              <EvilIcons
                name="gear"
                size={22}
                color={colorThemes.textSecondary}
              />
              <Text style={styles.specText}>{car.transmissionType}</Text>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>

          <View style={{ padding: 10, gap: 10 }}>
            {/* Date */}
            <View style={styles.overviewBlocks}>
              <EvilIcons
                name="calendar"
                size={28}
                color={colorThemes.textSecondary}
                style={{ marginTop: -4 }}
              />
              <Text style={styles.overviewText}>
                Date - {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/*  Owner */}
            <View style={[styles.overviewBlocks, { gap: 4, marginStart: 5 }]}>
              <Feather
                name="users"
                size={22}
                color={colorThemes.textSecondary}
              />
              <Text style={styles.overviewText}>Owner - {car.ownerNumber}</Text>
            </View>

            {/* Location */}
            <View style={styles.overviewBlocks}>
              <Ionicons
                name="location-outline"
                size={28}
                style={{ marginTop: -4 }}
                color={colorThemes.textSecondary}
              />
              <Text style={styles.overviewText}>{car.location}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
          </View>

          <View style={{ padding: 10, gap: 10 }}>
            <Text style={styles.descriptionText}>{car.description}</Text>
            <Text style={styles.contactText}>Contact for more information</Text>
          </View>
        </View>
      </ScrollView>

      {/* Interested Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleInterested} style={styles.chatButton}>
          <LinearGradient
            colors={[colorThemes.primary, colorThemes.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatGradient}
          >
            <View style={styles.chatContent}>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color={colorThemes.textLight}
                style={styles.chatIcon}
              />
              <Text style={styles.chatText}>Chat With Us</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.likeButtonContainer}>
          <TouchableOpacity onPress={toggleLikedCars}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={40}
              color={colorThemes.primary}
              style={{ paddingRight: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  greytext: {
    color: colorThemes.textSecondary,
  },
  overviewBlocks: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  price: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    color: colorThemes.textPrimary,
  },
  model: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textSecondary,
    marginVertical: 4,
  },
  year: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
  },
  specBlock: {
    alignItems: "center",
    flex: 1,
    gap: 5,
  },
  specText: {
    color: colorThemes.textSecondary,
    minWidth: 60,
    textAlign: "center",
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
  },
  sectionContainer: {
    backgroundColor: colorThemes.background,
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 7,
    elevation: 1,
  },
  sectionHeader: {
    padding: 10,
    borderBottomWidth: 0.21,
    borderColor: colorThemes.greyLight,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textPrimary,
  },
  overviewText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
  },
  descriptionText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textPrimary,
  },
  contactText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.primary,
  },
  bottomBar: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 64,
    flexDirection: "row",
    backgroundColor: colorThemes.background,
    borderTopWidth: 1,
    borderTopColor: colorThemes.backgroundDark,
  },
  chatButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chatGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatIcon: {
    marginRight: 8,
  },
  chatText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  likeButtonContainer: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
});
