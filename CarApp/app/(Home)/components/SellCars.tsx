import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DeleteableCarousol from "./deleteableCarousol";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/app/context/userContext";
import {
  postCarForApproval,
  uploadImages,
} from "../Services/backendoperations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colorThemes, { typography } from "@/app/theme";
import { Picker } from "@react-native-picker/picker";
import NetInfo from "@react-native-community/netinfo";
// @ts-ignore
import ImageCropper from 'expo-image-cropper';

// Car brands list
const carBrands = [
  "Ashok Leyland",
  "Audi",
  "Bentley",
  "BMW",
  "Chevrolet",
  "Datsun",
  "Ferrari",
  "Fiat",
  "Force Motors",
  "Ford",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Mahindra",
  "Maruti Suzuki",
  "Maserati",
  "Mercedes-Benz",
  "MG (Morris Garages)",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Renault",
  "Rolls Royce",
  "Skoda",
  "Tata",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

// Custom Alert Component
const CustomAlert = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[];
  onClose: () => void;
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.alertOverlay}>
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.alertButtonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'destructive' && styles.alertButtonDestructive,
                  button.style === 'cancel' && styles.alertButtonCancel,
                ]}
                onPress={() => {
                  button.onPress?.();
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.alertButtonText,
                    button.style === 'destructive' && styles.alertButtonTextDestructive,
                    button.style === 'cancel' && styles.alertButtonTextCancel,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function SellCars() {
  const { user, forceSetUser } = useAuth();
  const [carBrand, setCarBrand] = useState<string>("");
  const [carModel, setCarModel] = useState<string>("");
  const [exceptedPrice, setExceptedPrice] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("Petrol");
  const [km, setKm] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [modelYear, setModelYear] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerNumber, setOwnerNumber] = useState<string>("1st Owner");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [transmissionType, setTransmissionType] = useState<string>("Manual");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [cropping, setCropping] = useState(false);
  const [cropUri, setCropUri] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[];
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideCustomAlert = () => {
    setAlertVisible(false);
    setAlertConfig({ title: '', message: '', buttons: [] });
  };

  useEffect(() => {
    const getPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showCustomAlert(
          "Permission Required",
          "Please grant camera roll access to upload images.",
          [{ text: "OK", onPress: () => {} }]
        );
      }
    };

    getPermissions();
  }, []);

  const pickImage = async () => {
    if (images.length >= 7) {
      showCustomAlert(
        "Too Many Images",
        "You can only upload up to 7 images.",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showCustomAlert(
          "Permission Required",
          "Please grant camera roll access to upload images.",
          [{ text: "OK", onPress: () => {} }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (result && !result.canceled && result.assets?.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setImageModalVisible(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showCustomAlert(
        "Error",
        "Failed to pick image. Please try again.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  const removeAllImages = () => {
    showCustomAlert(
      "Remove All Images",
      "Are you sure you want to remove all uploaded images?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove All", style: "destructive", onPress: () => setImages([]) },
      ]
    );
  };

  const clearData = () => {
    setCarBrand("");
    setCarModel("");
    setExceptedPrice("");
    setFuelType("");
    setKm("");
    setLocation("");
    setModelYear("");
    setOwnerName("");
    setOwnerNumber("1st Owner");
    setPhoneNumber("");
    setPhoneNumberError("");
    setRegistrationNumber("");
    setTransmissionType("");
    setDescription("");
    setImages([]);
  };

  const isFormValid = (): boolean => {
    const isPhoneNumberValid = phoneNumber.length === 10;

    return Boolean(
      carBrand &&
        carModel &&
        exceptedPrice &&
        images.length &&
        km &&
        location &&
        modelYear &&
        ownerName &&
        isPhoneNumberValid &&
        registrationNumber &&
        description
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isFormValid()) {
      showCustomAlert(
        "Required Fields Missing",
        "Please fill in all required fields before submitting.",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    if (phoneNumber.length !== 10) {
      showCustomAlert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit phone number.",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    setLoading(true);
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        showCustomAlert(
          "No Internet Connection",
          "Please check your internet connection and try again.",
          [{ text: "OK", onPress: () => {} }]
        );
        return;
      }

      const uploadResult = await uploadImages(images);
      if (!uploadResult.success) {
        throw new Error(
          (uploadResult as any).message || "Failed to upload images"
        );
      }

      console.log(uploadResult.imageUrls);

      const finalFormData = {
        carBrand: carBrand,
        carModel: carModel,
        carStatus: "pending",
        exceptedPrice: parseInt(exceptedPrice),
        fuelType: fuelType,
        km: parseInt(km),
        location: location,
        modelYear: modelYear,
        ownerName: ownerName,
        ownerNumber: ownerNumber,
        phoneNumber: phoneNumber,
        postedBy: user?.id,
        postedDate: new Date().toISOString().split("T")[0],
        registrationNumber: registrationNumber,
        description: description,
        transmissionType: transmissionType,
        images: uploadResult.imageUrls,
      };

      console.log("Car Data:", finalFormData);
      const response = await postCarForApproval(finalFormData);
      if (response.success) {
        setShowSuccess(true);
        const storedData = await AsyncStorage.getItem("userDetails");
        if (storedData != null) {
          const data = JSON.parse(storedData);
          data.onSaleCars.push(response.carId);
          await AsyncStorage.setItem("userDetails", JSON.stringify(data));
          forceSetUser();
        }
        clearData();
      }
    } catch (error) {
      showCustomAlert(
        "Error",
        error instanceof Error ? error.message : "Failed to submit car listing",
        [{ text: "OK", onPress: () => {} }]
      );
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) =>
    (1990 + i).toString()
  );

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <FontAwesome
              name="car"
              size={28}
              color={colorThemes.primary}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.headerText}>Sell Your Car</Text>
          </View>
          <View style={styles.headerAccentBar} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle Photos</Text>
            <Text style={styles.sectionSubtitle}>
              Upload up to 7 Images of your car.
            </Text>
          </View>
          <View style={styles.imagePickerContainer}>
            {images.length === 0 ? (
              <TouchableOpacity
                style={styles.uploadButtonContainer}
                onPress={pickImage}
              >
                <View style={styles.uploadContainer}>
                  <FontAwesome
                    name="cloud-upload"
                    size={40}
                    color={colorThemes.primary0}
                  />
                  <Text style={styles.uploadText}>Upload Photos</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.carouselContainer}>
                  <DeleteableCarousol images={images} setImages={setImages} />
                </View>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <TouchableOpacity
                      style={[styles.uploadButton, images.length >= 7 && styles.disabledUploadButton]}
                      onPress={pickImage}
                      disabled={images.length >= 7}
                    >
                      <FontAwesome
                        name="cloud-upload"
                        size={20}
                        color={images.length < 7 ? colorThemes.primary : colorThemes.grey}
                      />
                      <Text
                        style={[
                          styles.uploadMoreText,
                          {
                            color: images.length < 7 ? colorThemes.primary : colorThemes.grey,
                          },
                        ]}
                      >
                        {images.length < 7 ? "Add More Photos" : "Maximum Photos Added"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        { backgroundColor: colorThemes.error, borderColor: colorThemes.error },
                        images.length === 0 && { opacity: 0.5 },
                      ]}
                      onPress={removeAllImages}
                      disabled={images.length === 0}
                    >
                      <FontAwesome name="trash" size={20} color={colorThemes.textLight} />
                      <Text style={[styles.uploadMoreText, { color: colorThemes.textLight }]}>Remove All</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
          </View>

          <View style={styles.inputPicker}>
            <Text style={styles.pickerLabel}>Car Brand</Text>
            <Picker
              dropdownIconColor={colorThemes.grey}
              selectedValue={carBrand}
              onValueChange={(itemValue) => setCarBrand(itemValue)}
            >
              <Picker.Item
                label="Select Car Brand"
                value=""
                color={colorThemes.grey}
              />
              {carBrands.map((brand) => (
                <Picker.Item key={brand} label={brand} value={brand} />
              ))}
            </Picker>
          </View>

          <TextInput
            value={carModel}
            onChangeText={(text) => setCarModel(text)}
            placeholder="Car Model Name"
            placeholderTextColor={colorThemes.grey}
            style={styles.textInput}
          />

          <View style={styles.inputPicker}>
            <Picker
              dropdownIconColor={colorThemes.grey}
              selectedValue={modelYear}
              onValueChange={(itemValue) => setModelYear(itemValue)}
            >
              <Picker.Item
                label="Select Model Year"
                color={colorThemes.grey}
                value=""
              />
              {years.reverse().map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>

          <TextInput
            value={registrationNumber}
            onChangeText={(text) => setRegistrationNumber(text)}
            placeholder="Registration Number"
            placeholderTextColor={colorThemes.grey}
            style={[styles.textInput, { marginBottom: 20 }]}
          />

          <View style={styles.formGrid}>
            <View style={styles.formColumn}>
              <View style={styles.inputPicker}>
                <Text style={styles.pickerLabel}>Fuel Type</Text>
                <Picker
                  dropdownIconColor={colorThemes.grey}
                  selectedValue={fuelType}
                  onValueChange={(itemValue) => setFuelType(itemValue)}
                >
                  <Picker.Item label="Petrol" value="Petrol" />
                  <Picker.Item label="Diesel" value="Diesel" />
                  <Picker.Item label="CNG" value="CNG" />
                  <Picker.Item label="EV" value="EV" />
                  <Picker.Item label="Hybrid" value="Hybrid" />
                </Picker>
              </View>
            </View>

            <View style={styles.formColumn}>
              <View style={styles.inputPicker}>
                <Text style={styles.pickerLabel}>Transmission Type</Text>
                <Picker
                  dropdownIconColor={colorThemes.grey}
                  selectedValue={transmissionType}
                  onValueChange={(itemValue) => setTransmissionType(itemValue)}
                >
                  <Picker.Item label="Manual" value="Manual" />
                  <Picker.Item label="Auto" value="Automatic" />
                </Picker>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pricing & Specifications</Text>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.formColumn}>
              <TextInput
                value={exceptedPrice}
                onChangeText={(text) => {
                  const cleanedText = text.replace(/[^0-9]/g, "");
                  setExceptedPrice(cleanedText);
                }}
                placeholder="Price (₹)"
                keyboardType="number-pad"
                placeholderTextColor={colorThemes.grey}
                style={styles.textInput}
              />
            </View>

            <View style={styles.formColumn}>
              <TextInput
                value={km}
                onChangeText={(text) => {
                  const cleanedText = text.replace(/[^0-9]/g, "");
                  setKm(cleanedText);
                }}
                placeholder="Km Driven"
                keyboardType="number-pad"
                placeholderTextColor={colorThemes.grey}
                style={styles.textInput}
              />
            </View>
          </View>

          <TextInput
            value={description}
            onChangeText={(text) => setDescription(text)}
            placeholder="Vehicle Description"
            placeholderTextColor={colorThemes.grey}
            style={[styles.textInput, styles.textAreaInput]}
            numberOfLines={4}
            multiline={true}
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
          </View>

          <View style={styles.inputPicker}>
            <Text style={styles.pickerLabel}>Owner Number</Text>
            <Picker
              dropdownIconColor={colorThemes.grey}
              selectedValue={ownerNumber}
              onValueChange={(itemValue) => setOwnerNumber(itemValue)}
            >
              <Picker.Item label="1st Owner" value="1st Owner" />
              <Picker.Item label="2nd Owner" value="2nd Owner" />
              <Picker.Item label="3rd Owner" value="3rd Owner" />
              <Picker.Item label="4th Owner" value="4th Owner" />
              <Picker.Item label="5th Owner" value="5th Owner" />
              <Picker.Item label="5+ Owner" value="5+ Owner" />
            </Picker>
          </View>

          <TextInput
            value={ownerName}
            onChangeText={(text) => setOwnerName(text)}
            placeholder="Owner Name"
            placeholderTextColor={colorThemes.grey}
            style={styles.textInput}
          />

          <View>
            <TextInput
              value={phoneNumber}
              onChangeText={(text) => {
                const cleanedText = text.replace(/[^0-9]/g, "");
                setPhoneNumber(cleanedText);

                if (cleanedText.length > 0 && cleanedText.length !== 10) {
                  setPhoneNumberError("Phone number must be 10 digits");
                } else {
                  setPhoneNumberError("");
                }
              }}
              placeholder="Phone Number"
              keyboardType="number-pad"
              placeholderTextColor={colorThemes.grey}
              style={[
                styles.textInput,
                phoneNumber.length > 0 &&
                  phoneNumber.length !== 10 &&
                  styles.inputError,
              ]}
              maxLength={10}
            />
            {phoneNumberError ? (
              <Text style={styles.errorText}>{phoneNumberError}</Text>
            ) : null}
          </View>

          <TextInput
            value={location}
            onChangeText={(text) => setLocation(text)}
            placeholder="Address"
            placeholderTextColor={colorThemes.grey}
            style={[styles.textInput, styles.textAreaInput]}
            numberOfLines={3}
            multiline={true}
          />
        </View>

        <Animated.View style={[styles.submitButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPressIn={isFormValid() ? handlePressIn : undefined}
            onPressOut={isFormValid() ? handlePressOut : undefined}
            onPress={handleSubmit}
            disabled={!isFormValid()}
          >
            {!isFormValid() ? (
              <View style={styles.disabledButton}>
                <Text style={styles.submitButtonText}>Submit For Approval</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[colorThemes.primary, colorThemes.accent2, colorThemes.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colorThemes.textLight} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit For Approval</Text>
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <FontAwesome name="check-circle" size={72} color={colorThemes.success || '#22c55e'} style={{ marginBottom: 18 }} />
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successSubtitle}>Your car listing has been submitted for approval.</Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setShowSuccess(false)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colorThemes.primary, colorThemes.accent2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successButtonGradient}
              >
                <Text style={styles.successButtonText}>Back to Home</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {imageModalVisible && selectedImage && (
        <View style={styles.cropperOverlay}>
          <View style={styles.cropperModal}>
            <Text style={styles.modalTitle}>Preview Image</Text>
            <View style={styles.imagePreview}>
              <Animated.Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
            </View>
            {isProcessing && <ActivityIndicator size="large" color={colorThemes.primary} style={styles.processingIndicator} />}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cropperFooterBtn, styles.retakeBtn]}
                onPress={pickImage}
                disabled={isProcessing}
              >
                <FontAwesome name="refresh" size={18} color={colorThemes.textLight} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cropperFooterBtn, styles.cropBtn]}
                onPress={async () => {
                  setIsProcessing(true);
                  setImageModalVisible(false);
                  setCropping(true);
                  setCropUri(selectedImage);
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
              >
                <FontAwesome name="crop" size={18} color={colorThemes.textLight} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Crop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cropperFooterBtn, styles.cancelBtn]}
                onPress={() => {
                  setImageModalVisible(false);
                  setSelectedImage(null);
                }}
                disabled={isProcessing}
              >
                <FontAwesome name="times" size={18} color={colorThemes.textPrimary} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { color: colorThemes.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cropperFooterBtn, styles.useOriginalBtn]}
                onPress={async () => {
                  setIsProcessing(true);
                  setImageModalVisible(false);
                  const compressedImage = await ImageManipulator.manipulateAsync(
                    selectedImage!,
                    [{ resize: { width: 800 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                  );
                  setImages((prev) => [...prev, compressedImage.uri]);
                  setSelectedImage(null);
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
              >
                <FontAwesome name="check" size={18} color={colorThemes.textLight} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Use Original</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {cropping && cropUri && (
        <View style={styles.cropperOverlay} key={cropUri}>
          <ImageCropper
            imageUri={cropUri}
            onCancel={() => {
              setCropping(false);
              setCropUri(null);
              setTimeout(() => {
                setCropping(false);
                setCropUri(null);
              }, 300);
            }}
            onDone={async (croppedUri: string) => {
              setIsProcessing(true);
              setCropping(false);
              setCropUri(null);
              setTimeout(() => {
                setCropping(false);
                setCropUri(null);
              }, 300);
              try {
                const compressedImage = await ImageManipulator.manipulateAsync(
                  croppedUri,
                  [{ resize: { width: 800 } }],
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                setImages((prev) => [...prev, compressedImage.uri]);
              } catch (e) {
                showCustomAlert(
                  'Error',
                  'Failed to process cropped image.',
                  [{ text: "OK", onPress: () => {} }]
                );
              }
              setIsProcessing(false);
            }}
            mode="rectangle"
            lockAspectRatio={false}
            renderFooter={({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
                <TouchableOpacity
                  style={{ flex: 1, marginRight: 8, backgroundColor: colorThemes.greyLight, borderRadius: 10, padding: 12, alignItems: 'center' }}
                  onPress={() => {
                    setCropping(false);
                    setCropUri(null);
                    setTimeout(() => {
                      setCropping(false);
                      setCropUri(null);
                    }, 300);
                  }}
                >
                  <Text style={{ color: colorThemes.textPrimary, fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, marginHorizontal: 8, backgroundColor: colorThemes.primary, borderRadius: 10, padding: 12, alignItems: 'center' }}
                  onPress={onDone}
                >
                  <Text style={{ color: colorThemes.textLight, fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideCustomAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorThemes.background,
  },
  headerWrapper: {
    marginHorizontal: 15,
    marginTop: 22,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    color: colorThemes.primary,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "left",
    marginBottom: 0,
  },
  headerAccentBar: {
    height: 4,
    width: 56,
    backgroundColor: colorThemes.accent2,
    borderRadius: 2,
    marginTop: 4,
    marginLeft: 38,
    marginBottom: 6,
  },
  sectionContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 18,
    backgroundColor: colorThemes.backgroundLight,
    borderRadius: 18,
    shadowColor: colorThemes.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    marginBottom: 15,
    borderBottomWidth: 0,
    paddingBottom: 0,
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    color: colorThemes.primary,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
    marginBottom: 6,
  },
  formGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  formColumn: {
    width: "48%",
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  uploadButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  uploadContainer: {
    height: 180,
    width: "100%",
    backgroundColor: colorThemes.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colorThemes.accent2,
  },
  uploadText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.accent2,
    letterSpacing: 0.5,
  },
  uploadButton: {
    flexDirection: "row",
    width: "85%",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: colorThemes.backgroundLight,
    borderWidth: 1,
    borderColor: colorThemes.accent2,
    shadowColor: colorThemes.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  uploadMoreText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.primary,
    letterSpacing: 0.3,
  },
  disabledUploadButton: {
    borderColor: colorThemes.greyLight,
    backgroundColor: colorThemes.backgroundDark,
  },
  textInput: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    lineHeight: typography.lineHeights.body1,
    color: colorThemes.textPrimary,
    backgroundColor: colorThemes.background,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colorThemes.greyLight,
    borderRadius: 10,
    letterSpacing: typography.letterSpacing.normal,
    shadowColor: colorThemes.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  inputPicker: {
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: colorThemes.greyLight,
    borderRadius: 10,
    backgroundColor: colorThemes.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pickerLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    color: colorThemes.textSecondary,
    marginBottom: 4,
    marginStart: 12,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  submitButtonContainer: {
    margin: 15,
    borderRadius: 18,
    overflow: "visible",
    shadowColor: colorThemes.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  submitButton: {
    paddingVertical: 22,
    paddingHorizontal: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    shadowColor: colorThemes.accent2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  disabledButton: {
    paddingVertical: 22,
    paddingHorizontal: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorThemes.greyLight,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: 'transparent',
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    color: colorThemes.error,
    marginLeft: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  inputError: {
    borderColor: colorThemes.error,
  },
  carouselContainer: {
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  successCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: colorThemes.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  successTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 32,
    color: colorThemes.success || '#22c55e',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  successSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: 18,
    color: colorThemes.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 26,
  },
  successButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  successButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  successButtonText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: 18,
    color: colorThemes.textLight,
    letterSpacing: 0.5,
  },
  cropperOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropperModal: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: '90%',
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 18,
    fontWeight: 'bold',
    color: colorThemes.textPrimary,
    marginBottom: 10,
  },
  imagePreview: {
    width: 240,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  processingIndicator: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  cropperFooterBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    minWidth: '45%',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body2,
    fontWeight: 'bold',
    color: colorThemes.textLight,
  },
  cancelBtn: {
    backgroundColor: colorThemes.greyLight,
  },
  cropBtn: {
    backgroundColor: colorThemes.primary,
  },
  retakeBtn: {
    backgroundColor: colorThemes.accent2,
  },
  useOriginalBtn: {
    backgroundColor: colorThemes.success || '#22c55e',
  },
  // Custom Alert Styles
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  alertCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: colorThemes.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  alertTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h3,
    color: colorThemes.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body1,
    color: colorThemes.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  alertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  alertButton: {
    flex: 1,
    backgroundColor: colorThemes.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonCancel: {
    backgroundColor: colorThemes.greyLight,
  },
  alertButtonDestructive: {
    backgroundColor: colorThemes.error,
  },
  alertButtonText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.body1,
    color: colorThemes.textLight,
    fontWeight: 'bold',
  },
  alertButtonTextCancel: {
    color: colorThemes.textPrimary,
  },
  alertButtonTextDestructive: {
    color: colorThemes.textLight,
  },
});