import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
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

export default function SellCars() {
  const { user, forceSetUser } = useAuth();
  const [carBrand, setCarBrand] = useState<string>("");
  const [carModel, setCarModel] = useState<string>("");
  const [exceptedPrice, setExceptedPrice] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("Petrol"); // Initialize with default value
  const [km, setKm] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [modelYear, setModelYear] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerNumber, setOwnerNumber] = useState<string>("1st Owner"); // Initialize with default value
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [transmissionType, setTransmissionType] = useState<string>("Manual"); // Initialize with default value
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Manage images separately
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    };

    getPermissions();
  }, []);

  // Handle image picking
  const pickImage = async () => {
    if (images.length >= 7) {
      alert("Cannot upload more than 7 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // Keep using MediaTypeOptions but note it's deprecated
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result && !result.canceled && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
      // Keep using SaveFormat but note it's deprecated
      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImages((prev) => [...prev, compressedImage.uri]);
    }
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
    setOwnerNumber("1st Owner"); // Reset to default
    setPhoneNumber("");
    setPhoneNumberError("");
    setRegistrationNumber("");
    setTransmissionType("");
    setDescription("");
    setImages([]);
  };

  // Validation function to check if all required fields are filled and valid
  const isFormValid = (): boolean => {
    // Check if phone number is exactly 10 digits
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
        isPhoneNumberValid && // Validate phone number length
        registrationNumber &&
        description
      // fuelType and transmissionType are pre-filled with default values
    );
  };

  // Submit handler
  const handleSubmit = async (): Promise<void> => {
    // Check if all required fields are filled
    if (!isFormValid()) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      // First upload images
      const uploadResult = await uploadImages(images);
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || "Failed to upload images");
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
        ownerNumber: ownerNumber, // Add owner number field
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
        Alert.alert(
          "Success!",
          "Your car listing has been submitted for approval."
        );
        const storedData = await AsyncStorage.getItem("userDetails");
        if (storedData != null) {
          const data = JSON.parse(storedData);
          console.log(response);

          data.onSaleCars.push(response.carId);
          await AsyncStorage.setItem("userDetails", JSON.stringify(data));
          forceSetUser();
        }
        clearData();
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to submit car listing"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate years for the year picker (from 1990 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) =>
    (1990 + i).toString()
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Sell Your Car</Text>
      </View>

      {/* Image Upload Section */}
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
              <TouchableOpacity
                style={styles.uploadMoreButtonContainer}
                onPress={pickImage}
                disabled={images.length >= 7}
              >
                <View
                  style={[
                    styles.uploadButton,
                    images.length >= 7 && styles.disabledUploadButton,
                  ]}
                >
                  <FontAwesome
                    name="cloud-upload"
                    size={20}
                    color={
                      images.length < 7 ? colorThemes.primary : colorThemes.grey
                    }
                  />
                  <Text
                    style={[
                      styles.uploadMoreText,
                      {
                        color:
                          images.length < 7
                            ? colorThemes.primary
                            : colorThemes.grey,
                      },
                    ]}
                  >
                    {images.length < 7
                      ? "Add More Photos"
                      : "Maximum Photos Added"}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Vehicle Details Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
        </View>

        {/* Car Brand */}
        {/* Car Brand - Dropdown */}
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

        {/* Car Model */}
        <TextInput
          value={carModel}
          onChangeText={(text) => setCarModel(text)}
          placeholder="Car Model Name"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />

        {/* Model Year - Picker */}
        <View style={styles.inputPicker}>
          {/* <Text style={styles.pickerLabel}>Model Year</Text> */}
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

        {/* Registration Number */}
        <TextInput
          value={registrationNumber}
          onChangeText={(text) => setRegistrationNumber(text)}
          placeholder="Registration Number"
          placeholderTextColor={colorThemes.grey}
          style={[styles.textInput, { marginBottom: 20 }]}
        />

        {/* Fuel Type and Transmission Type in two columns */}
        <View style={styles.formGrid}>
          {/* Left Column - Fuel Type */}
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

          {/* Right Column - Transmission Type */}
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

      {/* Pricing & Specifications Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pricing & Specifications</Text>
        </View>

        <View style={styles.formGrid}>
          {/* Left Column */}
          <View style={styles.formColumn}>
            {/* Expected Price */}
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

          {/* Right Column */}
          <View style={styles.formColumn}>
            {/* Km Driven */}
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

        {/* Description - Full Width */}
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

      {/* Owner Information Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
        </View>

        {/* Owner Number - Dropdown */}
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

        {/* Owner Name - Full Width */}
        <TextInput
          value={ownerName}
          onChangeText={(text) => setOwnerName(text)}
          placeholder="Owner Name"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />

        {/* Owner Phone Number - Full Width */}
        <View>
          <TextInput
            value={phoneNumber}
            onChangeText={(text) => {
              const cleanedText = text.replace(/[^0-9]/g, "");
              setPhoneNumber(cleanedText);

              // Validate phone number length
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

        {/* Address - Full Width as TextArea */}
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

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButtonContainer}
        onPress={handleSubmit}
        disabled={!isFormValid()}
        // activeOpacity={0.8}
      >
        {!isFormValid() ? (
          <View style={styles.disabledButton}>
            <Text style={styles.submitButtonText}>Submit For Approval</Text>
          </View>
        ) : (
          <LinearGradient
            colors={[colorThemes.primary, colorThemes.accent2]}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorThemes.background,
  },
  headerContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colorThemes.greyLight,
    paddingBottom: 15,
  },
  headerText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.h1,
    lineHeight: typography.lineHeights.h1,
    color: colorThemes.primary,
    marginBottom: 5,
  },
  sectionContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    backgroundColor: colorThemes.backgroundLight,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colorThemes.greyLight,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    color: colorThemes.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.textSecondary,
  },
  formGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  formColumn: {
    width: "48%",
  },
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 10,
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
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colorThemes.accent2,
  },
  uploadText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.accent2,
  },
  uploadButton: {
    flexDirection: "row",
    width: "85%",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: colorThemes.backgroundLight,
    borderWidth: 1,
    borderColor: colorThemes.accent2,
  },
  uploadMoreButtonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  uploadMoreText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.body2,
    lineHeight: typography.lineHeights.body2,
    color: colorThemes.primary,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    borderRadius: 8,
    letterSpacing: typography.letterSpacing.normal,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  inputPicker: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colorThemes.greyLight,
    borderRadius: 8,
    backgroundColor: colorThemes.background,
  },
  pickerLabel: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    color: colorThemes.textSecondary,
    marginBottom: 4,
    marginStart: 12,
    marginTop: 8,
  },
  submitButtonContainer: {
    margin: 15,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.subtitle1,
    lineHeight: typography.lineHeights.subtitle1,
    color: colorThemes.textLight,
    letterSpacing: typography.letterSpacing.wide,
  },
  disabledButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: colorThemes.grey,
    opacity: 0.7,
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
});
