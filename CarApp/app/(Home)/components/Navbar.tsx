import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import colorThemes from "@/app/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Portal, Snackbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/app/context/userContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { user, setUser, removeUser } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible && !user) {
      loadUserData();
    }
  }, [visible]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      if (userDetails) {
        setUser(JSON.parse(userDetails));
      }
    } catch (error) {
      setSnackbarMessage("Error loading user data");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setVisible(false);

      // Use the removeUser function from the auth context
      // This ensures proper cleanup of the user state
      await removeUser();

      // Navigate to the login screen
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
      setSnackbarMessage("Error logging out");
      setSnackbarVisible(true);
    }
  };

  return (
    <View>
      <LinearGradient
        colors={[colorThemes.primary, colorThemes.accent2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={style.navbar}
      >
        <View style={style.logoContainer}>
          <Image
            source={require("@/assets/images/icon2.png")}
            style={style.logoImage}
            resizeMode="cover"
          />
        </View>

        <View style={style.navActions}>
          <TouchableOpacity
            style={style.iconButton}
            onPress={() => router.push("/Chats")}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={28}
              color={colorThemes.textLight}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={style.iconButton}
            onPress={() => setVisible(true)}
          >
            <View style={style.userIconContainer}>
              <AntDesign name="user" size={18} color={colorThemes.textLight} />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* PROFILE MODAL */}
      <Portal>
        <Modal
          visible={visible}
          dismissable
          onDismiss={() => setVisible(false)}
          contentContainerStyle={style.modal}
        >
          <View style={style.modalContent}>
            <View style={style.modalHeader}>
              <Text style={style.title}>Profile</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <AntDesign name="close" size={24} color={colorThemes.grey} />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={style.loadingContainer}>
                <ActivityIndicator size="large" color={colorThemes.primary} />
              </View>
            ) : (
              <ScrollView
                style={style.scrollView}
                contentContainerStyle={style.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={style.profileContainer}>
                  <View style={style.avatarContainer}>
                    <LinearGradient
                      colors={[colorThemes.primary, colorThemes.accent2]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={style.avatar}
                    >
                      <Text style={style.avatarText}>
                        {user?.name ? user.name[0].toUpperCase() : "U"}
                      </Text>
                    </LinearGradient>
                  </View>

                  <View style={style.infoSection}>
                    <Text style={style.label}>Name</Text>
                    <Text style={style.text}>{user?.name || "-"}</Text>
                  </View>

                  <View style={style.infoSection}>
                    <Text style={style.label}>Phone</Text>
                    <Text style={style.text}>{user?.phone || "-"}</Text>
                  </View>

                  <View style={style.divider} />

                  <View style={style.infoSection}>
                    <Text style={style.label}>Address</Text>
                    <Text style={style.text}>{user?.address || "-"}</Text>
                  </View>

                  <View style={style.infoSection}>
                    <Text style={style.label}>City</Text>
                    <Text style={style.text}>{user?.city || "-"}</Text>
                  </View>

                  <View style={style.infoSection}>
                    <Text style={style.label}>State</Text>
                    <Text style={style.text}>{user?.state || "-"}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity onPress={handleLogout}>
              <LinearGradient
                colors={[colorThemes.primary, colorThemes.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={style.logoutButton}
              >
                <AntDesign
                  name="logout"
                  size={20}
                  color="white"
                  style={style.logoutIcon}
                />
                <Text style={style.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              duration={2000}
            >
              {snackbarMessage}
            </Snackbar>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const style = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 0,
    height: 56,
    // Add a subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingStart: 20,
  },
  logoImage: {
    width: 120,
    height: 40,
  },
  navHeading: {
    color: colorThemes.textLight,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",

    paddingRight: 8,
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  userIconContainer: {
    padding: 6,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colorThemes.textLight,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modal: {
    margin: 20,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: colorThemes.background,
    borderRadius: 15,
    padding: 20,
    maxHeight: "90%",
    minHeight: "90%",
    // Add shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colorThemes.backgroundDark,
  },
  scrollView: {
    flex: 1,
    minHeight: 200,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colorThemes.primary,
  },
  profileContainer: {
    paddingBottom: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    // Add shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    color: colorThemes.textLight,
    fontWeight: "bold",
  },
  infoSection: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: colorThemes.textSecondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  text: {
    fontSize: 16,
    color: colorThemes.textPrimary,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: colorThemes.backgroundDark,
    marginVertical: 18,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    // Add shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: colorThemes.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
});
export default Navbar;
