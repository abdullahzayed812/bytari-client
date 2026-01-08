import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/colors";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react-native";
import { useI18n } from "@/providers/I18nProvider";
import { isRTL } from "@/lib/rtl-config";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  type = "info",
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { isRTL } = useI18n();
  const getIconAndColor = () => {
    switch (type) {
      case "warning":
        return { Icon: AlertTriangle, color: COLORS.warning };
      case "error":
        return { Icon: AlertCircle, color: COLORS.error };
      case "success":
        return { Icon: CheckCircle, color: COLORS.success };
      default:
        return { Icon: Info, color: COLORS.primary };
    }
  };

  const { Icon, color } = getIconAndColor();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
            <Icon size={48} color={color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: color },
                isLoading && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: isRTL() ? "row-reverse" : "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
