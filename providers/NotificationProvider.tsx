import React, { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "react-native";
import { Notification, UserMode } from "../types"; // define Notification type in your types

type NotificationContextType = {
  notifications: Notification[];
  respondToNotification: (id: string, action: "accept" | "reject") => void;
  reportClinic: (clinicId: string, reason: string) => void;
  userMode: UserMode;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Example mock notification
    {
      id: "1",
      title: "طلب انضمام",
      message: "طلب انضمام إلى العيادة",
      type: "join_request",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [userMode, setUserMode] = useState<UserMode>("pet_owner"); // or 'veterinarian'

  const respondToNotification = (id: string, action: "accept" | "reject") => {
    // Here you could send API request
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    Alert.alert("تم الإجراء", `تم ${action === "accept" ? "قبول" : "رفض"} الطلب`);
  };

  const reportClinic = (clinicId: string, reason: string) => {
    // Simulate sending report
    Alert.alert("تم الإبلاغ", `تم إرسال بلاغ ضد العيادة ${clinicId} بسبب: ${reason}`);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        respondToNotification,
        reportClinic,
        userMode,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
