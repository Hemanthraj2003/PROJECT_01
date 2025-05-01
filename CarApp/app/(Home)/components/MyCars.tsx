import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { useAuth } from "@/app/context/userContext";
import { fetchCarsById } from "../Services/backendoperations";
import { useLoading } from "@/app/context/loadingContext";

export default function MyCars() {
  const [value, setValue] = useState("onSale");
  const [onSale, setOnSale] = useState<any>([]);
  const [bought, setBought] = useState<any>([]);
  const [sold, setSold] = useState<any>([]);
  const { user } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    console.log("user", user);

    const fetchCarDetails = async () => {
      try {
        showLoading();
        const onSaleCars = await fetchCarsById(user?.onSaleCars);
        if (onSaleCars) setOnSale(onSaleCars);

        const boughtCars = await fetchCarsById(user?.boughtCars);
        if (boughtCars) setBought(boughtCars);

        const soldCars = await fetchCarsById(user?.soldCars);
        if (soldCars) setSold(soldCars);
      } catch (error) {
        console.error("Error fetching car details:", error);
      } finally {
        hideLoading();
      }
    };
    fetchCarDetails();
  }, []);

  // Function to render list items
  const renderCarItem = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: "#fff",
        marginVertical: 6,
        padding: 12,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",

        // Android elevation
        elevation: 3,

        // iOS shadow
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Car Image */}
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://via.placeholder.com/70x70?text=No+Image",
        }}
        style={{
          width: 70,
          height: 70,
          borderRadius: 10,
          marginRight: 12,
          backgroundColor: "#e0e0e0",
        }}
        resizeMode="cover"
      />

      {/* Car Details */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
          {item.carBrand} {item.carModel}
        </Text>

        <Text style={{ fontSize: 16, fontWeight: "600", color: "#FF5733" }}>
          ₹{item.exceptedPrice}
        </Text>

        <Text style={{ fontSize: 14, color: "#777", marginTop: 2 }}>
          {item.modelYear} • {item.km} km
        </Text>
      </View>
    </View>
  );

  const renderOnSaleCars = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#fff",
        marginVertical: 6,
        borderRadius: 12,
        padding: 12,
        // Android elevation
        elevation: 3,
        // iOS shadow
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Car Image */}
        <Image
          source={{
            uri:
              item.images?.[0] ||
              "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg",
          }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 10,
            marginRight: 12,
            backgroundColor: "#e0e0e0",
          }}
          resizeMode="cover"
        />

        {/* Car Details */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
            {item.carBrand} {item.carModel}
          </Text>

          <Text style={{ fontSize: 16, fontWeight: "600", color: "#FF5733" }}>
            ₹{item.exceptedPrice}
          </Text>

          <Text style={{ fontSize: 14, color: "#777", marginTop: 2 }}>
            {item.modelYear} • {item.km} km
          </Text>
        </View>

        {/* Status */}
        <View>
          <Text style={{ fontSize: 12, color: "#555" }}>
            {item.status || "Pending"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // UI sections for different categories
  const renderContent = () => {
    switch (value) {
      case "onSale":
        return onSale.length > 0 ? (
          <FlatList
            data={onSale}
            renderItem={renderOnSaleCars}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text>No cars on sale</Text>
        );

      case "bought":
        return bought.length > 0 ? (
          <FlatList
            data={bought}
            renderItem={renderCarItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text>No bought cars</Text>
        );

      case "sold":
        return sold.length > 0 ? (
          <FlatList
            data={sold}
            renderItem={renderCarItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text>No sold cars</Text>
        );

      default:
        return <Text>Select a category</Text>;
    }
  };

  return (
    <View style={{ flex: 1, padding: 8 }}>
      {/* Segmented Buttons */}
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          { value: "onSale", label: "On Sale" },
          { value: "bought", label: "Bought" },
          { value: "sold", label: "Sold" },
        ]}
      />

      {/* Content Rendering */}
      <View style={{ flex: 1, marginTop: 20 }}>{renderContent()}</View>
    </View>
  );
}
