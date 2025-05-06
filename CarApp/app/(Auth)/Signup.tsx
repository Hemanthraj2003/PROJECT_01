import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { registerNewUser } from "../(Home)/Services/backendoperations";
import { useAuth } from "../context/userContext";
import colorThemes from "../theme";

type SignupProps = {
  phone: string;
};

const Signup: React.FC<SignupProps> = ({ phone }) => {
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // State to store the form details
  const [formData, setFormData] = useState({
    name: "",
    phone: phone,
    city: "",
    state: "",
    address: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // To disable submit button

  // Router instance to navigate
  const router = useRouter();

  const { forceSetUser } = useAuth();

  // Function to update state variable when input field is used
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Call validation function on every field change
    validateForm();
  };

  // Function to check form validity and update submit button status
  const validateForm = () => {
    const { name, city, state, address } = formData;

    // Check if all fields are filled
    if (!name || !city || !state || !address) {
      setIsSubmitDisabled(true);
      return false;
    }

    setIsSubmitDisabled(false); // Enable submit button if everything is valid
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate before submitting
    if (!validateForm()) {
      setErrorMessage("Please fill all fields correctly.");
      setVisible(true);
      return;
    } else {
      const success = await registerNewUser(formData);
      if (success) {
        forceSetUser();
        router.replace("/home");
      }
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/icon.jpg")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/icon.jpg")}
              style={styles.logoImage}
            />
            <Text style={styles.appName}>FRIENDS CARS</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Please fill in your details to complete registration
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Full Name"
              mode="outlined"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
              outlineColor={colorThemes.greyLight}
              activeOutlineColor={colorThemes.primary}
              theme={{ colors: { primary: colorThemes.primary } }}
            />

            <TextInput
              label="City"
              mode="outlined"
              value={formData.city}
              onChangeText={(text) => handleChange("city", text)}
              style={styles.input}
              outlineColor={colorThemes.greyLight}
              activeOutlineColor={colorThemes.primary}
              theme={{ colors: { primary: colorThemes.primary } }}
            />

            <TextInput
              label="State"
              mode="outlined"
              value={formData.state}
              onChangeText={(text) => handleChange("state", text)}
              style={styles.input}
              outlineColor={colorThemes.greyLight}
              activeOutlineColor={colorThemes.primary}
              theme={{ colors: { primary: colorThemes.primary } }}
            />

            <TextInput
              label="Address"
              mode="outlined"
              value={formData.address}
              onChangeText={(text) => handleChange("address", text)}
              style={styles.input}
              outlineColor={colorThemes.greyLight}
              activeOutlineColor={colorThemes.primary}
              theme={{ colors: { primary: colorThemes.primary } }}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitDisabled && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            >
              <Text style={styles.submitButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={Snackbar.DURATION_SHORT}
          style={styles.snackbar}
        >
          {errorMessage}
        </Snackbar>
      </View>
    </ImageBackground>
  );
};

export default Signup;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  backgroundImageStyle: {
    opacity: 0.15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: colorThemes.primary,
    marginBottom: 24,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colorThemes.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colorThemes.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: colorThemes.background,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colorThemes.backgroundLight,
  },
  submitButton: {
    backgroundColor: colorThemes.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: colorThemes.grey,
  },
  submitButtonText: {
    color: colorThemes.textLight,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  snackbar: {
    backgroundColor: colorThemes.error,
  },
});
