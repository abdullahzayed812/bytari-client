import { Toast } from "@/components/Toast";
import { ToastConfig, useToast } from "@/lib/hooks";
import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast, showToast, hideToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (toast.visible) setMounted(true);
  }, [toast.visible]);

  const handleHide = () => {
    hideToast();
    setMounted(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          visible={toast.visible}
          onHide={handleHide}
        />
      )}
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
