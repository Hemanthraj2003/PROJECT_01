import { View, Text } from "react-native";
import React from "react";
import AuthProvider from "./context/userContext";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingProvider } from "./context/loadingContext";
import LoadingScreen from "../components/LoadingScreen";
import { useLoading } from "./context/loadingContext";
import colorThemes from "./theme";

const Rootlayout = () => {
  // Custom theme using colors from the logo
  const appTheme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: colorThemes.primary,
      accent: colorThemes.accent2,
      background: colorThemes.background,
      surface: colorThemes.background,
      text: colorThemes.textPrimary,
      placeholder: colorThemes.textSecondary,
      backdrop: "rgba(0, 0, 0, 0.5)",
      notification: colorThemes.error,
    },
  };

  return (
    <AuthProvider>
      <LoadingProvider>
        <PaperProvider theme={appTheme}>
          {/* system navbar with time and battery percentage */}
          <StatusBar style="light" backgroundColor="#000000" />
          <SafeAreaView style={{ flex: 1 }}>
            <Slot />
            <LoadingScreenWrapper />
          </SafeAreaView>
        </PaperProvider>
      </LoadingProvider>
    </AuthProvider>
  );
};

const LoadingScreenWrapper = () => {
  const { isLoading } = useLoading();
  return <LoadingScreen visible={isLoading} />;
};

export default Rootlayout;
