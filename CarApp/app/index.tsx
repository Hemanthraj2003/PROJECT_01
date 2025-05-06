import { StyleSheet, View, ActivityIndicator } from "react-native";
import React from "react";
import { useEffect, useState } from "react";
import { SplashScreen, useRouter } from "expo-router";
import { useAuth } from "./context/userContext";
import OTP from "./(Auth)/OTP";
import colorThemes from "./theme";

SplashScreen.preventAutoHideAsync();

const Index = () => {
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { validateSession, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already authenticated
    const checkAuthentication = async () => {
      try {
        console.log("Checking authentication status...");
        const isValid = await validateSession();

        if (isValid) {
          console.log("Valid session found, redirecting to home");
          router.replace("/home");
        } else {
          console.log("No valid session found, showing login screen");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setInitialCheckDone(true);

        // Hide the splash screen after authentication check
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 500);
      }
    };

    checkAuthentication();
  }, []);

  // Show loading indicator while checking authentication
  if (isLoading || !initialCheckDone) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorThemes.primary} />
      </View>
    );
  }

  // If not authenticated, show the OTP screen
  return !isAuthenticated && <OTP />;
};

export default Index;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorThemes.background,
  },
});
