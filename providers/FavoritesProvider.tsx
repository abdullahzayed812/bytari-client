import React, { createContext, useContext, useState, ReactNode } from "react";
import { FavoriteItem } from "../types"; // Define this type in types.ts
import { useToastContext } from "./ToastProvider";

type FavoritesContextType = {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  addToCart: (item: FavoriteItem) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToastContext();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === item.id);
      if (exists) {
        showToast({ type: "info", message: "هذا العنصر موجود في المفضلة" });
        return prev;
      }
      showToast({ type: "success", message: "تمت إضافة العنصر إلى المفضلة" });
      return [...prev, item];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
    showToast({ type: "success", message: "تمت إزالة العنصر من المفضلة" });
  };

  const addToCart = (item: FavoriteItem) => {
    // You can connect this to your real cart logic
    showToast({ type: "success", message: `${item.name} تمت إضافته إلى السلة` });
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
