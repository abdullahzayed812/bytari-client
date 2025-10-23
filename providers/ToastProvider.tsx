import { Toast } from "@/components/Toast";
import { ToastConfig, useToast } from "@/lib/hooks";
import React, { createContext, useContext, ReactNode } from "react";

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast, showToast, hideToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
};
