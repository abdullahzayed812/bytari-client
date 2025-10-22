import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Edit3, Plus } from "lucide-react-native";
import { COLORS } from "../constants/colors";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
  isRTL?: boolean;
  // Admin controls
  showAddButton?: boolean;
  showEditButton?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  // Custom styling
  containerStyle?: object;
  titleStyle?: object;
}

export default function SectionHeader({
  title,
  onSeeAll,
  showSeeAll = true,
  isRTL = true,
  showAddButton = false,
  showEditButton = false,
  onAdd,
  onEdit,
  containerStyle,
  titleStyle,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, { flexDirection: isRTL ? "row-reverse" : "row" }, containerStyle]}>
      {/* See All Button - Left Side */}
      {showSeeAll && onSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
          <View style={[styles.seeAllContainer, { flexDirection: isRTL ? "row" : "row-reverse" }]}>
            <Text style={styles.seeAllText}>عرض الكل</Text>
            {isRTL ? (
              <ChevronLeft size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            ) : (
              <ChevronRight size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Admin Controls - Center */}
      {(showEditButton || showAddButton) && (
        <View style={styles.adminControls}>
          {showEditButton && onEdit && (
            <TouchableOpacity onPress={onEdit} style={[styles.adminButton, styles.editButton]}>
              <Edit3 size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
          {showAddButton && onAdd && (
            <TouchableOpacity onPress={onAdd} style={[styles.adminButton, styles.addButton]}>
              <Plus size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Title - Right Side */}
      <Text style={[styles.title, { textAlign: isRTL ? "left" : "left" }, titleStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  seeAllButton: {
    alignItems: "center",
  },
  seeAllContainer: {
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  adminControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminButton: {
    padding: 6,
    borderRadius: 6,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  addButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
});
