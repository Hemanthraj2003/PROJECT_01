import React, { createContext, ReactNode, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  // emailID: string;
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
  setUser: (user: any) => void;
  removeUser: () => void;
  forceSetUser: () => void;
};

const AuthContext = createContext<authContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<any | null>(null);

  const setUser = async (userInfo: any) => {
    setUserState(userInfo); // Set user in context
  };

  // refereshes the user state variable so that it can be read any where
  const forceSetUser = async () => {
    const userDetails = await AsyncStorage.getItem("userDetails");
    if (userDetails) setUserState(JSON.parse(userDetails));
  };

  const removeUser = async () => {
    setUserState(null); // Clear user from context
    try {
      await AsyncStorage.removeItem("userDetails"); // Remove user from AsyncStorage
    } catch (error) {
      console.error("Error removing user from AsyncStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, removeUser, forceSetUser }}>
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
