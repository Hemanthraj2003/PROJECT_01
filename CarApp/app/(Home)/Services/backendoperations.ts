import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_URL = "http://192.168.1.44:5000";
const API_URL = "http://192.168.0.111:5000";
// const API_URL = "http://192.168.1.3:5000";

export const fetchAllCars = async () => {
  console.log("fetching all cars ...");

  try {
    const response = await fetch(`${API_URL}/cars`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllFilteredCars = async (filterParams: any[]) => {
  try {
    const response = await fetch(`${API_URL}/cars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: filterParams }),
    });

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchCarsById = async (ids: any) => {
  const response = await fetch(`${API_URL}/cars/getMyCars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ carsIds: ids }),
  });
  const data = await response.json();
  // console.log(data);

  if (response.status) {
    // console.log(data.data);

    return data.data;
  }
  return false;
};

export const postCarForApproval = async (carData: any) => {
  try {
    const response = await fetch(`${API_URL}/cars/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    });

    // Check the response status
    const data = await response.json();

    if (response.status === 201) {
      // Successfully added car
      console.log("Car added successfully:", data);
      return { success: true, carId: data.carId };
    } else {
      // Handle any errors
      console.error("Failed to add car:", data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error posting car data:", error);
    return { success: false, message: "Error posting car data" };
  }
};

// USER RELATEDED METHODS
export const registerNewUser = async (userInfo: any) => {
  const dataToPost = {
    ...userInfo,
    boughtCars: [],
    soldCars: [],
    onSaleCars: [],
    likedCars: [],
  };

  try {
    const response = await fetch(`${API_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToPost),
    });
    console.log(response);

    const data = await response.json();

    if (data.success) {
      console.log(data);
      AsyncStorage.setItem("userDetails", JSON.stringify(data.data)); // Store user data
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const updateUserData = async (userInfo: any) => {
  try {
    const response = await fetch(`${API_URL}/users/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    const data = await response.json();
    if (data.success) {
      console.log(data);
      AsyncStorage.setItem("userDetails", JSON.stringify(data.data)); // Store user data
      return data.data;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const checkForRegisteredUser = async (
  mailId: string
): Promise<boolean> => {
  try {
    console.log("Number: ", mailId);

    const response = await fetch(
      `${API_URL}/users/isExists?phone=${encodeURIComponent(mailId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success && data.isExists) {
      AsyncStorage.setItem("userDetails", JSON.stringify(data.data)); // Store user data
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking for registered user:", error);
    return false;
  }
};

// Image Upload Methods
export const uploadImages = async (imageUris: string[]) => {
  try {
    const formData = new FormData();

    // Append each image to formData
    for (const uri of imageUris) {
      const filename = uri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("images", {
        uri: uri,
        name: filename,
        type,
      } as any);
    }

    const response = await fetch(`${API_URL}/api/upload-images`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      return {
        success: true,
        imageUrls: data.imageUrls,
      };
    } else {
      throw new Error(data.message || "Failed to upload images");
    }
  } catch (error) {
    console.error("Error uploading images:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload images",
    };
  }
};
