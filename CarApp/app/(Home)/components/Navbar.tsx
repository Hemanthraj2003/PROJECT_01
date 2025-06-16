import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  Modal as RNModal,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import colorThemes from "@/app/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Portal, Snackbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/app/context/userContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { typography } from "@/app/theme";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { user, setUser, removeUser } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible && !user) {
      loadUserData();
    }
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
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

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutModalVisible(false);
      setVisible(false);
      await removeUser();
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
      setSnackbarMessage("Error logging out");
      setSnackbarVisible(true);
    }
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <View>
      <LinearGradient
        colors={[
          colorThemes.primary || "#FF6200",
          colorThemes.accent2 || "#FFD700",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={style.navbar}
      >
        <View style={style.navContent}>
          <View style={style.logoContainer}>
            <Image
              source={require("@/assets/images/icon2.png")}
              style={style.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={style.navActions}>
            <TouchableOpacity
              style={style.iconButton}
              onPress={() => router.push("/Chats")}
            >
              <Ionicons
                name="chatbox-ellipses-outline"
                size={26}
                color={colorThemes.textLight || "#FFFFFF"}
                style={{ opacity: 0.9 }}
              />
              <View style={style.badge} />
            </TouchableOpacity>

            <TouchableOpacity
              style={style.iconButton}
              onPress={() => setVisible(true)}
            >
              <AntDesign
                name="user"
                size={24}
                color={colorThemes.textLight || "#FFFFFF"}
                style={{ opacity: 0.9 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Portal>
        {/* Profile Modal */}
        <Modal
          visible={visible}
          dismissable
          onDismiss={() => setVisible(false)}
          contentContainerStyle={style.modal}
        >
          <Animated.View
            style={[
              style.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={style.modalHeader}>
              <Text style={style.title}>Profile</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <AntDesign
                  name="close"
                  size={24}
                  color={colorThemes.grey || "#A9A9A9"}
                />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={style.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={colorThemes.primary || "#FF6200"}
                />
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
                      colors={[
                        colorThemes.primary || "#FF6200",
                        colorThemes.accent2 || "#FFD700",
                      ]}
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
                    <View style={style.labelContainer}>
                      <AntDesign
                        name="user"
                        size={16}
                        color={colorThemes.textSecondary || "#666666"}
                        style={style.labelIcon}
                      />
                      <Text style={style.label}>Name</Text>
                    </View>
                    <Text style={style.text}>{user?.name || "Not set"}</Text>
                  </View>

                  <View style={style.infoSection}>
                    <View style={style.labelContainer}>
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color={colorThemes.textSecondary || "#666666"}
                        style={style.labelIcon}
                      />
                      <Text style={style.label}>Phone</Text>
                    </View>
                    <Text style={style.text}>{user?.phone || "Not set"}</Text>
                  </View>

                  <View style={style.divider} />

                  <View style={style.infoSection}>
                    <View style={style.labelContainer}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={colorThemes.textSecondary || "#666666"}
                        style={style.labelIcon}
                      />
                      <Text style={style.label}>Address</Text>
                    </View>
                    <Text style={style.text}>{user?.address || "Not set"}</Text>
                  </View>

                  <View style={style.infoSection}>
                    <View style={style.labelContainer}>
                      <Ionicons
                        name="business-outline"
                        size={16}
                        color={colorThemes.textSecondary || "#666666"}
                        style={style.labelIcon}
                      />
                      <Text style={style.label}>City</Text>
                    </View>
                    <Text style={style.text}>{user?.city || "Not set"}</Text>
                  </View>

                  <View style={style.infoSection}>
                    <View style={style.labelContainer}>
                      <Ionicons
                        name="map-outline"
                        size={16}
                        color={colorThemes.textSecondary || "#666666"}
                        style={style.labelIcon}
                      />
                      <Text style={style.label}>State</Text>
                    </View>
                    <Text style={style.text}>{user?.state || "Not set"}</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity onPress={handleLogout}>
              <LinearGradient
                colors={[
                  colorThemes.primary || "#FF6200",
                  colorThemes.accent2 || "#FFD700",
                ]}
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
          </Animated.View>
        </Modal>
      </Portal>

      {/* Logout Confirmation Modal */}
      <RNModal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.logoutModalContent}>
            <Text style={style.logoutTitle}>Confirm Logout</Text>
            <Text style={style.logoutMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={style.buttonContainer}>
              <TouchableOpacity onPress={cancelLogout}>
                <View style={style.cancelButton}>
                  <Text style={style.buttonText}>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout}>
                <View style={style.confirmButton}>
                  <Text style={style.buttonText}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const style = StyleSheet.create({
  navbar: {
    height: 70,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  navContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  logoContainer: {
    justifyContent: "center",
    marginStart: 5,
  },
  logoImage: {
    width: 110,
    height: 57,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginRight: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: colorThemes.accent1 || "#FF0000",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  modal: {
    margin: 20,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: colorThemes.background || "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    maxHeight: "90%",
    minHeight: "90%",
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
    borderBottomColor: colorThemes.backgroundDark || "#E0E0E0",
  },
  scrollView: {
    flex: 1,
    minHeight: 200,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
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
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    color: colorThemes.primary || "#FF6200",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    color: colorThemes.textLight || "#FFFFFF",
  },
  infoSection: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    color: colorThemes.textSecondary || "#666666",
  },
  text: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textPrimary || "#000000",
  },
  divider: {
    height: 1,
    backgroundColor: colorThemes.backgroundDark || "#E0E0E0",
    marginVertical: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
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
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textLight || "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  logoutTitle: {
    fontSize: 20,
    color: "#FF6200",
    fontWeight: "600",
    marginBottom: 15,
  },
  logoutMessage: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 25,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#A9A9A9",
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FF6200",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});
export default Navbar;
