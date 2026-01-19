import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../types";
import { trpc } from "@/lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Cart Item Type
type CartItem = {
  productId: number;
  product: Product;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  isLoadingCart: boolean;
  addToCart: (userId: number, productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getCartItemCount: () => number;
  newOrderCount: number;
  orderCreated: () => void;
  resetOrderCounter: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

import { useApp } from "./AppProvider";

// ...

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const { data: serverCart, isLoading: isLoadingCart } = useQuery({
    ...trpc.cart.getCart.queryOptions({ userId: Number(user?.id) }),
    enabled: !!user,
  });

  const cart = serverCart || [];
  const [newOrderCount, setNewOrderCount] = useState(0);

  const invalidateCart = () => {
    queryClient.invalidateQueries(trpc.cart.getCart.queryKey() as any);
  };

  // ✅ Mutations
  const addToCartMutation = useMutation(trpc.cart.addToCart.mutationOptions());

  const removeFromCartMutation = useMutation(trpc.cart.removeFromCart.mutationOptions());

  const updateQuantityMutation = useMutation(trpc.cart.updateQuantity.mutationOptions());

  const clearCartMutation = useMutation(trpc.cart.clearCart.mutationOptions());

  // ✅ Actions (mutate + onSuccess)
  const addToCart = (userId: number, productId: number, quantity: number) => {
    addToCartMutation.mutate(
      { userId, productId, quantity },
      {
        onSuccess: invalidateCart,
      }
    );
  };

  const removeFromCart = (productId: number) => {
    removeFromCartMutation.mutate(
      { productId },
      {
        onSuccess: invalidateCart,
      }
    );
  };

  const updateQuantity = (productId: number, quantity: number) => {
    updateQuantityMutation.mutate(
      { productId, quantity },
      {
        onSuccess: invalidateCart,
      }
    );
  };

  const clearCart = () => {
    clearCartMutation.mutate(undefined, {
      onSuccess: invalidateCart,
    });
  };

  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const orderCreated = () => setNewOrderCount((prev) => prev + 1);
  const resetOrderCounter = () => setNewOrderCount(0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoadingCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        getCartItemCount,
        newOrderCount,
        orderCreated,
        resetOrderCounter,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
