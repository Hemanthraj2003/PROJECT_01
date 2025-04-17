import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { registerNewUser } from "../(Home)/Services/backendoperations";
import { useAuth } from "../context/userContext";

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
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      <TextInput
        label="Name"
        mode="outlined"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        style={styles.input}
      />

      <TextInput
        label="City"
        mode="outlined"
        value={formData.city}
        onChangeText={(text) => handleChange("city", text)}
        style={styles.input}
      />
      <TextInput
        label="State"
        mode="outlined"
        value={formData.state}
        onChangeText={(text) => handleChange("state", text)}
        style={styles.input}
      />
      <TextInput
        label="Address"
        mode="outlined"
        value={formData.address}
        onChangeText={(text) => handleChange("address", text)}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        disabled={isSubmitDisabled} // Disable submit if validation fails
      >
        Submit
      </Button>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {errorMessage}
      </Snackbar>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
});
