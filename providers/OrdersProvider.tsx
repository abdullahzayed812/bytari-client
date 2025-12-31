import React, { createContext, useContext, ReactNode } from "react";
import { Order } from "../types";
import { useToastContext } from "./ToastProvider";
import { trpc } from "../lib/trpc";
import { useApp } from "./AppProvider";
import { useQuery } from "@tanstack/react-query";

type OrdersContextType = {
  orders: Order[];
  isLoading: boolean;
  refetch: () => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const { userMode } = useApp();
  const storeType = userMode === "veterinarian" ? "veterinarian" : "pet_owner";

  const { data: orders, isLoading, refetch } = useQuery(
    trpc.unifiedStore.listMyOrders.queryOptions({
      storeType,
    })
  );

  return (
    <OrdersContext.Provider value={{ orders: (orders as unknown as Order[]) || [], isLoading, refetch }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
