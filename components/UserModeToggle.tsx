import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { COLORS } from "@/constants/colors";
import { RefreshCw } from "lucide-react-native";

export const UserModeToggle = () => {
  const { user, isSuperAdmin, toggleUserMode, isModerator } = useApp();

  if (!user || (user.accountType !== "veterinarian" && !isSuperAdmin && !isModerator)) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.iconButton} onPress={toggleUserMode} testID="user-mode-toggle">
      <RefreshCw size={22} color={COLORS.black} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
  },
});
