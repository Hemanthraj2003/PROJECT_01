import { DEVAPI, PRODAPI } from "@/app/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// Production API URL
const API_URL = PRODAPI;

// Common error handling utility
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error("SERVER_ERROR"); // Special error type for server errors
    }
    const error = await response.json().catch(() => ({
      message: "Unknown error occurred",
    }));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
};

// Network check utility
const checkNetwork = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error("OFFLINE");
  }
};

// Error handling wrapper for API calls
const withErrorHandling = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  try {
    await checkNetwork();
    return await apiCall();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "OFFLINE") {
        throw new Error(
          "You are offline. Please check your internet connection."
        );
      } else if (error.message === "SERVER_ERROR") {
        throw new Error("Server error occurred. Please try again later.");
      }
      throw error;
    }
    throw new Error("An unexpected error occurred");
  }
};

export const fetchAllCars = async (page: number = 1, limit: number = 10) => {
  return withErrorHandling(async () => {
    const response = await fetch(
      `${API_URL}/cars?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await handleApiResponse(response);
    if (data.success) {
      return {
        cars: data.data,
        pagination: data.pagination,
      };
    }
    throw new Error(data.message || "Failed to fetch cars");
  });
};

export const fetchAllFilteredCars = async (
  filterParams: any[] = [],
  searchTerm: string = "",
  page: number = 1,
  limit: number = 10
) => {
  return withErrorHandling(async () => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (searchTerm) {
      queryParams.append("searchTerm", searchTerm);
    }

    const response = await fetch(`${API_URL}/cars?${queryParams.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: filterParams }),
    });

    const data = await handleApiResponse(response);
    if (data.success) {
      return {
        cars: data.data,
        pagination: data.pagination,
      };
    }
    throw new Error(data.message || "Failed to fetch filtered cars");
  });
};

export const fetchCarsById = async (ids: string[]) => {
  return withErrorHandling(async () => {
    if (!ids || ids.length === 0) {
      return [];
    }

    const response = await fetch(`${API_URL}/cars/getMyCars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ carsIds: ids }),
    });

    const data = await handleApiResponse(response);
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Failed to fetch cars by ID");
  });
};

export const postCarForApproval = async (carData: any) => {
  return withErrorHandling(async () => {
    const response = await fetch(`${API_URL}/cars/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    });

    const data = await handleApiResponse(response);
    if (data.success) {
      return { success: true, carId: data.data.carId };
    }
    throw new Error(data.message || "Failed to post car for approval");
  });
};

// USER RELATEDED METHODS

export const fetchUserById = async (userId: string) => {
  return withErrorHandling(async () => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await handleApiResponse(response);
    if (data.success) {
      await AsyncStorage.setItem("userDetails", JSON.stringify(data.data));
      return data.data;
    }
    throw new Error(data.message || "Failed to fetch user data");
  });
};

export const registerNewUser = async (userInfo: any) => {
  return withErrorHandling(async () => {
    const dataToPost = {
      ...userInfo,
      boughtCars: [],
      soldCars: [],
      onSaleCars: [],
      likedCars: [],
    };

    const response = await fetch(`${API_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToPost),
    });

    const data = await handleApiResponse(response);
    if (data.success) {
      await AsyncStorage.setItem("userDetails", JSON.stringify(data.data));
      return data.data;
    }
    throw new Error(data.message || "Failed to register user");
  });
};

export const updateUserData = async (userInfo: any) => {
  return withErrorHandling(async () => {
    const response = await fetch(`${API_URL}/users/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    const data = await handleApiResponse(response);
    if (data.success) {
      await AsyncStorage.setItem("userDetails", JSON.stringify(data.data));
      return data.data;
    }
    throw new Error(data.message || "Failed to update user data");
  });
};

export const checkForRegisteredUser = async (
  mailId: string
): Promise<boolean> => {
  return withErrorHandling(async () => {
    const response = await fetch(
      `${API_URL}/users/isExists?phone=${encodeURIComponent(mailId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await handleApiResponse(response);
    if (data.success) {
      if (data.isExists) {
        await AsyncStorage.setItem("userDetails", JSON.stringify(data.data));
      }
      return data.isExists;
    }
    throw new Error(data.message || "Failed to check user registration");
  });
};

// Image Upload Methods
export const uploadImages = async (imageUris: string[]) => {
  return withErrorHandling(async () => {
    const formData = new FormData();

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

    const data = await handleApiResponse(response);
    if (data.success) {
      return {
        success: true,
        imageUrls: data.imageUrls,
      };
    }
    throw new Error(data.message || "Failed to upload images");
  });
};
