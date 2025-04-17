import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { useAuth } from "@/app/context/userContext";
import { fetchCarsById } from "../Services/backendoperations";

export default function MyCars() {
  const [value, setValue] = useState("onSale");
  const [onSale, setOnSale] = useState<any>([]);
  const [bought, setBought] = useState<any>([]);
  const [sold, setSold] = useState<any>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCarDetails = async () => {
      const onSaleCars = await fetchCarsById(user?.onSaleCars);
      if (onSaleCars) setOnSale(onSaleCars);

      const boughtCars = await fetchCarsById(user?.boughtCars);
      if (boughtCars) setBought(boughtCars);

      const soldCars = await fetchCarsById(user?.soldCars);
      if (soldCars) setSold(soldCars);
    };
    fetchCarDetails();
  }, []);

  // Function to render list items
  const renderCarItem = ({ item }: { item: any }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        marginVertical: 6,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3, // Android shadow
      }}
    >
      {/* Car Image */}
      <Image
        // source={{ uri: item.images[0] }}
        source={{
          uri: "https://images.wallpapersden.com/image/wl-cool-clove-4k-valorant_92740.jpg",
        }}
        style={{
          width: 70,
          height: 70,
          borderRadius: 10,
          marginRight: 12,
          backgroundColor: "#e0e0e0", // Fallback if image fails to load
        }}
        resizeMode="contain"
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
    <TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 12,
          marginVertical: 6,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3, // Android shadow
        }}
      >
        {/* Car Image */}
        <Image
          // source={{ uri: item.images[0] }}
          source={{
            uri: "https://images.wallpapersden.com/image/wl-cool-clove-4k-valorant_92740.jpg",
          }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 10,
            marginRight: 12,
            backgroundColor: "#e0e0e0", // Fallback if image fails to load
          }}
          resizeMode="contain"
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
        <View>
          {item.status ? <Text>{item.status}</Text> : <Text>pending</Text>}
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
