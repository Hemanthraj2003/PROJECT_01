import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef } from "react";
import colorThemes from "../theme";
import { Modal, Portal, TextInput } from "react-native-paper";
import { OtpInput } from "react-native-otp-entry";
import { useRouter } from "expo-router";
import { checkForRegisteredUser } from "../(Home)/Services/backendoperations";
import { useAuth } from "../context/userContext";
import Signup from "./Signup";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OTP = () => {
  const [number, setNumber] = useState("");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [numberError, setNumberError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isNew, setIsNew] = useState<boolean>(false);

  // For demo purposes - hardcoded OTP for testing
  const validOtp = "0000";

  const router = useRouter();
  const { forceSetUser } = useAuth();

  // Reference for countdown timer
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Add state for resend countdown
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const validatePhoneNumber = (number: string) => {
    return number.length === 10 && /^\d+$/.test(number);
  };

  // Start countdown for resend OTP
  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(30);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up interval on unmount
  React.useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const confirmNumber = async () => {
    setNumberError("");

    if (!validatePhoneNumber(number)) {
      setNumberError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowConfirm(true);
      startResendCountdown();
    } catch (error) {
      setNumberError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const resendOtp = async () => {
    if (resendDisabled) return;

    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      startResendCountdown();
      // Show success message
      setOtpError("OTP resent successfully!");
      setTimeout(() => setOtpError(""), 3000);
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function - SIMPLIFIED FOR TESTING
  const confirmOtp = async () => {
    console.log("CONFIRM OTP CALLED");
    setVerifying(true);

    // Show success message immediately
    setOtpError("success:OTP verified successfully! Logging you in...");

    try {
      console.log("Checking if user exists with phone:", number);

      // Check if user exists in the database
      const isExistingUser = await checkForRegisteredUser(number);

      if (isExistingUser) {
        console.log("User exists, logging in");

        // The user data is already stored in AsyncStorage by checkForRegisteredUser
        // Just force refresh the user context
        await forceSetUser();

        // Navigate to home after a short delay
        setTimeout(() => {
          console.log("Navigating to home page...");
          try {
            router.replace("/home");
          } catch (navError) {
            console.error("Navigation error:", navError);
            // Fallback
            router.push("/home");
          }
        }, 1500);
      } else {
        console.log("User doesn't exist, showing signup form");
        setIsNew(true);
        setVerifying(false);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setOtpError("Error logging in. Please try again.");
      setVerifying(false);
    }
  };

  return isNew ? (
    <Signup phone={number} />
  ) : (
    <ImageBackground
      source={require("@/assets/images/icon.jpg")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/icon.jpg")}
              style={styles.logoImage}
            />
            <Text style={styles.appName}>FRIENDS CARS</Text>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Please enter your phone number to continue
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Phone Number"
              value={number}
              onChangeText={(text) => {
                // Remove non-numeric characters & limit to 10 digits
                const cleanedText = text.replace(/[^0-9]/g, "");
                setNumber(cleanedText);
                setNumberError("");
              }}
              mode="outlined"
              keyboardType="phone-pad"
              left={
                <TextInput.Icon
                  icon="phone"
                  color={colorThemes.textSecondary}
                />
              }
              style={styles.input}
              outlineColor={
                numberError ? colorThemes.error : colorThemes.greyLight
              }
              activeOutlineColor={colorThemes.primary}
              error={!!numberError}
              maxLength={10}
              theme={{ colors: { primary: colorThemes.primary } }}
            />

            {numberError ? (
              <Text style={styles.errorText}>
                <Ionicons name="alert-circle" size={14} /> {numberError}
              </Text>
            ) : null}

            <View style={styles.mainButtonContainer}>
              <TouchableOpacity
                disabled={loading || !validatePhoneNumber(number)}
                onPress={confirmNumber}
                style={styles.primaryButtonContainer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[
                    validatePhoneNumber(number)
                      ? colorThemes.primary
                      : colorThemes.grey,
                    validatePhoneNumber(number)
                      ? colorThemes.accent2
                      : colorThemes.greyLight,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={colorThemes.textLight}
                    />
                  ) : (
                    <Text style={styles.buttonText}>GET OTP</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </View>
        </ScrollView>

        {/* OTP Verification Modal */}
        <Portal>
          <Modal
            visible={showConfirm}
            dismissable={!loading && !verifying}
            onDismiss={() => {
              setShowConfirm(false);
              setIsConfirmed(false);
              setOtp("");
              setOtpError("");
              if (countdownRef.current) {
                clearInterval(countdownRef.current);
              }
            }}
            contentContainerStyle={styles.modalContainer}
          >
            {isConfirmed ? (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Verify OTP</Text>
                  <Text style={styles.modalSubtitle}>
                    Enter the 4-digit code sent to
                  </Text>
                  <Text style={styles.phoneNumberText}>+91 {number}</Text>
                </View>

                <View style={styles.otpInputContainer}>
                  <OtpInput
                    numberOfDigits={4}
                    focusColor={colorThemes.primary}
                    type="numeric"
                    onTextChange={(text) => {
                      // Clean the text to ensure it's just digits
                      const cleanedText = text.replace(/\D/g, "");
                      console.log("Raw OTP input:", text);
                      console.log("Cleaned OTP input:", cleanedText);

                      setOtp(cleanedText);
                      setOtpError("");

                      // Auto-verify when all 4 digits are entered
                      if (cleanedText.length === 4 && !verifying) {
                        // Small delay to allow the UI to update
                        setTimeout(() => {
                          confirmOtp();
                        }, 300);
                      }
                    }}
                    theme={{
                      pinCodeTextStyle: {
                        color: colorThemes.textPrimary,
                        fontSize: 24,
                        fontWeight: "600",
                      },
                      pinCodeContainerStyle: {
                        borderWidth: 1,
                        borderColor: otpError
                          ? colorThemes.error
                          : colorThemes.greyLight,
                        borderRadius: 12,
                        backgroundColor: colorThemes.backgroundLight,
                        width: 55,
                        height: 60,
                        margin: 8,
                      },
                    }}
                  />
                </View>

                {otpError ? (
                  <Animatable.Text
                    animation="fadeIn"
                    style={[
                      styles.errorText,
                      { textAlign: "center", marginTop: 8 },
                      otpError.includes("success:") && {
                        color: colorThemes.success,
                      },
                    ]}
                  >
                    {otpError.includes("success:") ? (
                      <Ionicons name="checkmark-circle" size={14} />
                    ) : (
                      <Ionicons name="alert-circle" size={14} />
                    )}{" "}
                    {otpError.includes("success:")
                      ? otpError.replace("success:", "")
                      : otpError}
                  </Animatable.Text>
                ) : null}

                <View style={styles.verifyButtonContainer}>
                  <Text style={styles.autoVerifyText}>
                    For testing: Just click the button below to login
                  </Text>

                  <TouchableOpacity
                    disabled={verifying}
                    onPress={confirmOtp}
                    style={styles.primaryButtonContainer}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colorThemes.primary, colorThemes.accent2]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      {verifying ? (
                        <ActivityIndicator
                          size="small"
                          color={colorThemes.textLight}
                        />
                      ) : (
                        <Text style={styles.buttonText}>LOGIN WITH 0000</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Didn't receive the code?
                  </Text>
                  {resendDisabled ? (
                    <Text style={styles.countdownText}>
                      {" "}
                      Resend in {countdown}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={resendOtp}
                      disabled={loading}
                      style={styles.resendButtonContainer}
                    >
                      <Text style={styles.resendButton}> Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animatable.View>
            ) : (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Confirm Number</Text>
                  <Text style={styles.modalSubtitle}>
                    We will send a verification code to
                  </Text>
                  <Text style={styles.phoneNumberText}>+91 {number}</Text>
                </View>

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => setShowConfirm(false)}
                    style={styles.secondaryButtonContainer}
                    activeOpacity={0.8}
                  >
                    <View style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>EDIT</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsConfirmed(true)}
                    style={styles.primaryButtonContainer}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colorThemes.primary, colorThemes.accent2]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>CONFIRM</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animatable.View>
            )}
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  backgroundImageStyle: {
    opacity: 0.15,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
    // borderRadius: 40,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: colorThemes.primary,
    marginBottom: 24,
    letterSpacing: 1,
  },
  title: {
    color: colorThemes.textPrimary,
    fontWeight: "700",
    fontSize: 32,
    marginBottom: 12,
  },
  subtitle: {
    color: colorThemes.textSecondary,
    fontSize: 16,
    textAlign: "center",
    maxWidth: "80%",
  },
  formContainer: {
    width: "100%",
    marginBottom: 24,
  },
  input: {
    backgroundColor: colorThemes.background,
    marginBottom: 8,
  },
  errorText: {
    color: colorThemes.error,
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  mainButtonContainer: {
    width: "100%",
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: colorThemes.textLight,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  footerText: {
    color: colorThemes.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colorThemes.primary,
    fontWeight: "600",
  },

  // Modal styles
  modalContainer: {
    margin: 24,
  },
  modalContent: {
    backgroundColor: colorThemes.background,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colorThemes.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colorThemes.textSecondary,
    textAlign: "center",
  },
  phoneNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: colorThemes.primary,
    marginTop: 8,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    gap: 16,
  },
  secondaryButtonContainer: {
    flex: 0.4,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  primaryButtonContainer: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    borderRadius: 12,
    backgroundColor: colorThemes.backgroundLight,
  },
  secondaryButtonText: {
    color: colorThemes.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  otpInputContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  verifyButtonContainer: {
    width: "100%",
    marginTop: 24,
    marginBottom: 8,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 4,
  },
  resendText: {
    color: colorThemes.textSecondary,
    fontSize: 14,
  },
  countdownText: {
    color: colorThemes.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  resendButtonContainer: {
    marginLeft: 4,
  },
  resendButton: {
    color: colorThemes.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  autoVerifyText: {
    color: colorThemes.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
});

export default OTP;
