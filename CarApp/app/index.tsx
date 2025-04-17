import { StyleSheet } from "react-native";
import React from "react";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Auth from "./(Auth)/Auth";
import { useRouter } from "expo-router";
import { useAuth } from "./context/userContext";
import Home from "./(Home)/home";
import OTP from "./(Auth)/OTP";

const index = () => {
  // state variable to check if loggedIn or not...
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setUser, user } = useAuth();
  // router instance to use naviagtion
  const router = useRouter();

  useEffect(() => {
    // fetching the user deatils to see if they are logged in already ...
    const fetchUserLoggedInfo = async () => {
      const storedData = await AsyncStorage.getItem("userDetails");
      if (storedData != null) {
        setIsLoggedIn(true);
        const data = JSON.parse(storedData);
        console.log(data);

        setUser(data);

        router.replace("/home");
      }
    };

    fetchUserLoggedInfo();
  }, []);

  return !isLoggedIn && <OTP />;
  // return ;
};

export default index;

const styles = StyleSheet.create({});
