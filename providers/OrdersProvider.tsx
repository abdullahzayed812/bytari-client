import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "react-native";
import { Order } from "../types"; // define this type as needed

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Order) => void;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
    Alert.alert("تم الطلب", "تمت إضافة الطلب بنجاح");
  };

  const clearOrders = () => {
    setOrders([]);
    Alert.alert("تم الحذف", "تم حذف جميع الطلبات");
  };

  return <OrdersContext.Provider value={{ orders, addOrder, clearOrders }}>{children}</OrdersContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
