import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { View, Text, StyleSheet } from "react-native";
import { checkForRegisteredUser } from "../(Home)/Services/backendoperations";
import Signup from "./Signup";
import { useAuth } from "../context/userContext";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "115722995141-4j5ka6kdo1roir0jhlj47n2874eviqgd.apps.googleusercontent.com",
});

const Auth = () => {
  const [email, setEmail] = useState<any>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const router = useRouter();
  const { forceSetUser } = useAuth();

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.signOut();

      // Ensure Play Services are available
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Perform Google sign-in
      const response = await GoogleSignin.signIn();

      // Check if the sign-in was successful
      if (response.type === "success") {
        setEmail(response.data.user.email);

        const isOldUser = await checkForRegisteredUser(
          response.data.user.email
        );
        console.log("Is Old User: ", isOldUser);
        if (isOldUser) {
          forceSetUser();
          router.replace("/home");
        } else {
          setIsNew(true);
        }
      } else {
        console.log("Sign-In Cancelled");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled login");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign-in is already in progress");
      } else {
        console.error("Google Sign-In Error:", error);
      }
    }
  };

  return !isNew ? (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signInWithGoogle}
      />
    </View>
  ) : (
    <Signup phone={email} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  userInfo: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default Auth;
