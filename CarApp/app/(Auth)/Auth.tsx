import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { checkForRegisteredUser } from "../(Home)/Services/backendoperations";
import Signup from "./Signup";
import { useAuth } from "../context/userContext";
import { TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import colorThemes from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/app/theme";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const { forceSetUser } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    // Reset error state
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const isOldUser = await checkForRegisteredUser(email);

      if (isOldUser) {
        forceSetUser();
        router.replace("/home");
      } else {
        setIsNew(true);
      }
    } catch (error) {
      console.error("Sign-In Error:", error);
      setEmailError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return !isNew ? (
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in with your email to continue
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={
                <TextInput.Icon
                  icon="email"
                  color={colorThemes.textSecondary}
                />
              }
              style={styles.input}
              outlineColor={
                emailError ? colorThemes.error : colorThemes.greyLight
              }
              activeOutlineColor={colorThemes.primary}
              error={!!emailError}
              theme={{ colors: { primary: colorThemes.primary } }}
            />

            {emailError ? (
              <Text style={styles.errorText}>
                <Ionicons name="alert-circle" size={14} /> {emailError}
              </Text>
            ) : null}

            <TouchableOpacity
              disabled={loading}
              onPress={handleSignIn}
              style={styles.buttonContainer}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colorThemes.primary, colorThemes.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.phoneLoginButton}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colorThemes.primary}
                style={styles.phoneIcon}
              />
              <Text style={styles.phoneLoginText}>
                Sign in with Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Text style={styles.footerLink}>Sign Up</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  ) : (
    <Signup phone={email} />
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
    borderRadius: 40,
    marginBottom: 16,
  },
  appName: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    color: colorThemes.primary,
    marginBottom: 24,
    letterSpacing: typography.letterSpacing.wide,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h1,
    lineHeight: typography.lineHeights.h1,
    color: colorThemes.textPrimary,
    marginBottom: 12,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textSecondary,
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
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.error,
    marginBottom: 16,
    marginLeft: 4,
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
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colorThemes.textLight,
    margin: 3,
    opacity: 0.8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colorThemes.greyLight,
  },
  dividerText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  phoneLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colorThemes.primary,
    borderRadius: 12,
    backgroundColor: "rgba(248, 57, 2, 0.05)",
  },
  phoneIcon: {
    marginRight: 8,
  },
  phoneLoginText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.primary,
  },
  footerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  footerText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
  },
  footerLink: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.primary,
  },
});

export default Auth;
