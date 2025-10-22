import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "react-native";
import { FavoriteItem } from "../types"; // Define this type in types.ts

type FavoritesContextType = {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  addToCart: (item: FavoriteItem) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      if (exists) {
        Alert.alert("موجود بالفعل", "هذا العنصر موجود في المفضلة");
        return prev;
      }
      Alert.alert("تمت الإضافة", "تمت إضافة العنصر إلى المفضلة");
      return [...prev, item];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
    Alert.alert("تم الحذف", "تمت إزالة العنصر من المفضلة");
  };

  const addToCart = (item: FavoriteItem) => {
    // You can connect this to your real cart logic
    Alert.alert("تمت الإضافة إلى السلة", `${item.name} تمت إضافته إلى السلة`);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        addToCart,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
