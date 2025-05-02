import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import colorThemes from "@/app/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Portal, Snackbar } from "react-native-paper";
import { useAuth } from "@/app/context/userContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { user, setUser } = useAuth();
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
      await AsyncStorage.removeItem("userDetails");
      setUser(null);
      setVisible(false);
      router.replace("/");
    } catch (error) {
      setSnackbarMessage("Error logging out");
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={style.navbar}>
      <View>
        <Text style={style.navHeading}>CARS HUB</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ paddingLeft: 10, paddingRight: 5 }}
          onPress={() => router.push("/Chats")}
        >
          <Ionicons name="chatbox-ellipses-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingLeft: 10, paddingRight: 5 }}
          onPress={() => setVisible(true)}
        >
          <View
            style={{
              padding: 5.5,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "white",
            }}
          >
            <AntDesign name="user" size={19} color="white" />
          </View>
        </TouchableOpacity>
      </View>

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
                <ActivityIndicator size="large" color={colorThemes.primary1} />
              </View>
            ) : (
              <ScrollView
                style={style.scrollView}
                contentContainerStyle={style.scrollContent}
              >
                <View style={style.profileContainer}>
                  <View style={style.avatarContainer}>
                    <View style={style.avatar}>
                      <Text style={style.avatarText}>
                        {user?.name ? user.name[0].toUpperCase() : "U"}
                      </Text>
                    </View>
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

            <TouchableOpacity style={style.logoutButton} onPress={handleLogout}>
              <AntDesign
                name="logout"
                size={20}
                color="white"
                style={style.logoutIcon}
              />
              <Text style={style.logoutText}>Logout</Text>
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
    backgroundColor: colorThemes.primary1,
    padding: 12,
    paddingStart: 25,
    paddingEnd: 20,
  },
  navHeading: {
    color: "white",
    fontSize: 28,
    fontWeight: "500",
  },
  modal: {
    margin: 20,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    maxHeight: "90%",
    minHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    color: colorThemes.primary1,
  },
  profileContainer: {
    paddingBottom: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colorThemes.primary1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colorThemes.grey,
    marginBottom: 4,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  logoutButton: {
    backgroundColor: colorThemes.primary1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
export default Navbar;
