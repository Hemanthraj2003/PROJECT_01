import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type User = {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  boughtCars: any[];
  soldCars: any[];
  onSaleCars: any[];
  likedCars: any[];
};

type authContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: any) => Promise<void>;
  removeUser: () => Promise<void>;
  forceSetUser: () => Promise<boolean | void>;
  validateSession: () => Promise<boolean>;
};

const AuthContext = createContext<authContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Validate user data to ensure it has the required fields
  const isValidUserData = (userData: any): userData is User => {
    // Check if userData exists and is an object
    if (!userData || typeof userData !== "object") {
      console.error("Invalid user data: not an object or null", userData);
      return false;
    }

    // Check if id exists and is a string
    if (typeof userData.id !== "string") {
      console.error("Invalid user data: id is not a string", userData.id);
      return false;
    }

    // Check if id is a valid Firestore ID (not a client-generated ID)
    if (userData.id.startsWith("user_")) {
      console.error(
        "Invalid user data: id appears to be client-generated",
        userData.id
      );
      return false;
    }

    // Check other required fields
    if (typeof userData.name !== "string") {
      console.error("Invalid user data: name is not a string", userData.name);
      return false;
    }

    if (typeof userData.phone !== "string") {
      console.error("Invalid user data: phone is not a string", userData.phone);
      return false;
    }

    // All checks passed
    return true;
  };

  // Load user from AsyncStorage on component mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        setIsLoading(true);
        const userDetails = await AsyncStorage.getItem("userDetails");

        if (userDetails) {
          try {
            const parsedUser = JSON.parse(userDetails);

            // Validate the user data
            if (isValidUserData(parsedUser)) {
              console.log(
                "Valid user loaded from AsyncStorage:",
                parsedUser.id
              );
              setUserState(parsedUser);
              setIsAuthenticated(true);
            } else {
              console.error("Invalid user data in AsyncStorage:", parsedUser);
              await AsyncStorage.removeItem("userDetails");
              setUserState(null);
              setIsAuthenticated(false);
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            await AsyncStorage.removeItem("userDetails");
            setUserState(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("No user found in AsyncStorage");
          setUserState(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error loading user from AsyncStorage:", error);
        setUserState(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Validate the current session
  const validateSession = async (): Promise<boolean> => {
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      if (!userDetails) {
        console.log("No user found in AsyncStorage during validation");
        setUserState(null);
        setIsAuthenticated(false);
        return false;
      }

      try {
        const parsedUser = JSON.parse(userDetails);
        if (isValidUserData(parsedUser)) {
          console.log("Session validated for user:", parsedUser.id);
          setUserState(parsedUser);
          setIsAuthenticated(true);
          return true;
        } else {
          console.error("Invalid user data during validation:", parsedUser);
          await AsyncStorage.removeItem("userDetails");
          setUserState(null);
          setIsAuthenticated(false);
          return false;
        }
      } catch (parseError) {
        console.error("Error parsing user data during validation:", parseError);
        await AsyncStorage.removeItem("userDetails");
        setUserState(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Error validating session:", error);
      setUserState(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const setUser = async (userInfo: any) => {
    try {
      // Validate the user data before storing
      if (!isValidUserData(userInfo)) {
        console.error("Attempted to store invalid user data:", userInfo);
        throw new Error("Invalid user data");
      }

      // Store user in AsyncStorage
      await AsyncStorage.setItem("userDetails", JSON.stringify(userInfo));
      console.log("User stored in AsyncStorage:", userInfo.id);

      // Update state
      setUserState(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error storing user in AsyncStorage:", error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Refreshes the user state variable from AsyncStorage
  const forceSetUser = async () => {
    try {
      console.log("Force refreshing user from AsyncStorage");
      const userDetails = await AsyncStorage.getItem("userDetails");
      if (userDetails) {
        try {
          const parsedUser = JSON.parse(userDetails);
          if (isValidUserData(parsedUser)) {
            console.log("User refreshed from AsyncStorage:", parsedUser.id);
            setUserState(parsedUser);
            setIsAuthenticated(true);
            return true;
          } else {
            console.error("Invalid user data during refresh:", parsedUser);
            await AsyncStorage.removeItem("userDetails");
            setUserState(null);
            setIsAuthenticated(false);
            return false;
          }
        } catch (parseError) {
          console.error("Error parsing user data during refresh:", parseError);
          await AsyncStorage.removeItem("userDetails");
          setUserState(null);
          setIsAuthenticated(false);
          return false;
        }
      } else {
        console.log("No user found in AsyncStorage during refresh");
        setUserState(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("Error refreshing user from AsyncStorage:", error);
      setUserState(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  const removeUser = async () => {
    try {
      // Remove from AsyncStorage
      await AsyncStorage.removeItem("userDetails");
      console.log("User removed from AsyncStorage");

      // Clear from state
      setUserState(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error removing user from AsyncStorage:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        setUser,
        removeUser,
        forceSetUser,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthProvider;
