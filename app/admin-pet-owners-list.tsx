import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Search, UserCheck, UserX, Eye, Phone, Mail, Calendar, MapPin, MessageCircle, X } from "lucide-react-native";
import { useApp } from "../providers/AppProvider";

interface PetOwnerRow {
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    isActive: boolean;
    country?: string | null;
    province?: string | null;
    createdAt: string;
  };
}

export default function AdminPetOwnersList() {
  const { user: currentUser } = useApp();
  const currentAdminId = currentUser?.id ? Number(currentUser.id) : 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<PetOwnerRow["user"] | null>(null);
  const [messageText, setMessageText] = useState("");

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.admin.users.listByType.queryOptions({
      adminId: currentAdminId,
      userType: "pet_owner",
      search: searchQuery.length > 1 ? searchQuery : undefined,
      limit: 100,
    }),
  );

  const banUserMutation = useMutation(trpc.admin.users.ban.mutationOptions());
  const sendMessageMutation = useMutation(trpc.admin.permissions.sendMessageToUser.mutationOptions());

  const owners: PetOwnerRow[] = useMemo(() => {
    if (!response?.users) return [];
    return response.users.map((row: any) => ({
      user: {
        ...row.user,
        createdAt: row.user.createdAt instanceof Date ? row.user.createdAt.toISOString() : row.user.createdAt,
      },
    }));
  }, [response]);

  const handleBanUser = (u: PetOwnerRow["user"]) => {
    const action = u.isActive ? "حظر" : "إلغاء حظر";
    Alert.alert(`${action} المستخدم`, `هل أنت متأكد من ${action} ${u.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: action,
        style: u.isActive ? "destructive" : "default",
        onPress: () => {
          banUserMutation.mutate(
            { userId: u.id, adminId: currentAdminId, ban: u.isActive, reason: `${action} من قبل المشرف` } as any,
            {
              onSuccess: () => {
                refetch();
                Alert.alert("نجح", "تم تحديث حالة المستخدم بنجاح");
              },
              onError: (err) => Alert.alert("خطأ", err.message || "فشل في تحديث حالة المستخدم"),
            },
          );
        },
      },
    ]);
  };

  const handleSendMessageSubmit = () => {
    if (!messageRecipient || !messageText.trim()) {
      Alert.alert("خطأ", "يرجى كتابة الرسالة");
      return;
    }
    sendMessageMutation.mutate(
      {
        recipientId: messageRecipient.id,
        senderId: currentAdminId,
        title: "رسالة من الإدارة",
        content: messageText,
        type: "info" as const,
        priority: "normal" as const,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إرسال الرسالة بنجاح");
          setShowMessageModal(false);
          setMessageRecipient(null);
          setMessageText("");
        },
        onError: (err) => Alert.alert("خطأ", err.message || "فشل في إرسال الرسالة"),
      },
    );
  };

  const handleViewProfile = (u: PetOwnerRow["user"]) => {
    router.push({
      pathname: "/user-profile",
      params: {
        userId: u.id.toString(),
        userName: u.name,
        userEmail: u.email,
        userPhone: u.phone || "",
        userType: "pet_owner",
        isActive: u.isActive.toString(),
        createdAt: u.createdAt,
      },
    });
  };

  const renderOwnerCard = ({ item }: { item: PetOwnerRow }) => {
    const u = item.user;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderInfo}>
            <TouchableOpacity onPress={() => handleViewProfile(u)}>
              <Text style={styles.name}>{u.name}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.messageButton} onPress={() => { setMessageRecipient(u); setShowMessageModal(true); }}>
            <MessageCircle size={16} color="#4ECDC4" />
          </TouchableOpacity>
          <View style={[styles.statusDot, { backgroundColor: u.isActive ? "#4CAF50" : "#F44336" }]} />
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Mail size={16} color="#666" />
            <Text style={styles.detailText}>{u.email}</Text>
          </View>
          {!!u.phone && (
            <View style={styles.detailRow}>
              <Phone size={16} color="#666" />
              <Text style={styles.detailText}>{u.phone}</Text>
            </View>
          )}
          {!!(u.country || u.province) && (
            <View style={styles.detailRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText}>{[u.country, u.province].filter(Boolean).join(" - ")}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Calendar size={16} color="#666" />
            <Text style={styles.detailText}>انضم في: {new Date(u.createdAt).toLocaleDateString("ar-SA")}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleViewProfile(u)}>
            <Eye size={18} color="#4ECDC4" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleBanUser(u)} disabled={banUserMutation.isPending}>
            {u.isActive ? <UserX size={18} color="#FF9800" /> : <UserCheck size={18} color="#4CAF50" />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "أصحاب الحيوانات الأليفة", headerStyle: { backgroundColor: "#4ECDC4" }, headerTintColor: "#fff" }} />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن مستخدم..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Users size={20} color="#4ECDC4" />
        <Text style={styles.statsText}>{owners.length} من أصحاب الحيوانات</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message || "حدث خطأ في تحميل البيانات"}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>جاري التحميل...</Text>
        </View>
      ) : owners.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={48} color="#ccc" />
          <Text style={styles.emptyText}>لا يوجد أصحاب حيوانات مسجلين</Text>
        </View>
      ) : (
        <FlatList
          data={owners}
          keyExtractor={(item) => `owner-${item.user.id}`}
          renderItem={renderOwnerCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showMessageModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowMessageModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMessageModal(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إرسال رسالة</Text>
            <TouchableOpacity onPress={handleSendMessageSubmit}>
              <Text style={styles.modalSendText}>إرسال</Text>
            </TouchableOpacity>
          </View>
          {messageRecipient && (
            <View style={styles.messageRecipientInfo}>
              <Text style={styles.name}>إلى: {messageRecipient.name}</Text>
              <Text style={styles.detailText}>{messageRecipient.email}</Text>
            </View>
          )}
          <TextInput
            style={styles.messageInput}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { flexDirection: "row-reverse", padding: 15, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333", textAlign: "left", paddingVertical: 12 },
  statsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statsText: { fontSize: 14, fontWeight: "600", color: "#333" },
  errorContainer: { backgroundColor: "#ffebee", padding: 12, margin: 15, borderRadius: 8 },
  errorText: { color: "#f44336", fontSize: 14, textAlign: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 16, color: "#666", marginTop: 12, textAlign: "center" },
  listContainer: { padding: 15, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row-reverse", alignItems: "flex-start", marginBottom: 12, gap: 8 },
  cardHeaderInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: "#333", textAlign: "left", marginBottom: 6 },
  messageButton: { padding: 6, borderRadius: 6, backgroundColor: "#f0f8ff" },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  details: { gap: 8, marginBottom: 16 },
  detailRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  detailText: { fontSize: 14, color: "#666", flex: 1, textAlign: "left" },
  actions: { flexDirection: "row-reverse", justifyContent: "flex-end", gap: 12 },
  actionButton: { padding: 8, borderRadius: 8, backgroundColor: "#f8f9fa" },
  modalContainer: { flex: 1, backgroundColor: "#f8f9fa" },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  modalSendText: { color: "#4ECDC4", fontWeight: "bold", fontSize: 16 },
  messageRecipientInfo: { backgroundColor: "#fff", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  messageInput: { margin: 16, backgroundColor: "#fff", borderRadius: 12, padding: 16, fontSize: 16, color: "#333", textAlign: "left", borderWidth: 1, borderColor: "#ddd", minHeight: 120 },
});
