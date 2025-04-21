import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { checkForRegisteredUser } from "../(Home)/Services/backendoperations";
import Signup from "./Signup";
import { useAuth } from "../context/userContext";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [isNew, setIsNew] = useState(false);
  const router = useRouter();
  const { forceSetUser } = useAuth();

  const handleSignIn = async () => {
    try {
      if (!email) {
        alert("Please enter your email");
        return;
      }

      const isOldUser = await checkForRegisteredUser(email);
      if (isOldUser) {
        forceSetUser();
        router.replace("/home");
      } else {
        setIsNew(true);
      }
    } catch (error) {
      console.error("Sign-In Error:", error);
      alert("An error occurred during sign in");
    }
  };

  return !isNew ? (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Auth;
