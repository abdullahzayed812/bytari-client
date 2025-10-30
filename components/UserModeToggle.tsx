import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { COLORS } from "@/constants/colors";
import { RefreshCw } from "lucide-react-native";
import { useToastContext } from "@/providers/ToastProvider";

export const UserModeToggle = () => {
  const { user, isSuperAdmin, toggleUserMode, isModerator, userMode } =
    useApp();
  const { showToast } = useToastContext();

  if (
    !user ||
    (user.accountType !== "veterinarian" && !isSuperAdmin && !isModerator)
  ) {
    return null;
  }

  const handleToggle = async () => {
    const currentMode = userMode;
    toggleUserMode();

    const newModeMessage =
      currentMode === "veterinarian"
        ? "تم التبديل إلى وضع صاحب الحيوان"
        : "تم التبديل إلى وضع الطبيب البيطري";

    showToast({
      message: newModeMessage,
      type: "info",
    });
  };

  return (
    <TouchableOpacity
      style={styles.iconButton}
      onPress={handleToggle}
      testID="user-mode-toggle"
    >
      <RefreshCw size={22} color={COLORS.black} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
  },
});
