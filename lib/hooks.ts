import { ToastType } from "@/components/Toast";
import { useState, useCallback } from "react";

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastConfig & { visible: boolean }>({
    message: "",
    type: "info",
    duration: 3000,
    visible: false,
  });

  const showToast = useCallback((config: ToastConfig) => {
    setToast({
      ...config,
      visible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};
