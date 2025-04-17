import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Avatar,
  Text,
  IconButton,
  Card,
} from "react-native-paper";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/app/context/userContext";
import { fetchCarsById } from "../Services/backendoperations";
import { useRouter } from "expo-router";
import colorThemes from "@/app/theme";

export default function Profile() {
  const [likedCars, setLikedCars] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchLikedCars = async (id: any) => {
      const likedCarsdata = await fetchCarsById(id);
      if (likedCarsdata) setLikedCars(likedCarsdata);
    };
    if (user) {
      console.log("Liked data: ", user.likedCars);
      fetchLikedCars(user.likedCars);
      // fetchLikedCars(["dgm7bgWpDSrD1wMnxRhL", "dgm7bgWpDSrD1wMnxRhL"]);
    }
  }, []);

  return likedCars.length === 0 ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <AntDesign name="heart" size={80} color="#e8e8e8" />
      <Text style={{ color: "#c9c9c9" }}>Your favroites goes here</Text>
    </View>
  ) : (
    <>
      <View style={{ paddingVertical: 10 }}>
        <Text style={{ textAlign: "center", fontWeight: 900, fontSize: 18 }}>
          My Favorites
        </Text>
      </View>
      <ScrollView>
        {likedCars.map((car, index) => (
          <Card
            key={index}
            style={styles.cardmargin}
            onPress={() => {
              router.push({
                pathname: "/components/BuyCarPage",
                params: {
                  data: JSON.stringify(car),
                },
              });
            }}
          >
            <Card.Cover
              source={{
                uri: "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg",
              }}
            />
            <Card.Content style={{ paddingVertical: 12 }}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>₹ {car.exceptedPrice}</Text>
                <Ionicons
                  name="heart"
                  size={28}
                  color={colorThemes.primary2}
                  style={{ paddingRight: 10 }}
                />
              </View>
              <Text style={{ fontSize: 12 }}>
                {car.modelYear} {car.carBrand} {car.carModel}
              </Text>
              <View style={styles.carDetailsContainer}>
                <View style={styles.carDetailBox}>
                  <Text style={styles.carDetailText}>{car.km} Km</Text>
                </View>
                <View style={styles.carDetailBox}>
                  <Text style={styles.carDetailText}>{car.fuelType}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  cardmargin: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    paddingVertical: 3,
    fontWeight: "700",
    fontSize: 17,
  },
  carDetailsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  carDetailBox: {
    padding: 5,
    backgroundColor: "#6C757D",
    borderRadius: 5,
    justifyContent: "center",
  },
  carDetailText: {
    fontSize: 12,
    color: "white",
    paddingHorizontal: 5,
  },
});
