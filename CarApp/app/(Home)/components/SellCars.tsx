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
import { useAuth } from "@/app/context/userContext";
import {
  postCarForApproval,
  uploadImages,
} from "../Services/backendoperations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colorThemes from "@/app/theme";
import { Picker } from "@react-native-picker/picker";

interface FormDataType {
  carBrand: string;
  carModel: string;
  carStatus: string;
  exceptedPrice: number;
  fuelType: string;
  km: number;
  location: string;
  modelYear: string;
  ownerName: string;
  phoneNumber: string;
  postedBy: string;
  postedDate: string;
  registrationNumber: string;
}

export default function SellCars() {
  const { user, setUser, forceSetUser } = useAuth();
  const [carBrand, setCarBrand] = useState<string>("");
  const [carModel, setCarModel] = useState<string>("");
  const [exceptedPrice, setExceptedPrice] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("");
  const [km, setKm] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [modelYear, setModelYear] = useState<string>("");
  const [ownerName, setOwnerName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [registrationNumber, setRegistrationNumber] = useState<string>("");
  const [transmissionType, setTransmissionType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // Form data without images
  const [formData, setFormData] = useState<FormDataType>({
    carBrand: "",
    carModel: "",
    carStatus: "pending",
    exceptedPrice: 0,
    fuelType: "",
    km: 0,
    location: "",
    modelYear: "",
    ownerName: "",
    phoneNumber: "",
    postedBy: user?.id || "",
    postedDate: new Date().toISOString().split("T")[0],
    registrationNumber: "",
  });

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result && !result.canceled && result.assets?.length > 0) {
      const imageUri = result.assets[0].uri;
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
    setPhoneNumber("");
    setRegistrationNumber("");
    setTransmissionType("");
    setDescription("");
    setImages([]);
  };

  // Submit handler
  const handleSubmit = async (): Promise<void> => {
    // Check if all required fields are filled
    if (
      !carBrand ||
      !carModel ||
      !exceptedPrice ||
      !fuelType ||
      !images.length ||
      !km ||
      !location ||
      !modelYear ||
      !ownerName ||
      !phoneNumber ||
      !registrationNumber ||
      !description ||
      !transmissionType
    ) {
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

  return (
    <ScrollView>
      <View
        style={{ marginHorizontal: 15, marginTop: 15, paddingHorizontal: 10 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "600",
            color: colorThemes.primary2,
          }}
        >
          Sell Your Car
        </Text>
      </View>

      <View style={{ gap: 10, padding: 15 }}>
        {/* Image Picker */}
        <>
          <View style={{ alignItems: "center", marginVertical: 15 }}>
            <Text style={{ color: colorThemes.grey }}>
              Select image and click on crop to select image
            </Text>
          </View>

          <View>
            {images.length === 0 ? (
              <TouchableOpacity
                style={{ width: "100%", alignItems: "center" }}
                onPress={pickImage}
              >
                <View style={styles.uploadContainer}>
                  <FontAwesome
                    name="cloud-upload"
                    size={40}
                    color={colorThemes.primary0}
                  />
                  <Text style={{ color: colorThemes.grey, fontSize: 24 }}>
                    Upload
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <>
                <View style={{ alignItems: "center" }}>
                  <DeleteableCarousol images={images} setImages={setImages} />
                </View>
                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={pickImage}
                >
                  <View style={styles.uploadButton}>
                    <FontAwesome
                      name="cloud-upload"
                      size={20}
                      color={
                        images.length < 7 ? colorThemes.primary2 : "#c9c9c9"
                      }
                    />
                    <Text
                      style={{
                        color:
                          images.length < 7 ? colorThemes.primary2 : "#c9c9c9",
                        fontSize: 14,
                      }}
                    >
                      Upload
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>

        {/* Car Brand */}
        <TextInput
          value={carBrand}
          onChangeText={(text) => setCarBrand(text)}
          placeholder="Car Brand"
          placeholderTextColor={colorThemes.grey}
          style={[styles.textInput]}
        />

        {/* Car Model */}
        <TextInput
          value={carModel}
          onChangeText={(text) => setCarModel(text)}
          placeholder="Car Model Name"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />

        {/* Car Year */}
        <TextInput
          value={modelYear}
          onChangeText={(text) => setModelYear(text)}
          placeholder="Car Model Year"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />

        {/* Registration Number */}
        <TextInput
          value={registrationNumber}
          onChangeText={(text) => setRegistrationNumber(text)}
          placeholder="Registration Number"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />
        {/* Excepted Price */}
        <TextInput
          value={exceptedPrice}
          onChangeText={(text) => {
            const cleanedText = text.replace(/[^0-9]/g, "");
            setExceptedPrice(cleanedText);
          }}
          placeholder="Expected Price"
          keyboardType="number-pad"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />
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
        {/* Address */}
        <TextInput
          value={location}
          onChangeText={(text) => setLocation(text)}
          placeholder="Address"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />

        {/* Owner Name */}
        <TextInput
          value={ownerName}
          onChangeText={(text) => setOwnerName(text)}
          placeholder="Owner Name"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
        />
        {/* Owner Phone Number */}
        <TextInput
          value={phoneNumber}
          onChangeText={(text) => {
            const cleanedText = text.replace(/[^0-9]/g, "");
            setPhoneNumber(cleanedText);
          }}
          placeholder="Phone Number"
          keyboardType="number-pad"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
          maxLength={10}
        />
        {/* Car FuelType */}
        <View style={styles.inputPicker}>
          <Text style={styles.pickerLabel}>Fuel Type</Text>
          <Picker
            dropdownIconColor={colorThemes.grey}
            selectedValue={fuelType}
            onValueChange={(itemValue, itemIndex) => setFuelType(itemValue)}
          >
            <Picker.Item label="Petrol" value="Petrol" />
            <Picker.Item label="Diesel" value="Diesel" />
            <Picker.Item label="CNG" value="CNG" />
            <Picker.Item label="EV" value="EV" />
            <Picker.Item label="Hybrid" value="Hybrid" />
          </Picker>
        </View>
        {/* Transmission Type */}
        <View style={styles.inputPicker}>
          <Text style={styles.pickerLabel}>Transmission Type</Text>
          <Picker
            dropdownIconColor={colorThemes.grey}
            selectedValue={transmissionType}
            onValueChange={(itemValue, itemIndex) =>
              setTransmissionType(itemValue)
            }
          >
            <Picker.Item label="Manual" value="Manual" />
            <Picker.Item label="Auto" value="Automatic" />
          </Picker>
        </View>

        {/* Description */}
        <TextInput
          value={description}
          onChangeText={(text) => setDescription(text)}
          placeholder="Description"
          placeholderTextColor={colorThemes.grey}
          style={styles.textInput}
          numberOfLines={4}
          multiline={true}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              letterSpacing: 2,
              fontSize: 17,
            }}
          >
            Submit For Approval
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  uploadContainer: {
    height: 180,
    width: "88%",
    backgroundColor: "#e8e8e8",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderRadius: 10,
  },
  uploadButton: {
    flexDirection: "row",
    width: "85%",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#e8e8e8",
  },
  submitButton: {
    padding: 15,
    alignItems: "center",
    // borderWidth: 2,
    backgroundColor: colorThemes.primary0,
    borderRadius: 10,
    margin: 15,
  },

  textInput: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 10,
    paddingBottom: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    letterSpacing: 1.2,
    color: colorThemes.primary2,
    borderColor: colorThemes.grey,
  },

  inputPicker: {
    paddingHorizontal: 10,
    marginHorizontal: 22,
    marginVertical: 12,
    borderRadius: 1,
  },
  pickerLabel: {
    color: colorThemes.grey,
    fontSize: 14,
    fontWeight: "500",
  },
});
