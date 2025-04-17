import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import colorThemes from "../theme";
import { Modal, Portal } from "react-native-paper";
import { OtpInput } from "react-native-otp-entry";
import { useRouter } from "expo-router";
import { checkForRegisteredUser } from "../(Home)/Services/backendoperations";
import { useAuth } from "../context/userContext";
import Signup from "./Signup";

const OTP = () => {
  const [number, setNumber] = useState("");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [otp, setOtp] = useState("");

  const [validOtp, setValidOtp] = useState("0000");
  const [isNew, setIsNew] = useState<boolean>(false);

  const router = useRouter();
  const { forceSetUser } = useAuth();

  const confirmNumber = async () => {
    setShowConfirm(true);
  };

  const confirmOtp = async () => {
    if (otp == validOtp) {
      console.log("successfully logged In");
      const isRegistered = await checkForRegisteredUser(number);
      setIsNew(!isRegistered);
      if (isRegistered) {
        forceSetUser();
        router.replace("/home");
      }
    }
  };

  return isNew ? (
    <Signup phone={number} />
  ) : (
    <>
      <Portal>
        <Modal
          visible={showConfirm}
          dismissable={isConfirmed}
          onDismiss={() => {
            setShowConfirm(false);
            setIsConfirmed(false);
            setOtp("");
          }}
        >
          <View style={modalStyles.container}>
            {isConfirmed ? (
              <View style={{ gap: 10 }}>
                <Text style={modalStyles.confirmNumber}>ENTER OTP</Text>
                <View style={{ paddingHorizontal: 20 }}>
                  <OtpInput
                    numberOfDigits={4}
                    focusColor={colorThemes.primary1}
                    type="numeric"
                    onTextChange={(text) => setOtp(text)}
                    theme={{
                      pinCodeTextStyle: {
                        color: colorThemes.grey,
                      },
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => otp.length == 4 && confirmOtp()}
                >
                  <View
                    style={[
                      modalStyles.confirmOTP,
                      otp.length == 4
                        ? { backgroundColor: colorThemes.primary0 }
                        : { backgroundColor: colorThemes.grey },
                    ]}
                  >
                    <Text
                      style={[
                        modalStyles.buttonText,
                        { fontSize: 18, letterSpacing: 2 },
                      ]}
                    >
                      CONFIRM
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={{ gap: 10 }}>
                  <Text style={modalStyles.confirmText}>
                    Confirm Your Number
                  </Text>
                  <Text style={modalStyles.confirmNumber}>{number}</Text>
                </View>
                <View style={modalStyles.confirmButtonss}>
                  <TouchableOpacity onPress={() => setShowConfirm(false)}>
                    <View
                      style={[
                        modalStyles.buttons,
                        { backgroundColor: colorThemes.grey },
                      ]}
                    >
                      <Text style={modalStyles.buttonText}>CHANGE</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsConfirmed(true)}>
                    <View
                      style={[
                        modalStyles.buttons,
                        { backgroundColor: colorThemes.primary0 },
                      ]}
                    >
                      <Text style={modalStyles.buttonText}>CONFIRM</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>
      </Portal>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={styles.container}>
          <View style={{ gap: 2 }}>
            <Text style={styles.title}>Welcome!</Text>
            <View style={{ paddingEnd: 40 }}>
              <Text style={styles.titleDescription}>
                Please enter your number in order to continue...
              </Text>
            </View>
          </View>

          {/* ////////// NUMBER SECTION ///////////// */}
          <>
            <TextInput
              keyboardType="number-pad"
              value={number}
              onChangeText={(text) => {
                // Remove non-numeric characters & limit to 10 digits
                const cleanedText = text.replace(/[^0-9]/g, "");
                setNumber(cleanedText);
              }}
              placeholder="00000 00000"
              placeholderTextColor={colorThemes.primary0}
              style={styles.phoneNumberInput}
              maxLength={10} // Prevents more than 10 characters
            />
          </>
        </View>

        {/* //////////// GET OTP BUTTON /////////// */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={
              number.length == 10 ? styles.getOtpButton : styles.disabledButton
            }
            onPress={() => number.length == 10 && confirmNumber()}
          >
            <Text style={styles.getOtpText}>GET OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colorThemes.primary1,
    fontWeight: 800,
    fontSize: 48,
    letterSpacing: 2.5,
  },
  titleDescription: {
    fontWeight: 500,
    fontSize: 17,
    letterSpacing: 1.3,
    color: colorThemes.grey,
  },
  container: {
    height: "50%",
    padding: 20,
    margin: 2,
    justifyContent: "space-evenly",
  },

  phoneNumberInput: {
    padding: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderColor: colorThemes.primary2,
    fontSize: 27,
    color: colorThemes.primary0,
    fontWeight: 500,
    letterSpacing: 5,
  },

  buttonSection: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  getOtpButton: {
    padding: 10,
    borderRadius: 5,
    elevation: 20,
    backgroundColor: colorThemes.primary1,
  },

  disabledButton: {
    padding: 10,
    borderRadius: 5,
    elevation: 20,
    backgroundColor: colorThemes.grey,
  },
  getOtpText: {
    textAlign: "center",
    color: "white",
    fontWeight: 700,
    letterSpacing: 1.5,
    fontSize: 18,
  },
});

const modalStyles = StyleSheet.create({
  container: {
    width: "80%",
    alignSelf: "center",
    padding: 15,
    backgroundColor: "white",
    gap: 20,
    borderRadius: 10,
  },

  confirmText: {
    fontWeight: 600,
    fontSize: 17,
    letterSpacing: 1.2,
    color: colorThemes.grey,
    textAlign: "center",
  },
  confirmButtonss: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  confirmNumber: {
    textAlign: "center",
    color: colorThemes.primary1,
    fontSize: 22,
    fontWeight: 800,
    paddingVertical: 10,
    letterSpacing: 2,
  },

  buttons: {
    padding: 7,
    paddingVertical: 12,
    width: 90,
    borderRadius: 7,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: 800,
    color: "white",
  },
  confirmOTP: {
    marginHorizontal: 32,
    padding: 10,
    paddingVertical: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});

export default OTP;
