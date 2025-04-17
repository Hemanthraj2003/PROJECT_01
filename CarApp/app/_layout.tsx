import { View, Text } from "react-native";
import React from "react";
import AuthProvider from "./context/userContext";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Rootlayout = () => {
  // this is used to set the thmeme of the PaperProvier to always Light...
  const lightTheme = {
    ...DefaultTheme,
    dark: false,
  };
  console.log("Hello from Root");

  return (
    <AuthProvider>
      <PaperProvider theme={lightTheme}>
        {/* system navbar with time and battery percentage */}
        <StatusBar style="light" backgroundColor="#000000" />
        <SafeAreaView style={{ flex: 1 }}>
          <Slot />
        </SafeAreaView>
      </PaperProvider>
    </AuthProvider>
  );
};

export default Rootlayout;
