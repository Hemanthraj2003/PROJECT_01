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
  }, []);

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
      showLoading();
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
      hideLoading();
    }
  };

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    setCurrentPage(1);
    setHasMore(true);

    try {
      setLoading(true);
      showLoading();
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
      showLoading();
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

  const toggleVisibility = () => {
    setShowFilter(!showFilter);
  };

  return (
    <View style={styles.overAllPadding}>
      {/* MODAL FOR FILTER */}
      <Portal>
        <Modal
          visible={showFilter}
          dismissable
          onDismiss={() => setShowFilter(false)}
          style={{ alignItems: "center", flex: 1 }}
        >
          <View style={filterModal.modalView}>
            <View style={filterModal.headerContainer}>
              <View>
                <Text style={filterModal.modalTitle}>Filter</Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 25,
                }}
              >
                <TouchableOpacity onPress={() => setShowFilter(false)}>
                  <Text style={filterModal.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* ///////// BODY //////////// */}
            <View style={filterModal.body}>
              {/* ///////////// PRICE RANGE ///////////////// */}
              <View>
                <View>
                  <Text style={filterModal.filterHeadings}>Price range</Text>
                </View>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setpr1((prev) => !prev)}>
                    <View
                      style={
                        pr1
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={pr1 && filterModal.selectedText}>
                        1L - 3L
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setpr2((prev) => !prev)}>
                    <View
                      style={
                        pr2
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={pr2 && filterModal.selectedText}>
                        3L - 6L
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setpr3((prev) => !prev)}>
                    <View
                      style={
                        pr3
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={pr3 && filterModal.selectedText}>
                        6L - ...
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ///////////// FUEL TYPE ///////////////// */}
              <View>
                <View>
                  <Text style={filterModal.filterHeadings}>Fuel Type</Text>
                </View>

                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setft1((prev) => !prev)}>
                    <View
                      style={
                        ft1
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={ft1 && filterModal.selectedText}>
                        Petrol
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setft2((prev) => !prev)}>
                    <View
                      style={
                        ft2
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={ft2 && filterModal.selectedText}>
                        Diesel
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setft3((prev) => !prev)}>
                    <View
                      style={
                        ft3
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={ft3 && filterModal.selectedText}>CNG</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setft4((prev) => !prev)}>
                    <View
                      style={
                        ft4
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={ft4 && filterModal.selectedText}>EV</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setft5((prev) => !prev)}>
                    <View
                      style={
                        ft5
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={ft5 && filterModal.selectedText}>
                        Hybrid
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ///////////// Mileage Range ///////////////// */}
              <View>
                <View>
                  <Text style={filterModal.filterHeadings}>Mileage Range</Text>
                </View>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setmr1((prev) => !prev)}>
                    <View
                      style={
                        mr1
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={mr1 && filterModal.selectedText}>
                        0 - 50k km
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setmr2((prev) => !prev)}>
                    <View
                      style={
                        mr2
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={mr2 && filterModal.selectedText}>
                        50k - 100k km
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => setmr3((prev) => !prev)}>
                    <View
                      style={
                        mr3
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={mr3 && filterModal.selectedText}>
                        100k - ... km
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ///////////// Transmission Type ///////////////// */}

              <View>
                <View>
                  <Text style={filterModal.filterHeadings}>
                    Transmission Type
                  </Text>
                </View>
                <View style={filterModal.paramterBlock}>
                  <TouchableOpacity onPress={() => settr1((prev) => !prev)}>
                    <View
                      style={
                        tr1
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={tr1 && filterModal.selectedText}>
                        Manual
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => settr2((prev) => !prev)}>
                    <View
                      style={
                        tr2
                          ? filterModal.selectedParameters
                          : filterModal.filterParameters
                      }
                    >
                      <Text style={tr2 && filterModal.selectedText}>
                        Automatic
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* //////// BUTTONS ////////// */}
            <View style={filterModal.buttonsContainer}>
              <View style={filterModal.bottomButtons}>
                <TouchableOpacity
                  onPress={() => {
                    clearFilterParams();
                    getData(true);
                  }}
                >
                  <View style={filterModal.resetButton}>
                    <Text style={{ fontWeight: "700" }}>RESET</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onFilterSubmit}
                  disabled={!applyEnabled}
                >
                  <View
                    style={[
                      filterModal.applyButton,
                      { backgroundColor: applyEnabled ? "#117cd9" : "#ccc" },
                    ]}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "900",
                        fontSize: 16,
                      }}
                    >
                      APPLY
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cars..."
            value={searchTerm}
            onChangeText={handleSearch}
            onSubmitEditing={() => handleSearch(searchTerm)}
            returnKeyType="search"
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
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
            color={activeFilters.length > 0 ? "#fff" : "#666"}
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
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {cars.map((car, index) => (
            <Card key={index} style={styles.cardStyles}>
              <Card
                onPress={() => {
                  router.push({
                    pathname: "/components/BuyCarPage",
                    params: {
                      data: JSON.stringify(car),
                    },
                  });
                }}
              >
                <View style={{ position: "relative" }}>
                  <Card.Cover
                    source={{
                      uri: "https://www.godigit.com/content/dam/godigit/directportal/en/tata-safari-adventure-brand.jpg",
                    }}
                  />
                  <View style={styles.viewTextContainer}>
                    <Text style={styles.viewText}>View</Text>
                  </View>
                </View>
              </Card>

              <Card.Content style={{ paddingVertical: 12 }}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>₹ {car.exceptedPrice}</Text>
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
          {loading && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" />
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
    padding: 10,
  },
  noCarsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noCarsText: {
    fontSize: 18,
    color: "gray",
  },
  cardStyles: {
    marginVertical: 8,
  },
  viewTextContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 5,
  },
  viewText: {
    color: "white",
    fontSize: 15,
    backgroundColor: "#35353561",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 1.5,
    borderWidth: 0.2,
    borderColor: "black",
    borderRadius: 10,
    backgroundColor: "white",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    borderWidth: 0.2,
    borderColor: "black",
    borderRadius: 10,
    backgroundColor: "white",
  },
  activeFilterButton: {
    backgroundColor: colorThemes.primary2,
    borderColor: colorThemes.primary2,
  },
});

const filterModal = StyleSheet.create({
  modalView: {
    backgroundColor: "white",
    padding: 20,
    width: 280,
    height: "85%",
    justifyContent: "space-between",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
    paddingVertical: 5,
  },
  modalTitle: {
    fontWeight: "900",
    fontSize: 24,
    color: "#616161",
    flex: 1,
    textAlign: "center",
    marginStart: 10,
    alignItems: "center",
  },
  closeX: {
    fontSize: 24,
    fontWeight: "700",
    color: "#616161",
    // padding: 8, // Larger touch target
  },
  filterHeadings: {
    fontWeight: "700",
    fontSize: 16,
    color: "#616161",
  },

  body: {
    justifyContent: "space-evenly",
    flex: 1,
  },

  filterParameters: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 0.2,
  },

  selectedParameters: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "black",
  },
  selectedText: {
    color: "white",
  },

  paramterBlock: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 5,
  },

  buttonsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
  },

  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 5,
    paddingHorizontal: 10,
  },

  applyButton: {
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    padding: 10,
    borderRadius: 5,
    borderColor: "black",
    borderWidth: 0.2,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
});
