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
    <View style={styles.emptyContainer}>
      <AntDesign name="heart" size={80} color={colorThemes.backgroundDark} />
      <Text style={styles.emptyText}>Your favorites go here</Text>
    </View>
  ) : (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>My Favorites</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
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
                uri:
                  car.images?.[0] ||
                  "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg",
              }}
            />
            <Card.Content style={styles.cardContent}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>₹ {car.exceptedPrice}</Text>
                <Ionicons
                  name="heart"
                  size={28}
                  color={colorThemes.primary}
                  style={styles.heartIcon}
                />
              </View>
              <Text style={styles.carTitle}>
                {car.modelYear} {car.carBrand} {car.carModel}
              </Text>
              <View style={styles.carDetailsContainer}>
                <View style={styles.carDetailBox}>
                  <Text style={styles.carDetailText}>{car.km} Km</Text>
                </View>
                <View style={styles.carDetailBox}>
                  <Text style={styles.carDetailText}>{car.fuelType}</Text>
                </View>
                {car.transmissionType && (
                  <View style={styles.carDetailBox}>
                    <Text style={styles.carDetailText}>
                      {car.transmissionType}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: colorThemes.backgroundLight,
  },
  emptyText: {
    color: colorThemes.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  headerContainer: {
    paddingVertical: 14,
    backgroundColor: colorThemes.background,
    borderBottomWidth: 1,
    borderBottomColor: colorThemes.backgroundDark,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
    color: colorThemes.primary,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colorThemes.backgroundLight,
  },
  cardmargin: {
    marginVertical: 10,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  priceText: {
    paddingVertical: 3,
    fontWeight: "700",
    fontSize: 18,
    color: colorThemes.primary,
  },
  heartIcon: {
    paddingRight: 10,
  },
  carTitle: {
    fontSize: 14,
    color: colorThemes.textPrimary,
    marginBottom: 6,
    fontWeight: "500",
  },
  carDetailsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  carDetailBox: {
    padding: 6,
    backgroundColor: colorThemes.accent2,
    borderRadius: 6,
    justifyContent: "center",
  },
  carDetailText: {
    fontSize: 12,
    color: colorThemes.textLight,
    paddingHorizontal: 5,
    fontWeight: "500",
  },
});
