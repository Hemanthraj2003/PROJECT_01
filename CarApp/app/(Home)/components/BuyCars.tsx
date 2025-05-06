import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Card, Modal, Portal } from "react-native-paper";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { fetchAllFilteredCars } from "../Services/backendoperations";
import colorThemes from "@/app/theme";
import { useLoading } from "@/app/context/loadingContext";

export default function BuyCars() {
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [cars, setCars] = useState<any[]>([]);
  const [applyEnabled, setApplyEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputText, setSearchInputText] = useState("");
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();

  // dumbway of creating the filter paramters

  // price range parameters
  const [pr1, setpr1] = useState<boolean>(false);
  const [pr2, setpr2] = useState<boolean>(false);
  const [pr3, setpr3] = useState<boolean>(false);

  // fuelType parameters
  const [ft1, setft1] = useState<boolean>(false);
  const [ft2, setft2] = useState<boolean>(false);
  const [ft3, setft3] = useState<boolean>(false);
  const [ft4, setft4] = useState<boolean>(false);
  const [ft5, setft5] = useState<boolean>(false);

  // Mileage Range parameters
  const [mr1, setmr1] = useState<boolean>(false);
  const [mr2, setmr2] = useState<boolean>(false);
  const [mr3, setmr3] = useState<boolean>(false);

  // Transmission parameters
  const [tr1, settr1] = useState<boolean>(false);
  const [tr2, settr2] = useState<boolean>(false);

  useEffect(() => {
    getData();
    setSearchInputText(searchTerm);
  }, []);

  // Initialize searchInputText with searchTerm value
  useEffect(() => {
    setSearchInputText(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const hasActiveFilters =
      pr1 ||
      pr2 ||
      pr3 ||
      ft1 ||
      ft2 ||
      ft3 ||
      ft4 ||
      ft5 ||
      mr1 ||
      mr2 ||
      mr3 ||
      tr1 ||
      tr2;

    setApplyEnabled(hasActiveFilters);
  }, [pr1, pr2, pr3, ft1, ft2, ft3, ft4, ft5, mr1, mr2, mr3, tr1, tr2]);

  const getData = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    try {
      setLoading(true);
      // Only show full-screen loading on initial load or reset
      if (reset) {
        showLoading();
      }

      const pageToFetch = reset ? 1 : currentPage;

      const { cars: newCars, pagination } = await fetchAllFilteredCars(
        activeFilters,
        searchTerm,
        pageToFetch
      );

      if (reset) {
        setCars(newCars);
      } else {
        setCars((prev) => [...prev, ...newCars]);
      }

      setHasMore(pagination.hasMore);
      setCurrentPage(pageToFetch + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      // Only hide full-screen loading on initial load or reset
      if (reset) {
        hideLoading();
      }
    }
  };

  const handleInputChange = (text: string) => {
    setSearchInputText(text);
  };

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    setCurrentPage(1);
    setHasMore(true);

    try {
      setLoading(true);
      showLoading(); // Show full-screen loading for search as it's a new query
      const { cars: searchResults, pagination } = await fetchAllFilteredCars(
        activeFilters,
        text,
        1
      );
      setCars(searchResults);
      setHasMore(pagination.hasMore);
      setCurrentPage(2);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setSearchTerm("");
    setSearchInputText("");
    setActiveFilters([]);
    clearFilterParams();
    try {
      await getData(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const clearFilterParams = () => {
    setpr1(false);
    setpr2(false);
    setpr3(false);
    setft1(false);
    setft2(false);
    setft3(false);
    setft4(false);
    setft5(false);
    setmr1(false);
    setmr2(false);
    setmr3(false);
    settr1(false);
    settr2(false);
  };

  const onFilterSubmit = async () => {
    const filterParams = [];

    // Price Range filters
    const priceConditions = [];
    if (pr1) priceConditions.push([100000, 300000]);
    if (pr2) priceConditions.push([300000, 600000]);
    if (pr3) priceConditions.push([600000, Number.MAX_SAFE_INTEGER]);

    if (priceConditions.length > 0) {
      const min = Math.min(...priceConditions.map((p) => p[0]));
      const max = Math.max(...priceConditions.map((p) => p[1]));
      filterParams.push(
        { field: "exceptedPrice", condition: ">=", value: min },
        { field: "exceptedPrice", condition: "<=", value: max }
      );
    }

    // Fuel Type filters
    const fuelTypes = [];
    if (ft1) fuelTypes.push("Petrol");
    if (ft2) fuelTypes.push("Diesel");
    if (ft3) fuelTypes.push("CNG");
    if (ft4) fuelTypes.push("EV");
    if (ft5) fuelTypes.push("Hybrid");

    if (fuelTypes.length > 0) {
      filterParams.push({
        field: "fuelType",
        condition: fuelTypes.length === 1 ? "==" : "in",
        value: fuelTypes.length === 1 ? fuelTypes[0] : fuelTypes,
      });
    }

    // Mileage Range filters
    const kmConditions = [];
    if (mr1) kmConditions.push({ condition: "<=", value: 50000 });
    if (mr2) kmConditions.push({ condition: "<=", value: 100000 });
    if (mr3) kmConditions.push({ condition: ">=", value: 100000 });

    if (kmConditions.length > 0) {
      const min = kmConditions.find((c) => c.condition === ">=")?.value ?? 0;
      const max = kmConditions
        .filter((c) => c.condition === "<=")
        .reduce((a, b) => Math.max(a, b.value), Number.MAX_SAFE_INTEGER);

      filterParams.push(
        { field: "km", condition: ">=", value: min },
        { field: "km", condition: "<=", value: max }
      );
    }

    // Transmission Type filters
    const transmissionTypes = [];
    if (tr1) transmissionTypes.push("Manual");
    if (tr2) transmissionTypes.push("Automatic");

    if (transmissionTypes.length > 0) {
      filterParams.push({
        field: "transmissionType",
        condition: transmissionTypes.length === 1 ? "==" : "in",
        value:
          transmissionTypes.length === 1
            ? transmissionTypes[0]
            : transmissionTypes,
      });
    }

    try {
      setLoading(true);
      showLoading(); // Show full-screen loading for filter changes as it's a new query
      setActiveFilters(filterParams);
      const { cars: filteredCars, pagination } = await fetchAllFilteredCars(
        filterParams,
        searchTerm,
        1
      );
      setCars(filteredCars);
      setCurrentPage(2);
      setHasMore(pagination.hasMore);
    } catch (error) {
      console.error(error);
      alert("Error applying filters");
    } finally {
      setLoading(false);
      hideLoading();
      setShowFilter(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      getData();
    }
  };

  return (
    <View style={styles.overAllPadding}>
      {/* MODAL FOR FILTER */}
      <Portal>
        <Modal
          visible={showFilter}
          dismissable
          onDismiss={() => setShowFilter(false)}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            marginHorizontal: 0,
            paddingHorizontal: 0,
          }}
        >
          <View style={filterModal.modalView}>
            <LinearGradient
              colors={[colorThemes.primary, colorThemes.accent1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={filterModal.headerContainer}
            >
              <Text style={filterModal.modalTitle}>Filter</Text>
              <TouchableOpacity
                onPress={() => setShowFilter(false)}
                style={filterModal.closeButton}
              >
                <Text style={filterModal.closeX}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            {/* ///////// BODY //////////// */}
            <ScrollView
              style={filterModal.scrollView}
              contentContainerStyle={filterModal.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* ///////////// PRICE RANGE ///////////////// */}
              <View style={filterModal.filterSection}>
                <Text style={filterModal.filterHeadings}>Price Range</Text>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setpr1((prev) => !prev)}>
                    {pr1 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>1L - 3L</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text
                          style={{
                            color: colorThemes.textPrimary,
                            fontSize: 14,
                          }}
                        >
                          1L - 3L
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setpr2((prev) => !prev)}>
                    {pr2 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>3L - 6L</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text
                          style={{
                            color: colorThemes.textPrimary,
                            fontSize: 14,
                          }}
                        >
                          3L - 6L
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setpr3((prev) => !prev)}>
                    {pr3 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>6L - ...</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text
                          style={{
                            color: colorThemes.textPrimary,
                            fontSize: 14,
                          }}
                        >
                          6L - ...
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* ///////////// FUEL TYPE ///////////////// */}
              <View style={filterModal.filterSection}>
                <Text style={filterModal.filterHeadings}>Fuel Type</Text>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setft1((prev) => !prev)}>
                    {ft1 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>Petrol</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>Petrol</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setft2((prev) => !prev)}>
                    {ft2 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>Diesel</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>Diesel</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setft3((prev) => !prev)}>
                    {ft3 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>CNG</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>CNG</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setft4((prev) => !prev)}>
                    {ft4 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>EV</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>EV</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setft5((prev) => !prev)}>
                    {ft5 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>Hybrid</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>Hybrid</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* ///////////// Mileage Range ///////////////// */}
              <View style={filterModal.filterSection}>
                <Text style={filterModal.filterHeadings}>Mileage Range</Text>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setmr1((prev) => !prev)}>
                    {mr1 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>0 - 50k km</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>
                          0 - 50k km
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setmr2((prev) => !prev)}>
                    {mr2 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>
                          50k - 100k km
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>
                          50k - 100k km
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setmr3((prev) => !prev)}>
                    {mr3 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>100k+ km</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>100k+ km</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* ///////////// Transmission Type ///////////////// */}
              <View style={filterModal.filterSection}>
                <Text style={filterModal.filterHeadings}>
                  Transmission Type
                </Text>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => settr1((prev) => !prev)}>
                    {tr1 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>Manual</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>Manual</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => settr2((prev) => !prev)}>
                    {tr2 ? (
                      <LinearGradient
                        colors={[colorThemes.primary, colorThemes.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={filterModal.selectedParameters}
                      >
                        <Text style={filterModal.selectedText}>Automatic</Text>
                      </LinearGradient>
                    ) : (
                      <View style={filterModal.filterParameters}>
                        <Text style={filterModal.parameterText}>Automatic</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* //////// BUTTONS ////////// */}
            <View style={filterModal.buttonsContainer}>
              <View style={filterModal.bottomButtons}>
                <TouchableOpacity
                  style={filterModal.resetButton}
                  onPress={() => {
                    clearFilterParams();
                    setActiveFilters([]);
                    setShowFilter(false);
                    getData(true);
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: colorThemes.textPrimary,
                      fontSize: 16,
                    }}
                  >
                    RESET
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onFilterSubmit}
                  disabled={!applyEnabled}
                  style={{ flex: 1 }}
                >
                  {applyEnabled ? (
                    <LinearGradient
                      colors={[colorThemes.primary, colorThemes.accent2]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={filterModal.applyButton}
                    >
                      <Text
                        style={{
                          color: colorThemes.textLight,
                          fontWeight: "700",
                          fontSize: 16,
                          letterSpacing: 0.5,
                        }}
                      >
                        APPLY
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        filterModal.applyButton,
                        { backgroundColor: colorThemes.greyLight },
                      ]}
                    >
                      <Text
                        style={{
                          color: colorThemes.textLight,
                          fontWeight: "700",
                          fontSize: 16,
                          letterSpacing: 0.5,
                        }}
                      >
                        APPLY
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Filter count indicator */}
              {applyEnabled && (
                <View style={filterModal.filterCountContainer}>
                  <Text style={filterModal.filterCountText}>
                    {
                      [
                        pr1,
                        pr2,
                        pr3,
                        ft1,
                        ft2,
                        ft3,
                        ft4,
                        ft5,
                        mr1,
                        mr2,
                        mr3,
                        tr1,
                        tr2,
                      ].filter(Boolean).length
                    }{" "}
                    filters selected
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </Portal>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colorThemes.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            placeholderTextColor={colorThemes.textSecondary}
            value={searchInputText}
            onChangeText={handleInputChange}
            onSubmitEditing={() => handleSearch(searchInputText)}
            returnKeyType="search"
          />
          {searchInputText ? (
            <TouchableOpacity
              onPress={() => {
                setSearchInputText("");
                handleSearch("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colorThemes.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilters.length > 0 && styles.activeFilterButton,
          ]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons
            name="filter"
            size={24}
            color={
              activeFilters.length > 0
                ? colorThemes.textLight
                : colorThemes.textPrimary
            }
          />
        </TouchableOpacity>
      </View>

      {cars.length === 0 ? (
        <View style={styles.noCarsContainer}>
          <Text style={styles.noCarsText}>No matching cars found</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {cars.map((car, index) => {
            const URI =
              car.images !== undefined && car.images[0] !== undefined
                ? car.images[0]
                : "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg";
            return (
              <Card key={index} style={styles.cardStyles}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push({
                      pathname: "/components/BuyCarPage",
                      params: {
                        data: JSON.stringify(car),
                      },
                    });
                  }}
                >
                  <View style={styles.cardImageContainer}>
                    <Card.Cover
                      source={{
                        uri: URI,
                      }}
                      style={styles.cardImage}
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.7)"]}
                      style={styles.imageGradient}
                    />
                    <View style={styles.viewTextContainer}>
                      <Text style={styles.viewText}>View Details</Text>
                    </View>
                  </View>

                  <Card.Content style={styles.cardContent}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>
                        ₹ {car.exceptedPrice?.toLocaleString() || ""}
                      </Text>
                      <View style={styles.yearBadge}>
                        <Text style={styles.yearText}>{car.modelYear}</Text>
                      </View>
                    </View>
                    <Text style={styles.carTitle}>
                      {car.carBrand} {car.carModel}
                    </Text>
                    <View style={styles.carDetailsContainer}>
                      <View style={styles.carDetailBox}>
                        <Ionicons
                          name="speedometer-outline"
                          size={14}
                          color={colorThemes.textLight}
                          style={styles.detailIcon}
                        />
                        <Text style={styles.carDetailText}>
                          {car.km?.toLocaleString() || 0} Km
                        </Text>
                      </View>
                      <View style={styles.carDetailBox}>
                        <Ionicons
                          name="water-outline"
                          size={14}
                          color={colorThemes.textLight}
                          style={styles.detailIcon}
                        />
                        <Text style={styles.carDetailText}>{car.fuelType}</Text>
                      </View>
                      {car.transmissionType && (
                        <View style={styles.carDetailBox}>
                          <Ionicons
                            name="cog-outline"
                            size={14}
                            color={colorThemes.textLight}
                            style={styles.detailIcon}
                          />
                          <Text style={styles.carDetailText}>
                            {car.transmissionType}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card.Content>
                </TouchableOpacity>
              </Card>
            );
          })}

          {/* Load More Button */}
          {hasMore && !loading && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colorThemes.primary, colorThemes.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loadMoreGradient}
              >
                <Text style={styles.loadMoreText}>Load More Cars</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colorThemes.primary} />
              <Text style={styles.loadingText}>Loading more cars...</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overAllPadding: {
    flex: 1,
    padding: 12,
    backgroundColor: colorThemes.backgroundLight,
  },
  noCarsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  noCarsText: {
    fontSize: 18,
    color: colorThemes.textSecondary,
    textAlign: "center",
  },
  cardStyles: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: colorThemes.background,
  },
  cardImageContainer: {
    position: "relative",
    height: 180,
  },
  cardImage: {
    height: 180,
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  viewTextContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    zIndex: 2,
  },
  viewText: {
    color: colorThemes.textLight,
    fontSize: 14,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  priceText: {
    paddingVertical: 3,
    fontWeight: "700",
    fontSize: 20,
    color: colorThemes.primary,
  },
  yearBadge: {
    backgroundColor: colorThemes.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  yearText: {
    fontSize: 13,
    fontWeight: "600",
    color: colorThemes.textPrimary,
  },
  carTitle: {
    fontSize: 16,
    color: colorThemes.textPrimary,
    marginBottom: 8,
    fontWeight: "600",
  },
  carDetailsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap",
  },
  carDetailBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colorThemes.accent2,
    borderRadius: 20,
    justifyContent: "center",
  },
  detailIcon: {
    marginRight: 4,
  },
  carDetailText: {
    fontSize: 12,
    color: colorThemes.textLight,
    fontWeight: "500",
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colorThemes.textSecondary,
  },
  loadMoreButton: {
    marginVertical: 20,
    marginHorizontal: 40,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loadMoreGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: {
    color: colorThemes.textLight,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    borderRadius: 10,
    backgroundColor: colorThemes.background,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colorThemes.textPrimary,
  },
  filterButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    borderRadius: 10,
    backgroundColor: colorThemes.background,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeFilterButton: {
    backgroundColor: colorThemes.primary,
    borderColor: colorThemes.primary,
  },
});

const filterModal = StyleSheet.create({
  modalView: {
    backgroundColor: colorThemes.background,
    padding: 0,
    width: "95%",
    maxWidth: 420,
    maxHeight: "90%",
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    overflow: "hidden",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  modalTitle: {
    fontWeight: "800",
    fontSize: 24,
    color: colorThemes.textLight,
    flex: 1,
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeX: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: -3,
    color: colorThemes.textLight,
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 24,
    width: "100%",
  },
  filterHeadings: {
    fontWeight: "700",
    fontSize: 16,
    color: colorThemes.primary,
    marginBottom: 4,
    marginTop: 4,
    borderLeftWidth: 4,
    borderLeftColor: colorThemes.primary,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  filterSection: {
    marginBottom: 12,
    backgroundColor: colorThemes.backgroundLight,
    borderRadius: 12,
    padding: 10,
    paddingTop: 6,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    width: "100%",
  },
  filterParameters: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    backgroundColor: colorThemes.background,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 36,
  },
  selectedParameters: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    height: 36,
  },
  selectedText: {
    color: colorThemes.textLight,
    fontWeight: "600",
    fontSize: 14,
  },
  parameterText: {
    color: colorThemes.textPrimary,
    fontSize: 14,
  },
  paramterBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 8,
    marginTop: 6,
    gap: 8,
    width: "100%",
  },
  buttonsContainer: {
    borderTopWidth: 1,
    borderTopColor: colorThemes.backgroundDark,
    backgroundColor: colorThemes.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 8,
  },
  applyButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  resetButton: {
    padding: 16,
    borderRadius: 10,
    borderColor: colorThemes.greyLight,
    borderWidth: 1,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorThemes.backgroundLight,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterCountContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  filterCountText: {
    fontSize: 14,
    color: colorThemes.textSecondary,
    fontWeight: "500",
  },
});
