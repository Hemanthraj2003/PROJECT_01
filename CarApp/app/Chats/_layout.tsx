import { Slot, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/app/context/userContext";
import { useEffect, useState } from "react";
import colorThemes from "@/app/theme";

export default function ChatsLayout() {
  const { isAuthenticated, isLoading, validateSession } = useAuth();
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication in chats layout...");
        const isValid = await validateSession();
        
        if (!isValid) {
          console.log("User not authenticated, redirecting to login");
          router.replace("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.replace("/");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading indicator while checking authentication
  if (isLoading || checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colorThemes.background }}>
        <ActivityIndicator size="large" color={colorThemes.primary} />
      </View>
    );
  }

  // If not authenticated, don't render anything (will be redirected)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
