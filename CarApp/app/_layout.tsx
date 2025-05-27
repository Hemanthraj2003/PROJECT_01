import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import AuthProvider from "./context/userContext";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingProvider } from "./context/loadingContext";
import { NotificationProvider } from "./context/notificationContext";
import LoadingScreen from "../components/LoadingScreen";
import { useLoading } from "./context/loadingContext";
import colorThemes from "./theme";
import NetInfo from "@react-native-community/netinfo";
import {
  useFonts,
  TitilliumWeb_200ExtraLight,
  TitilliumWeb_300Light,
  TitilliumWeb_400Regular,
  TitilliumWeb_600SemiBold,
  TitilliumWeb_700Bold,
} from "@expo-google-fonts/titillium-web";
import { Ionicons } from "@expo/vector-icons";

// Create a context to track server errors across the app
export const ServerErrorContext = createContext<{
  setServerError: (hasError: boolean) => void;
  clearServerError: () => void;
}>({
  setServerError: () => {},
  clearServerError: () => {},
});

const ServerErrorScreen = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <SafeAreaView style={styles.offlineContainer}>
      <Ionicons name="server-outline" size={60} color={colorThemes.greyLight} />
      <Text style={styles.offlineTitle}>Unable to Connect</Text>
      <Text style={styles.offlineMessage}>
        We're having trouble connecting to our services. Please try again.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const OfflineScreen = () => {
  return (
    <SafeAreaView style={styles.offlineContainer}>
      <Ionicons name="cloud-offline" size={60} color={colorThemes.greyLight} />
      <Text style={styles.offlineTitle}>No Internet Connection</Text>
      <Text style={styles.offlineMessage}>
        Please check your internet connection and try again
      </Text>
    </SafeAreaView>
  );
};

const Rootlayout = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [hasServerError, setHasServerError] = useState(false);
  const [fontsLoaded] = useFonts({
    TitilliumWeb_200ExtraLight,
    TitilliumWeb_300Light,
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
    TitilliumWeb_700Bold,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
      if (state.isConnected) {
        // Clear server error when coming back online
        setHasServerError(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

  if (!fontsLoaded) {
    return <LoadingScreen visible={true} />;
  }

  return (
    <AuthProvider>
      <ServerErrorContext.Provider
        value={{
          setServerError: (hasError) => setHasServerError(hasError),
          clearServerError: () => setHasServerError(false),
        }}
      >
        <NotificationProvider>
          <LoadingProvider>
            <PaperProvider theme={appTheme}>
              {/* system navbar with time and battery percentage */}
              <StatusBar style="light" backgroundColor={colorThemes.primary} />
              <SafeAreaView style={{ flex: 1 }}>
                {isOffline ? (
                  <OfflineScreen />
                ) : hasServerError ? (
                  <ServerErrorScreen onRetry={() => setHasServerError(false)} />
                ) : (
                  <Slot />
                )}
                <LoadingScreenWrapper />
              </SafeAreaView>
            </PaperProvider>
          </LoadingProvider>
        </NotificationProvider>
      </ServerErrorContext.Provider>
    </AuthProvider>
  );
};

// Export the hook for use in components
export const useServerError = () => {
  const context = useContext(ServerErrorContext);
  if (!context) {
    throw new Error(
      "useServerError must be used within ServerErrorContext.Provider"
    );
  }
  return context;
};

const LoadingScreenWrapper = () => {
  const { isLoading } = useLoading();
  return <LoadingScreen visible={isLoading} />;
};

const styles = StyleSheet.create({
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorThemes.background,
    padding: 20,
  },
  offlineTitle: {
    fontSize: 20,
    fontFamily: "TitilliumWeb_600SemiBold",
    color: colorThemes.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  offlineMessage: {
    fontSize: 16,
    fontFamily: "TitilliumWeb_400Regular",
    color: colorThemes.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colorThemes.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryText: {
    color: colorThemes.textLight,
    fontSize: 16,
    fontFamily: "TitilliumWeb_600SemiBold",
  },
});

export default Rootlayout;
