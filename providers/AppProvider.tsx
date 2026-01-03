import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  accountType?: "pet_owner" | "veterinarian" | "admin";
  veterinarianType?: "student" | "veterinarian";
  gender?: "male" | "female";
  licenseVerified?: boolean;
  points?: number;
  isPremium?: boolean;
  avatar?: string;
  hasAdminAccess?: boolean;
  isSuperAdmin?: boolean;
  isModerator?: boolean;
  moderatorPermissions?: any;
  supervisedBranchIds?: number[];
}

interface AppContextType {
  isLoading: boolean;
  hasSeenSplash: boolean;
  isAuthenticated: boolean;
  user: User | null;
  userMode: "pet_owner" | "veterinarian" | "admin";
  pointsHistory: any[];
  hasAdminAccess: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  moderatorPermissions: any;
  supervisedBranchIds: number[];
  login: (userData: User, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setHasSeenSplash: (seen: boolean) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
  toggleUserMode: () => void;
  addresses: any[];
  addAddress: (address: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMode, setUserMode] = useState("");

  const hasAdminAccess = user?.hasAdminAccess || false;
  const isSuperAdmin = user?.isSuperAdmin || false;
  const isModerator = user?.isModerator || false;
  const moderatorPermissions = user?.moderatorPermissions || {};
  const supervisedBranchIds = user?.supervisedBranchIds || [];

  // Mock data for now - will be replaced with real backend data
  const pointsHistory = user?.points
    ? [
      {
        id: 1,
        action: "تسجيل دخول يومي",
        points: 10,
        date: new Date().toISOString(),
      },
      {
        id: 2,
        action: "إضافة حيوان أليف",
        points: 50,
        date: new Date().toISOString(),
      },
      {
        id: 3,
        action: "مشاركة التطبيق",
        points: 25,
        date: new Date().toISOString(),
      },
    ]
    : [];

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const [splashSeen, onboardingSeen, userData, storedUserMode] = await Promise.all([
        AsyncStorage.getItem("hasSeenSplash"),
        AsyncStorage.getItem("hasSeenOnboarding"),
        AsyncStorage.getItem("userData"),
        AsyncStorage.getItem("userMode"),
      ]);

      setHasSeenSplash(splashSeen === "true");
      setHasSeenOnboarding(onboardingSeen === "true");

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // If user is veterinarian and stored userMode exists, use it
        if (parsedUser.accountType === "veterinarian" || (parsedUser.accountType === "admin" && storedUserMode)) {
          setUserMode(storedUserMode as "pet_owner" | "veterinarian");
        } else {
          // fallback to accountType
          setUserMode(parsedUser.accountType || "pet_owner");
        }
      }
    } catch (error) {
      console.error("Error initializing app:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, accessToken: string) => {
    try {
      console.log("👤 User data to be saved:", userData);

      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("userMode", userData?.accountType || "");

      setUser(userData);
      setIsAuthenticated(true);
      setUserMode(
        userData?.accountType === "admin" || userData?.accountType === "veterinarian" ? "veterinarian" : "pet_owner"
      );

      console.log("✅ User data saved and state updated successfully");
    } catch (error) {
      console.error("❌ Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["userData", "accessToken"]);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const setHasSeenSplashWrapper = async (seen: boolean) => {
    try {
      await AsyncStorage.setItem("hasSeenSplash", seen.toString());
      setHasSeenSplash(seen);
    } catch (error) {
      console.error("Error setting splash seen:", error);
    }
  };

  const setHasSeenOnboardingWrapper = async (seen: boolean) => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", seen.toString());
      setHasSeenOnboarding(seen);
    } catch (error) {
      console.error("Error setting onboarding seen:", error);
    }
  };

  const toggleUserMode = async () => {
    if (!user) return;

    const isVet = user.accountType === "veterinarian";
    const isAdmin = user.hasAdminAccess || user.isSuperAdmin || user.isModerator;

    // Only allow veterinarians or admins
    if (!isVet && !isAdmin) return;

    const newMode = userMode === "veterinarian" ? "pet_owner" : "veterinarian";
    setUserMode(newMode);
    await AsyncStorage.setItem("userMode", newMode);

    console.log("✅ User mode toggled to:", newMode);
  };

  const updateUser = async (updatedData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      // Merge updated data with existing user data
      const updatedUser = { ...user, ...updatedData };

      // Save to AsyncStorage
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);

      console.log("✅ User data updated successfully", updatedData);
    } catch (error) {
      console.error("❌ Error updating user data:", error);
      throw error;
    }
  };

  const [addresses, setAddresses] = useState<any[]>([]);

  const addAddress = async (address: any) => {
    const newAddresses = [...addresses, address];
    setAddresses(newAddresses);
    await AsyncStorage.setItem("addresses", JSON.stringify(newAddresses));
  };

  useEffect(() => {
    const loadAddresses = async () => {
      const stored = await AsyncStorage.getItem("addresses");
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    };
    loadAddresses();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        hasSeenSplash,
        isAuthenticated,
        user,
        userMode: userMode as "pet_owner" | "veterinarian",
        pointsHistory,
        hasAdminAccess,
        isSuperAdmin,
        isModerator,
        moderatorPermissions,
        supervisedBranchIds,
        login,
        logout,
        updateUser,
        setHasSeenSplash: setHasSeenSplashWrapper,
        hasSeenOnboarding,
        setHasSeenOnboarding: setHasSeenOnboardingWrapper,
        toggleUserMode,
        addresses,
        addAddress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
