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
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Ionicons, Feather } from "@expo/vector-icons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import SellCarsImageCard from "./SellCarsImageCard";
import Navbar from "./Navbar";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/app/context/userContext";
import { updateUserData } from "../Services/backendoperations";
import colorThemes from "@/app/theme";

type Car = {
  carBrand: string;
  carModel: string;
  carStatus: string;
  exceptedPrice: number; // assuming it might be a string in the input
  fuelType: string;
  id: string;
  images: string[]; // Array of image URLs or file names
  km: number; // Assuming mileage is passed as a string
  location: string;
  modelYear: string;
  ownerName: string;
  phoneNumber: string;
  postedBy: string;
  postedDate: string;
  registrationNumber: string;
  transmissionType: string;
  description: string;
};

export default function BuyCarPage() {
  const params = useLocalSearchParams();
  const [liked, setLiked] = useState<boolean>(false);
  const { user, forceSetUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const car: Car =
    typeof params.data === "string" ? JSON.parse(params.data) : null;
  // console.log(car);
  useEffect(() => {
    if (car && user) {
      const isLiked = user?.likedCars?.some((likedCar) => likedCar === car.id);
      // console.log(user.likedCars, car.id);

      setLiked(isLiked);
    }
  }, []);

  // event handler for the carousel scroll
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / Dimensions.get("screen").width
    );
    setCurrentIndex(index);
  };

  const toggleLikedCars = async () => {
    // needs loading
    if (!user || !car) return;
    setLiked((liked) => {
      let userData = user;
      const updatedLikedList = liked
        ? user?.likedCars.filter((carId) => carId !== car.id)
        : [...user.likedCars, car.id];
      userData.likedCars = updatedLikedList;
      const updateBackend = async () => {
        const updatedData = await updateUserData(userData);
        forceSetUser();
      };

      updateBackend();
      console.log(user);

      return !liked;
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ScrollView style={{ padding: 5, backgroundColor: "#f5f5f5" }}>
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
            data={car.images} // Use car images here
            renderItem={({ item, index }) => {
              return <SellCarsImageCard index={index} item={{ Title: item }} />;
            }}
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
          {car.images.map((_, index) => {
            return (
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
            );
          })}
        </View>

        {/* Car details */}
        <View
          style={{
            backgroundColor: "white",
            marginVertical: 4,
            marginHorizontal: 10,
            elevation: 0.2,
            padding: 10,
            borderRadius: 7,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 700 }}>
            ₹ {car.exceptedPrice}
          </Text>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 30,
              fontWeight: 500,
              color: "#5c5c5c",
            }}
          >
            {car.carModel}
          </Text>

          <Text style={{ color: "#5c5c5c" }}>{car.modelYear}</Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              padding: 12,
              marginTop: 18,
              alignItems: "center",
              margin: "auto",
              borderTopWidth: 0.21,
              borderTopColor: "#5c5c5c",
            }}
          >
            {/* Fuel Type */}
            <View style={{ alignItems: "center", flex: 1, gap: 5 }}>
              <Ionicons name="funnel-outline" size={22} color={"#5c5c5c"} />
              <Text
                style={{
                  color: "#5c5c5c",
                  // marginLeft: 5,
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {car.fuelType}
              </Text>
            </View>

            {/* Mileage */}
            <View style={{ alignItems: "center", flex: 1, gap: 5 }}>
              <Ionicons name="speedometer-outline" size={22} />
              <Text
                style={{
                  color: "#5c5c5c",
                  // marginLeft: 5,
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {(car.km / 1000).toFixed(0)}k km
              </Text>
            </View>

            {/* Gear Type */}
            <View style={{ alignItems: "center", flex: 1, gap: 5 }}>
              <EvilIcons name="gear" size={22} color="black" />
              <Text
                style={{
                  color: "#5c5c5c",
                  // marginLeft: 5,
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                {car.transmissionType}
              </Text>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View
          style={{
            backgroundColor: "white",
            marginHorizontal: 10,
            marginVertical: 15,
            borderRadius: 7,
            elevation: 1,
          }}
        >
          <View
            style={{
              padding: 10,
              borderBottomWidth: 0.21,
              borderColor: "#5c5c5c",
            }}
          >
            <Text style={{ fontWeight: 600, color: "#5c5c5c", fontSize: 18 }}>
              Overview
            </Text>
          </View>

          <View style={{ padding: 10, gap: 10 }}>
            {/* Date */}
            <View style={styles.overviewBlocks}>
              <EvilIcons
                name="calendar"
                size={28}
                color="#5c5c5c"
                style={{ marginTop: -4 }}
              />
              <Text style={[styles.greytext, { fontSize: 14 }]}>
                Date - {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/*  Owner */}
            <View style={[styles.overviewBlocks, { gap: 4, marginStart: 5 }]}>
              <Feather name="users" size={22} color="#5c5c5c" />
              <Text style={[styles.greytext, { fontSize: 14 }]}>
                Owner - {car.ownerName}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.overviewBlocks}>
              <Ionicons
                name="location-outline"
                size={28}
                style={{ marginTop: -4 }}
                color="#5c5c5c"
              />
              <Text style={[styles.greytext]}>{car.location}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View
          style={{
            backgroundColor: "white",
            marginHorizontal: 10,
            marginVertical: 15,
            borderRadius: 7,
            elevation: 1,
          }}
        >
          <View
            style={{
              padding: 10,
              borderBottomWidth: 0.21,
              borderColor: "#5c5c5c",
            }}
          >
            <Text style={{ fontWeight: 600, color: "#5c5c5c", fontSize: 18 }}>
              Description
            </Text>
          </View>

          <View style={{ padding: 10, gap: 10 }}>
            {/* Description */}
            <Text>{car.description}</Text>
            <Text style={{ color: "blue" }}>Contact for more information</Text>
          </View>
        </View>
      </ScrollView>

      {/* Interested Button */}
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 15,
          height: 64,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            backgroundColor: colorThemes.primary2,
            flex: 1,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20, color: "white" }}>Call</Text>
        </View>
        <View
          style={{ width: 70, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity onPress={toggleLikedCars}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={40}
              color={colorThemes.primary2}
              style={{ paddingRight: 10 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greytext: {
    color: "#5c5c5c",
  },

  overviewBlocks: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
});
