import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Button,
  Snackbar,
  TextInput,
  ActivityIndicator,
  HelperText,
} from "react-native-paper";
import { registerNewUser } from "../(Home)/Services/backendoperations";
import { useAuth } from "../context/userContext";
import { useNotification } from "@/app/context/notificationContext";
import colorThemes, { typography } from "@/app/theme";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from "expo-linear-gradient";

type SignupProps = {
  phone: string;
};

const Signup: React.FC<SignupProps> = ({ phone }) => {
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
  });

  // State to store the form details
  const [formData, setFormData] = useState({
    name: "",
    phone: phone,
    city: "",
    state: "",
    address: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const router = useRouter();
  const { forceSetUser } = useAuth();
  const { showNotification } = useNotification();

  // Add network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = isOffline;
      setIsOffline(!state.isConnected);

      if (!state.isConnected && !wasOffline) {
        showNotification(
          "You are offline. Please check your connection.",
          "warning"
        );
      } else if (state.isConnected && wasOffline) {
        showNotification("You are back online!", "success");
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  // Validate individual fields
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name":
        return value.trim().length < 2
          ? "Name must be at least 2 characters"
          : "";
      case "city":
        return value.trim().length < 2
          ? "City name must be at least 2 characters"
          : "";
      case "state":
        return value.trim().length < 2
          ? "State name must be at least 2 characters"
          : "";
      case "address":
        return value.trim().length < 5 ? "Please enter a valid address" : "";
      default:
        return "";
    }
  };

  // Function to update state variable when input field is used
  const handleChange = (field: string, value: string) => {
    const error = validateField(field, value);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    validateForm();
  };

  // Validate entire form
  const validateForm = () => {
    const hasErrors = Object.values(formErrors).some((error) => error !== "");
    const hasEmptyFields = Object.values(formData).some(
      (value) => !value.trim()
    );
    setIsSubmitDisabled(hasErrors || hasEmptyFields);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isOffline) {
      showNotification("Cannot register while offline", "error");
      return;
    }

    if (isSubmitDisabled) {
      showNotification("Please fill all fields correctly", "error");
      return;
    }

    try {
      setLoading(true);
      const result = await registerNewUser(formData);

      if (result) {
        await forceSetUser();
        showNotification("Registration successful!", "success");
        router.replace("/home");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setErrorMessage(errorMessage);
      showNotification(errorMessage, "error");
      setVisible(true);
    } finally {
      setLoading(false);
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
            {/* Name Input */}
            <TextInput
              label="Full Name"
              mode="outlined"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
              outlineColor={colorThemes.secondary}
              activeOutlineColor={colorThemes.primary}
              theme={{
                colors: { background: colorThemes.background },
              }}
              error={!!formErrors.name}
            />
            {formErrors.name ? (
              <HelperText type="error" visible={!!formErrors.name}>
                {formErrors.name}
              </HelperText>
            ) : null}

            {/* City Input */}
            <TextInput
              label="City"
              mode="outlined"
              value={formData.city}
              onChangeText={(text) => handleChange("city", text)}
              style={styles.input}
              outlineColor={colorThemes.secondary}
              activeOutlineColor={colorThemes.primary}
              theme={{
                colors: { background: colorThemes.background },
              }}
              error={!!formErrors.city}
            />
            {formErrors.city ? (
              <HelperText type="error" visible={!!formErrors.city}>
                {formErrors.city}
              </HelperText>
            ) : null}

            {/* State Input */}
            <TextInput
              label="State"
              mode="outlined"
              value={formData.state}
              onChangeText={(text) => handleChange("state", text)}
              style={styles.input}
              outlineColor={colorThemes.secondary}
              activeOutlineColor={colorThemes.primary}
              theme={{
                colors: { background: colorThemes.background },
              }}
              error={!!formErrors.state}
            />
            {formErrors.state ? (
              <HelperText type="error" visible={!!formErrors.state}>
                {formErrors.state}
              </HelperText>
            ) : null}

            {/* Address Input */}
            <TextInput
              label="Address"
              mode="outlined"
              value={formData.address}
              onChangeText={(text) => handleChange("address", text)}
              style={styles.input}
              outlineColor={colorThemes.secondary}
              activeOutlineColor={colorThemes.primary}
              theme={{
                colors: { background: colorThemes.background },
              }}
              error={!!formErrors.address}
            />
            {formErrors.address ? (
              <HelperText type="error" visible={!!formErrors.address}>
                {formErrors.address}
              </HelperText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (isSubmitDisabled || loading || isOffline) &&
                  styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitDisabled || loading || isOffline}
            >
              <LinearGradient
                colors={[colorThemes.primary, colorThemes.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {loading ? (
                  <ActivityIndicator color={colorThemes.textLight} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
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
    marginBottom: 4,
    backgroundColor: colorThemes.background,
  },
  submitButton: {
    marginTop: 20,
    overflow: "hidden",
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  gradientButton: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: colorThemes.textLight,
    fontSize: typography.sizes.subtitle1,
    fontFamily: typography.fonts.bodyBold,
  },
  snackbar: {
    backgroundColor: colorThemes.error,
  },
});
