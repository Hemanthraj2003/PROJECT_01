import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import colorThemes from "@/app/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Modal, Portal, Snackbar } from "react-native-paper";
import { useAuth } from "@/app/context/userContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  return (
    <View style={style.navbar}>
      <View>
        <Text style={style.navHeading}>CARS HUB</Text>
      </View>

      <TouchableOpacity
        style={{ paddingLeft: 20, paddingRight: 8 }}
        onPress={() => setVisible(true)}
      >
        <View
          style={{
            padding: 8,
            borderRadius: "50%",
            borderWidth: 0.7,
            borderColor: "white",
          }}
        >
          <AntDesign name="user" size={22} color="white" />
        </View>
      </TouchableOpacity>

      {/* PROFILE MODAL */}
      <Portal>
        <Modal
          visible={visible}
          dismissable
          onDismiss={() => setVisible(false)}
          contentContainerStyle={style.modal}
        >
          <Text style={style.title}>User Profile</Text>
          <ScrollView style={style.container}>
            <View style={style.profileContainer}>
              <Text style={style.label}>Name:</Text>
              <Text style={style.text}>{user?.name || "-"}</Text>

              <Text style={style.label}>Address:</Text>
              <Text style={style.text}>{user?.address || "-"}</Text>

              <Text style={style.label}>City:</Text>
              <Text style={style.text}>{user?.city || "-"}</Text>

              <Text style={style.label}>State:</Text>
              <Text style={style.text}>{user?.state || "-"}</Text>
            </View>
          </ScrollView>

          <View style={style.buttonContainer}>
            <TouchableOpacity style={style.button}>
              <Text style={style.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={1000}
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              marginLeft: "auto",
              marginRight: "auto",
              zIndex: 10,
              paddingHorizontal: 20,
            }}
          >
            {snackbarMessage}
          </Snackbar>
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
    fontSize: 30,
    fontWeight: "500",
  },

  modal: {
    width: "85%",
    height: "80%",
    backgroundColor: "white",
    alignSelf: "center",
    borderRadius: 20,
    padding: 20,
  },

  container: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  profileContainer: {
    marginVertical: 20,
  },

  label: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "bold",
  },

  text: {
    fontSize: 16,
    marginBottom: 15,
  },

  buttonContainer: {
    paddingTop: 10,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "center",
  },

  button: {
    backgroundColor: colorThemes.primary1,
    padding: 12,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Navbar;
