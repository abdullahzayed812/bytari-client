import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";

export interface FilterTab<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  count?: number;
}

interface FilterTabsProps<T extends string = string> {
  tabs: FilterTab<T>[];
  selectedTab: T;
  onTabPress: (tabId: T) => void;
  activeColor?: string;
  inactiveColor?: string;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
}

export function FilterTabs<T extends string = string>({
  tabs,
  selectedTab,
  onTabPress,
  activeColor = "#FF9800",
  inactiveColor = "#f0f0f0",
  containerStyle,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
}: FilterTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, containerStyle]}
      contentContainerStyle={styles.contentContainer}
    >
      {tabs.map((tab) => {
        const isActive = selectedTab === tab.id;
        const IconComponent = tab.icon;
        const iconColor = isActive ? "#fff" : tab.iconColor || "#666";

        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              { backgroundColor: inactiveColor },
              tabStyle,
              isActive && [styles.activeTab, { backgroundColor: activeColor }, activeTabStyle],
            ]}
            onPress={() => onTabPress(tab.id)}
          >
            {IconComponent && <IconComponent size={16} color={iconColor} />}
            <Text style={[styles.tabText, textStyle, isActive && [styles.activeTabText, activeTextStyle]]}>
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  contentContainer: {
    paddingRight: 15,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    gap: 5,
  },
  activeTab: {
    // Applied dynamically with activeColor
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
