import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { useAuth } from "@/app/context/userContext";
import { fetchCarsById, fetchUserById } from "../Services/backendoperations";
import { useLoading } from "@/app/context/loadingContext";
import { useNotification } from "@/app/context/notificationContext";
import colorThemes, { typography } from "@/app/theme";
import NetInfo from "@react-native-community/netinfo";

export default function MyCars() {
  const [value, setValue] = useState("onSale");
  const [onSale, setOnSale] = useState<any>([]);
  const [bought, setBought] = useState<any>([]);
  const [sold, setSold] = useState<any>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, forceSetUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  // Add network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = isOffline;
      setIsOffline(!state.isConnected);

      if (!state.isConnected && !wasOffline) {
        showNotification(
          "You are offline. Some features may be limited.",
          "warning"
        );
      } else if (state.isConnected && wasOffline) {
        showNotification("You are back online!", "success");
        // Refresh data when coming back online
        refreshUserData().then(() => fetchCarDetails());
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  const fetchCarDetails = async () => {
    if (isOffline) {
      showNotification("Cannot update cars while offline", "error");
      return;
    }

    setError(null);
    try {
      showLoading();
      const onSaleCars = await fetchCarsById(user?.onSaleCars);
      if (onSaleCars) {
        setOnSale(onSaleCars);
      } else {
        setOnSale([]);
        showNotification("Could not fetch cars on sale", "error");
      }

      const boughtCars = await fetchCarsById(user?.boughtCars);
      if (boughtCars) {
        setBought(boughtCars);
      } else {
        setBought([]);
        showNotification("Could not fetch bought cars", "error");
      }

      const soldCars = await fetchCarsById(user?.soldCars);
      if (soldCars) {
        setSold(soldCars);
      } else {
        setSold([]);
        showNotification("Could not fetch sold cars", "error");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch car details"
      );
      showNotification("Error loading your cars. Please try again.", "error");
    } finally {
      hideLoading();
    }
  };

  const refreshUserData = async () => {
    if (!user || !user.id) {
      showNotification("No user found. Please log in again.", "error");
      return false;
    }

    if (isOffline) {
      showNotification("Cannot refresh user data while offline", "error");
      return false;
    }

    try {
      // Fetch the latest user data from the database
      const updatedUserData = await fetchUserById(user.id);

      if (updatedUserData) {
        // Force update the user context with the latest data
        await forceSetUser();
        return true;
      } else {
        showNotification("Could not refresh user data", "error");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showNotification(errorMessage, "error");
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
    if (error) {
      return (
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
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.emptyStateSubtext}>Pull down to try again</Text>
        </ScrollView>
      );
    }

    if (isOffline) {
      return (
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
          <Text style={styles.warningText}>You are currently offline</Text>
          <Text style={styles.emptyStateSubtext}>
            Pull down to refresh when back online
          </Text>
        </ScrollView>
      );
    }

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
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textPrimary,
    marginBottom: 2,
  },
  carPrice: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.subtitle2,
    lineHeight: typography.lineHeights.subtitle2,
    color: colorThemes.primary,
    marginBottom: 2,
  },
  carInfo: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    paddingHorizontal: 8,
  },
  statusText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.grey,
    textAlign: "center",
  },
  errorText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    color: colorThemes.error,
    textAlign: "center",
  },
  warningText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    color: colorThemes.warning,
    textAlign: "center",
  },
  listContentContainer: {
    paddingBottom: 20,
  },
});
