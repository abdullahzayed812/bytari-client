import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft, ArrowRight, Search, Filter } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";

export default function PollsListScreen() {
  const { isRTL } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading, error } = useQuery(trpc.polls.getActivePollsProcedure.queryOptions());
  const polls = useMemo(() => (data as any)?.polls, [data]);

  const pollsToShow = useMemo(() => {
    if (!polls) return [];
    let filteredPolls = [...polls];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredPolls = filteredPolls.filter((p) => p.poll.question.toLowerCase().includes(query));
    }

    return filteredPolls;
  }, [polls, searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "الاستطلاعات النشطة",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في الاستطلاعات..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign={isRTL ? "right" : "left"}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={pollsToShow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pollCard}
              onPress={() => router.push({ pathname: "/ad-details", params: { id: item.advertisement.id } })}
            >
              <Image source={{ uri: item.advertisement.images[0] }} style={styles.pollImage} />
              <View style={styles.pollInfo}>
                <Text style={styles.pollName}>{item.poll.question}</Text>
                <Text style={styles.detailText}>ينتهي في: {new Date(item.poll.endDate).toLocaleDateString()}</Text>
                <Text style={styles.detailText}>إجمالي الأصوات: {item.poll.totalVotes}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.poll.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.pollsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim() ? "لا توجد استطلاعات تطابق البحث" : "لا توجد استطلاعات متاحة"}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  pollsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  pollCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  pollImage: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  pollInfo: {
    padding: 16,
  },
  pollName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
