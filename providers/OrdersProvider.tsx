import React, { createContext, useContext, useState, ReactNode } from "react";
import { Order } from "../types"; // define this type as needed
import { useToastContext } from "./ToastProvider";

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Order) => void;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToastContext();
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (order: Order) => {
    setOrders((prev) => [...prev, order]);
    showToast({ type: "success", message: "تمت إضافة الطلب بنجاح" });
  };

  const clearOrders = () => {
    setOrders([]);
    showToast({ type: "success", message: "تم حذف جميع الطلبات" });
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
