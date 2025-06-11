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
  Animated,
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const animateLike = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
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
      if (!liked) animateLike();
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
    <View style={{ flex: 1, backgroundColor: colorThemes.backgroundLight }}>
      <Navbar />
      <ScrollView
        style={{ padding: 5 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel section */}
        <View
          style={{
            flex: 1,
            height: 280,
            marginBottom: 16,
            backgroundColor: "white",
            borderRadius: 18,
            shadowColor: colorThemes.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
            justifyContent: "center",
            alignItems: "center",
            width: Dimensions.get("screen").width - 16,
            alignSelf: "center",
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
            marginVertical: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 7,
          }}
        >
          {(car.images || []).map((_, index) => (
            <View
              key={index}
              style={{
                backgroundColor:
                  currentIndex === index
                    ? colorThemes.primary
                    : colorThemes.greyLight,
                borderRadius: 50,
                width: currentIndex === index ? 14 : 10,
                height: currentIndex === index ? 14 : 10,
                marginHorizontal: 2,
                borderWidth: currentIndex === index ? 2 : 0,
                borderColor: colorThemes.primaryLight,
                transitionDuration: "0.3s",
              }}
            />
          ))}
        </View>

        {/* Car details card */}
        <LinearGradient
          colors={colorThemes.gradientPrimary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 18,
            marginVertical: 8,
            marginHorizontal: 10,
            padding: 18,
            shadowColor: colorThemes.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text style={[styles.price, { color: colorThemes.textLight }]}>
            ₹ {car.exceptedPrice}
          </Text>
          <Text style={[styles.model, { color: colorThemes.textLight }]}>
            {car.carModel}
          </Text>
          <Text style={[styles.year, { color: colorThemes.textLight }]}>
            {car.modelYear}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              padding: 12,
              marginTop: 18,
              alignItems: "center",
              borderTopWidth: 0.21,
              borderTopColor: colorThemes.greyLight,
            }}
          >
            {/* Fuel Type */}
            <View style={styles.specBlock}>
              <Ionicons
                name="funnel-outline"
                size={22}
                color={colorThemes.textLight}
              />
              <Text style={[styles.specText, { color: colorThemes.textLight }]}>
                {car.fuelType}
              </Text>
            </View>

            {/* Mileage */}
            <View style={styles.specBlock}>
              <Ionicons
                name="speedometer-outline"
                size={22}
                color={colorThemes.textLight}
              />
              <Text style={[styles.specText, { color: colorThemes.textLight }]}>
                {(car.km / 1000).toFixed(0)}k km
              </Text>
            </View>

            {/* Gear Type */}
            <View style={styles.specBlock}>
              <EvilIcons
                name="gear"
                size={22}
                color={colorThemes.textLight}
              />
              <Text style={[styles.specText, { color: colorThemes.textLight }]}>
                {car.transmissionType}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Overview */}
        <View
          style={[
            styles.sectionContainer,
            {
              borderRadius: 18,
              marginTop: 10,
              shadowColor: colorThemes.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
        >
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

            {/* Owner */}
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
        <View
          style={[
            styles.sectionContainer,
            {
              borderRadius: 18,
              marginTop: 10,
              shadowColor: colorThemes.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
        >
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
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colorThemes.backgroundLight,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            shadowColor: colorThemes.primary,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleInterested}
          style={[
            styles.chatButton,
            { borderRadius: 18, overflow: "hidden", marginRight: 8 },
          ]}
        >
          <LinearGradient
            colors={[colorThemes.primary, colorThemes.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.chatGradient, { borderRadius: 18 }]}
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
          <TouchableOpacity
            onPress={toggleLikedCars}
            style={{
              borderRadius: 50,
              backgroundColor: liked
                ? colorThemes.primaryLight
                : colorThemes.background,
              padding: 6,
              shadowColor: colorThemes.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: liked ? 0.18 : 0.08,
              shadowRadius: 8,
              elevation: liked ? 6 : 2,
              // transitionDuration: "0.3s",
            }}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={32}
                color={liked ? colorThemes.primary : colorThemes.primaryDark}
                style={{ paddingRight: 0 }}
              />
            </Animated.View>
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
    fontFamily: typography.fonts.bodyBold,
  },
  overviewBlocks: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  price: {
    fontFamily: typography.fonts.heading,
    fontWeight: "bold", // Back to normal bold
    fontSize: typography.sizes.h2, // Slightly smaller
    lineHeight: typography.lineHeights.h2,
    color: colorThemes.textPrimary,
    letterSpacing: 0.5, // Subtle spacing
    textShadowColor: colorThemes.primaryDark, // Keep subtle shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  model: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: "bold",
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textSecondary,
    marginVertical: 4,
  },
  year: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: "bold",
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
    fontFamily: typography.fonts.bodyBold,
    fontWeight: "bold",
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
    fontWeight: "bold",
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textPrimary,
  },
  overviewText: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: "bold",
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
  },
  descriptionText: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: "bold",
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textPrimary,
  },
  contactText: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
