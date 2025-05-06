import { View, Text, StyleSheet } from "react-native";
import React, { Profiler, useEffect } from "react";
import { BottomNavigation } from "react-native-paper";
import { useNavigation } from "expo-router";
import BuyCars from "../components/BuyCars";
import SellCars from "../components/SellCars";
import MyCars from "../components/MyCars";
import Profile from "../components/Fav";
import colorThemes from "@/app/theme";

const Home = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "buy",
      title: "Buy Cars",
      focusedIcon: "car-back",
      unfocusedIcon: "car",
    },
    { key: "albums", title: "Sell Cars", focusedIcon: "gold" },
    { key: "recents", title: "My Cars", focusedIcon: "car-info" },
    {
      key: "notifications",
      title: "Favorites",
      focusedIcon: "heart",
      unfocusedIcon: "heart-outline",
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    buy: BuyCars,
    albums: SellCars,
    recents: MyCars,
    notifications: Profile,
  });
  return (
    <View style={styles.container}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={styles.bottomBar}
        activeColor={colorThemes.primary}
        inactiveColor={colorThemes.greyDark}
        sceneAnimationType="shifting"
        sceneAnimationEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomBar: {
    backgroundColor: colorThemes.background,
    borderTopWidth: 1,
    borderTopColor: colorThemes.backgroundDark,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default Home;
