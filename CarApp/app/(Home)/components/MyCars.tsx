import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { useAuth } from "@/app/context/userContext";
import { fetchCarsById, fetchUserById } from "../Services/backendoperations";
import { useLoading } from "@/app/context/loadingContext";
import colorThemes from "@/app/theme";

export default function MyCars() {
  const [value, setValue] = useState("onSale");
  const [onSale, setOnSale] = useState<any>([]);
  const [bought, setBought] = useState<any>([]);
  const [sold, setSold] = useState<any>([]);
  const { user, forceSetUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [refreshing, setRefreshing] = useState(false);

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

  const refreshUserData = async () => {
    if (!user || !user.id) {
      console.error("Cannot refresh user data: No user ID available");
      return false;
    }

    try {
      // Fetch the latest user data from the database
      const updatedUserData = await fetchUserById(user.id);

      if (updatedUserData) {
        // Force update the user context with the latest data
        await forceSetUser();
        console.log("User data refreshed successfully");
        return true;
      } else {
        console.error("Failed to fetch updated user data");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return false;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    // First refresh the user data to get the latest car arrays
    const userRefreshed = await refreshUserData();

    // Then fetch the car details based on the updated user data
    await fetchCarDetails();

    setRefreshing(false);

    // Log the refresh status
    if (userRefreshed) {
      console.log("Pull-to-refresh completed: User data and cars updated");
    } else {
      console.log("Pull-to-refresh completed: Only cars updated");
    }
  };

  useEffect(() => {
    // When component mounts, refresh user data and fetch car details
    const initializeData = async () => {
      // First try to refresh user data from the server
      if (user && user.id) {
        await refreshUserData();
      }
      // Then fetch car details
      await fetchCarDetails();
    };

    initializeData();
  }, []);

  // Function to render list items
  const renderCarItem = ({ item }: { item: any }) => (
    <View style={styles.carItemContainer}>
      {/* Car Image */}
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://via.placeholder.com/70x70?text=No+Image",
        }}
        style={styles.carImage}
        resizeMode="cover"
      />

      {/* Car Details */}
      <View style={styles.carDetailsContainer}>
        <Text style={styles.carTitle}>
          {item.carBrand} {item.carModel}
        </Text>

        <Text style={styles.carPrice}>₹{item.exceptedPrice}</Text>

        <Text style={styles.carInfo}>
          {item.modelYear} • {item.km} km
        </Text>
      </View>
    </View>
  );

  const renderOnSaleCars = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.onSaleItemContainer}>
      <View style={styles.onSaleItemContent}>
        {/* Car Image */}
        <Image
          source={{
            uri:
              item.images?.[0] ||
              "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg",
          }}
          style={styles.carImage}
          resizeMode="cover"
        />

        {/* Car Details */}
        <View style={styles.carDetailsContainer}>
          <Text style={styles.carTitle}>
            {item.carBrand} {item.carModel}
          </Text>

          <Text style={styles.carPrice}>₹{item.exceptedPrice}</Text>

          <Text style={styles.carInfo}>
            {item.modelYear} • {item.km} km
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.carStatus === "approved"
                    ? colorThemes.success
                    : item.carStatus === "rejected"
                    ? colorThemes.error
                    : colorThemes.warning,
              },
            ]}
          >
            {item.carStatus
              ? item.carStatus.charAt(0).toUpperCase() + item.carStatus.slice(1)
              : "Pending"}
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorThemes.primary, colorThemes.accent2]}
                tintColor={colorThemes.primary}
                title="Refreshing user data..."
                titleColor={colorThemes.textSecondary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyStateContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorThemes.primary, colorThemes.accent2]}
                tintColor={colorThemes.primary}
              />
            }
          >
            <Text style={styles.emptyStateText}>No cars on sale</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </ScrollView>
        );

      case "bought":
        return bought.length > 0 ? (
          <FlatList
            data={bought}
            renderItem={renderCarItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorThemes.primary, colorThemes.accent2]}
                tintColor={colorThemes.primary}
                title="Refreshing user data..."
                titleColor={colorThemes.textSecondary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyStateContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorThemes.primary, colorThemes.accent2]}
                tintColor={colorThemes.primary}
              />
            }
          >
            <Text style={styles.emptyStateText}>No bought cars</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </ScrollView>
        );

      case "sold":
        return sold.length > 0 ? (
          <FlatList
            data={sold}
            renderItem={renderCarItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorThemes.primary, colorThemes.accent2]}
                tintColor={colorThemes.primary}
                title="Refreshing user data..."
                titleColor={colorThemes.textSecondary}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyStateContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colorThemes.primary, colorThemes.accent2]}
                tintColor={colorThemes.primary}
              />
            }
          >
            <Text style={styles.emptyStateText}>No sold cars</Text>
            <Text style={styles.emptyStateSubtext}>Pull down to refresh</Text>
          </ScrollView>
        );

      default:
        return <Text>Select a category</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Segmented Buttons */}
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          { value: "onSale", label: "On Sale" },
          { value: "bought", label: "Bought" },
          { value: "sold", label: "Sold" },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Content Rendering */}
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: colorThemes.backgroundLight,
  },
  segmentedButtons: {
    backgroundColor: colorThemes.background,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },
  carItemContainer: {
    backgroundColor: colorThemes.background,
    marginVertical: 8,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  onSaleItemContainer: {
    backgroundColor: colorThemes.background,
    marginVertical: 8,
    borderRadius: 12,
    padding: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  onSaleItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  carImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colorThemes.backgroundDark,
  },
  carDetailsContainer: {
    flex: 1,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colorThemes.textPrimary,
    marginBottom: 2,
  },
  carPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: colorThemes.primary,
    marginBottom: 2,
  },
  carInfo: {
    fontSize: 14,
    color: colorThemes.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colorThemes.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colorThemes.grey,
    textAlign: "center",
  },
  listContentContainer: {
    paddingBottom: 20,
  },
});
