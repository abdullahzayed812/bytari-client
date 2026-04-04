import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

interface ChatItem {
  id: number;
  petId: number;
  clinicId: number;
  ownerId: number;
  isActive: boolean;
  createdAt: string;
  petName: string;
  petImage: string | null;
  ownerName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `${diffMins}د`;
  if (diffHours < 24) return `${diffHours}س`;
  if (diffDays < 7) return `${diffDays}ي`;
  return date.toLocaleDateString("ar");
}

export default function ClinicChatsScreen() {
  const { clinicId } = useLocalSearchParams();

  const { data, isLoading } = useQuery(
    trpc.clinics.chat.getClinicChats.queryOptions({ clinicId: Number(clinicId) }),
  );
  const chats = ((data as any)?.chats ?? []) as ChatItem[];

  const renderItem = ({ item }: { item: ChatItem }) => (
    <View style={styles.chatItem}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={() => router.push({ pathname: "/(tabs)/pet-details", params: { petId: String(item.petId), clinicId: String(item.clinicId) } })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.petImage ?? undefined }}
          style={styles.avatar}
        />
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chatInfo}
        onPress={() =>
          router.push({
            pathname: "/clinic-chat-thread",
            params: {
              chatId: item.id,
              petName: item.petName,
              ownerName: item.ownerName,
              senderRole: "clinic",
              clinicId: String(item.clinicId),
              initialIsActive: item.isActive ? "true" : "false",
            },
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.chatTopRow}>
          <Text style={styles.lastTime}>{formatTime(item.lastMessageAt)}</Text>
          <Text style={styles.petName}>{item.petName}</Text>
        </View>
        <Text style={styles.ownerName}>{item.ownerName}</Text>
        {!item.isActive && (
          <Text style={styles.pausedLabel}>محادثة موقوفة</Text>
        )}
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "المحادثات",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
            <Text style={styles.emptySubText}>ستظهر محادثاتك مع أصحاب الحيوانات هنا</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginRight: 80,
  },
  chatItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.lightGray,
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
    gap: 2,
  },
  chatTopRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  lastTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  ownerName: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  pausedLabel: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkGray,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
  },
});
