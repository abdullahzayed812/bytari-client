import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";

interface PoultryFarmChatButtonProps {
  farmId: number;
  counterpartId: number;
  counterpartRole: "employee" | "doctor";
  title: string;
}

// Reusable chat entry point for both sides of a farm conversation:
// owner viewing an employee/doctor row, or the employee/doctor viewing their farm row.
export function PoultryFarmChatButton({ farmId, counterpartId, counterpartRole, title }: PoultryFarmChatButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    ...trpc.poultryFarms.chat.getOrCreate.queryOptions({ farmId, counterpartId, counterpartRole }),
    refetchInterval: 15000,
  });
  const markAsReadMutation = useMutation(trpc.poultryFarms.chat.markAsRead.mutationOptions());

  const chat = (data as any)?.chat;
  const unread: number = chat?.unreadCount ?? 0;

  const handlePress = async () => {
    if (chat && unread > 0) {
      try {
        await markAsReadMutation.mutateAsync({ chatId: chat.id });
        queryClient.invalidateQueries(trpc.poultryFarms.chat.getOrCreate.queryKey() as any);
      } catch {}
      refetch();
    }
    router.push({
      pathname: "/poultry-farm-chat-thread",
      params: { chatId: chat?.id ?? "", title },
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} disabled={!chat}>
      <MessageCircle size={18} color={COLORS.primary} />
      <Text style={styles.label}>محادثة</Text>
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    position: "relative",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
});
