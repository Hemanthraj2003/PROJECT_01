import { View, Text } from "react-native";
import React, { Profiler, useEffect } from "react";
import { BottomNavigation } from "react-native-paper";
import { useNavigation } from "expo-router";
import BuyCars from "../components/BuyCars";
import SellCars from "../components/SellCars";
import MyCars from "../components/MyCars";
import Profile from "../components/Fav";

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
    <View style={{ flex: 1 }}>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </View>
  );
};

export default Home;
