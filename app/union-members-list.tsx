import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { XCircle, Send } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "../providers/ToastProvider";

interface MemberItem {
  registrationId: number;
  userId: number;
  name: string | null;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  registeredAt: string;
}

interface FollowerItem {
  followId: number;
  userId: number;
  name: string | null;
  avatar: string | null;
  email: string | null;
  followedAt: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ar");
}

function InitialsAvatar({ name }: { name: string | null }) {
  const initials = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <View style={styles.initialsAvatar}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
}

export default function UnionMembersListScreen() {
  const { type, mainUnionId, branchId, title } = useLocalSearchParams<{
    type: "followers" | "members";
    mainUnionId?: string;
    branchId?: string;
    title?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuperAdmin, moderatorPermissions, supervisedBranchIds } = useApp();

  const parsedMainUnionId = mainUnionId ? Number(mainUnionId) : undefined;
  const parsedBranchId = branchId ? Number(branchId) : undefined;
  const [searchQuery, setSearchQuery] = useState("");
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgTarget, setMsgTarget] = useState<"members" | "followers" | "all">("members");
  const { showToast } = useToastContext();

  const sendMessageMutation = useMutation(trpc.union.messaging.sendToMembers.mutationOptions());

  const canManage =
    isSuperAdmin ||
    moderatorPermissions?.unionManagement ||
    (parsedBranchId !== undefined && supervisedBranchIds?.includes(parsedBranchId));

  const membersQuery = useQuery({
    ...trpc.union.registration.getMembers.queryOptions({
      mainUnionId: parsedMainUnionId,
      branchId: parsedBranchId,
    }),
    enabled: type === "members",
  });

  const followersQuery = useQuery({
    ...trpc.union.follow.getFollowers.queryOptions({
      mainUnionId: parsedMainUnionId,
      branchId: parsedBranchId,
    }),
    enabled: type === "followers",
  });

  const removeFollowerMutation = useMutation(trpc.union.follow.removeFollower.mutationOptions());
  const removeMemberMutation = useMutation(trpc.union.registration.remove.mutationOptions());

  const isLoading = type === "members" ? membersQuery.isLoading : followersQuery.isLoading;

  const handleRemoveFollower = (followId: number) => {
    Alert.alert("إزالة المتابع", "هل تريد إزالة هذا المتابع؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: () => {
          removeFollowerMutation.mutate(
            { followId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(trpc.union.follow.getFollowers.queryKey as any);
              },
            },
          );
        },
      },
    ]);
  };

  const handleRemoveMember = (registrationId: number) => {
    Alert.alert("إزالة العضو", "هل تريد إزالة هذا العضو من التسجيل؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إزالة",
        style: "destructive",
        onPress: () => {
          removeMemberMutation.mutate(
            { registrationId, mainUnionId: parsedMainUnionId, branchId: parsedBranchId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries(trpc.union.registration.getMembers.queryKey as any);
              },
            },
          );
        },
      },
    ]);
  };

  const renderMemberItem = ({ item }: { item: MemberItem }) => (
    <TouchableOpacity
      style={styles.personCard}
      onPress={() => router.push({ pathname: "/user-profile", params: { userId: String(item.userId), canSendMessage: "true" } })}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <InitialsAvatar name={item.name} />
        )}
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{item.name ?? "—"}</Text>
          {item.email ? <Text style={styles.personMeta}>{item.email}</Text> : null}
          {item.phone ? <Text style={styles.personMeta}>{item.phone}</Text> : null}
          <Text style={styles.personDate}>منذ: {formatDate(item.registeredAt)}</Text>
        </View>
        {canManage && (
          <TouchableOpacity onPress={() => handleRemoveMember(item.registrationId)} style={styles.removeButton}>
            <XCircle size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFollowerItem = ({ item }: { item: FollowerItem }) => (
    <TouchableOpacity
      style={styles.personCard}
      onPress={() => router.push({ pathname: "/user-profile", params: { userId: String(item.userId), canSendMessage: "true" } })}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <InitialsAvatar name={item.name} />
        )}
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{item.name ?? "—"}</Text>
          {item.email ? <Text style={styles.personMeta}>{item.email}</Text> : null}
          <Text style={styles.personDate}>منذ: {formatDate(item.followedAt)}</Text>
        </View>
        {canManage && (
          <TouchableOpacity onPress={() => handleRemoveFollower(item.followId)} style={styles.removeButton}>
            <XCircle size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleSendMessage = () => {
    if (!msgTitle.trim() || !msgBody.trim()) {
      showToast({ message: "يرجى تعبئة العنوان والرسالة", type: "error" });
      return;
    }
    sendMessageMutation.mutate(
      { mainUnionId: parsedMainUnionId, branchId: parsedBranchId, title: msgTitle.trim(), message: msgBody.trim(), target: msgTarget },
      {
        onSuccess: (data) => {
          showToast({ message: `تم إرسال الرسالة إلى ${data.sentCount} مستخدم`, type: "success" });
          setMsgModalVisible(false);
          setMsgTitle("");
          setMsgBody("");
        },
        onError: () => showToast({ message: "فشل إرسال الرسالة", type: "error" }),
      },
    );
  };

  const members = ((membersQuery.data?.members ?? []) as MemberItem[]).filter(
    (m) => !searchQuery || (m.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const followers = ((followersQuery.data?.followers ?? []) as FollowerItem[]).filter(
    (f) => !searchQuery || (f.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const emptyText = type === "followers" ? "لا يوجد متابعون بعد" : "لا يوجد أعضاء مسجلون بعد";

  return (
    <>
      <Stack.Screen
        options={{
          title: title ?? (type === "followers" ? "المتابعون" : "الأعضاء المسجلون"),
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: canManage
            ? () => (
                <TouchableOpacity onPress={() => setMsgModalVisible(true)} style={{ marginRight: 8 }}>
                  <Send size={20} color={COLORS.white} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث باسم العضو..."
            placeholderTextColor={COLORS.darkGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : type === "members" ? (
          <FlatList
            data={members}
            keyExtractor={(item) => String(item.registrationId)}
            renderItem={renderMemberItem}
            contentContainerStyle={styles.listContent}
            onRefresh={() => membersQuery.refetch()}
            refreshing={membersQuery.isFetching}
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
          />
        ) : (
          <FlatList
            data={followers}
            keyExtractor={(item) => String(item.followId)}
            renderItem={renderFollowerItem}
            contentContainerStyle={styles.listContent}
            onRefresh={() => followersQuery.refetch()}
            refreshing={followersQuery.isFetching}
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
          />
        )}
      </View>
      <Modal visible={msgModalVisible} animationType="slide" transparent onRequestClose={() => setMsgModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>إرسال رسالة</Text>

            <Text style={styles.modalLabel}>المستهدفون</Text>
            <View style={styles.targetRow}>
              {(["members", "followers", "all"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.targetChip, msgTarget === t && styles.targetChipActive]}
                  onPress={() => setMsgTarget(t)}
                >
                  <Text style={[styles.targetChipText, msgTarget === t && styles.targetChipTextActive]}>
                    {t === "members" ? "الأعضاء" : t === "followers" ? "المتابعون" : "الكل"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>العنوان</Text>
            <TextInput
              style={styles.modalInput}
              value={msgTitle}
              onChangeText={setMsgTitle}
              placeholder="عنوان الرسالة"
              placeholderTextColor={COLORS.darkGray}
              textAlign="right"
            />

            <Text style={styles.modalLabel}>الرسالة</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={msgBody}
              onChangeText={setMsgBody}
              placeholder="نص الرسالة..."
              placeholderTextColor={COLORS.darkGray}
              textAlign="right"
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setMsgModalVisible(false)}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, sendMessageMutation.isPending && { opacity: 0.6 }]}
                onPress={handleSendMessage}
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.sendButtonText}>إرسال</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  personCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightGray,
  },
  initialsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  personInfo: {
    flex: 1,
    gap: 2,
    alignItems: "flex-end",
  },
  personName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
  },
  personMeta: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  personDate: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.darkGray,
    fontSize: 16,
    marginTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 8,
  },
  targetRow: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 4,
  },
  targetChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  targetChipActive: {
    backgroundColor: COLORS.primary,
  },
  targetChipText: {
    fontSize: 13,
    color: COLORS.primary,
  },
  targetChipTextActive: {
    color: COLORS.white,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row-reverse",
    gap: 12,
    marginTop: 16,
  },
  sendButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 15,
  },
});
