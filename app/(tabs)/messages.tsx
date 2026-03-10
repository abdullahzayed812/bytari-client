import React, { useMemo, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  X,
  Megaphone,
  Wrench,
  RefreshCw,
  ShieldAlert,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { useApp } from "../../providers/AppProvider";
import { handleBackNavigation } from "../../lib/navigation-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { trpc } from "../../lib/trpc";

interface Message {
  id: string;
  type: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date;
  isRead: boolean;
  readAt: Date | null;
  priority: "low" | "normal" | "high" | "urgent";
  senderName?: string | null;
  clinicName?: string | null;
  storeName?: string | null;
}

export default function MessagesScreen() {
  const { isRTL } = useI18n();
  const { userMode, user } = useApp();

  const queryClient = useQueryClient();
  const markAsReadMutation = useMutation(trpc.admin.messages.markAsRead.mutationOptions());
  const sendSystemMessageReplyMutation = useMutation(trpc.admin.messages.sendReply.mutationOptions());

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    refetch: refetchReplies,
  } = useQuery(
    trpc.admin.messages.getReplies.queryOptions({
      messageId: selectedMessage?.id ? Number(selectedMessage.id) : -1,
    }), // Use -1 or handle undefined appropriately
  );
  const replies = useMemo(() => repliesData?.replies, [repliesData]);

  const { data, isLoading, error } = useQuery(
    trpc.admin.messages.getUserSystemMessages.queryOptions({ userId: Number(user?.id) }),
  );

  const messages = useMemo(() => data?.messages, [data]);

  const markAsRead = (messageId: number) => {
    if (!user?.id) return;
    markAsReadMutation.mutate(
      { userId: Number(user.id), messageId: messageId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.admin.messages.getUserSystemMessages.queryKey as any);
        },
      },
    );
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "announcement":
        return { icon: <Megaphone size={20} color="#fff" />, bg: "#27AE60", label: "إعلان" };
      case "maintenance":
        return { icon: <Wrench size={20} color="#fff" />, bg: "#F39C12", label: "صيانة" };
      case "update":
        return { icon: <RefreshCw size={20} color="#fff" />, bg: "#2196F3", label: "تحديث" };
      case "warning":
        return { icon: <ShieldAlert size={20} color="#fff" />, bg: "#E74C3C", label: "تحذير" };
      default:
        return { icon: <MessageCircle size={20} color="#fff" />, bg: "#8E44AD", label: "رسالة" };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return `منذ ${days} يوم`;
    }
  };

  const getPriorityConfig = (priority: Message["priority"]) => {
    switch (priority) {
      case "urgent":
        return { color: "#E74C3C", label: "عاجل", bg: "#FDECEA" };
      case "high":
        return { color: "#E67E22", label: "مرتفع", bg: "#FEF3E2" };
      case "normal":
        return { color: "#2196F3", label: "عادي", bg: "#E3F2FD" };
      case "low":
        return { color: "#27AE60", label: "منخفض", bg: "#E8F5E9" };
      default:
        return { color: COLORS.darkGray, label: "", bg: COLORS.gray };
    }
  };

  const handleMessagePress = async (message: Message) => {
    await markAsRead(message?.id);

    setSelectedMessage(message);
    setReplyModalVisible(true);
  };

  const handleSendReply = () => {
    if (!replyText?.trim() || !selectedMessage || !user?.id) return;

    sendSystemMessageReplyMutation.mutate(
      {
        messageId: Number(selectedMessage.id),
        userId: Number(user.id),
        content: replyText,
        isFromAdmin: false, // User is sending the reply
      },
      {
        onSuccess: () => {
          Alert.alert("تم الإرسال", "تم إرسال الرد بنجاح");
          // setReplyModalVisible(false);
          setReplyText("");
          setSelectedMessage(null);
          queryClient.invalidateQueries(trpc.admin.messages.getUserSystemMessages.queryKey as any);
          refetchReplies(); // Refetch replies for the selected message
        },
        onError: (error) => {
          Alert.alert("خطأ", `حدث خطأ أثناء إرسال الرد: ${error.message}`);
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {/* <Stack.Screen
        options={{
          // headerShown: true,
          title: "الرسائل",
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.black,
            fontSize: 18,
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => handleBackNavigation()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      /> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {messages?.map((message) => {
          const typeConfig = getTypeConfig(message.type);
          const priorityConfig = getPriorityConfig(message.priority);
          return (
            <TouchableOpacity
              key={message.id}
              style={[styles.messageCard, !message.isRead && styles.unreadCard]}
              onPress={() => handleMessagePress(message)}
              activeOpacity={0.85}
            >
              {/* Unread accent bar */}
              {!message.isRead && <View style={styles.unreadAccent} />}

              <View style={[styles.messageContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: typeConfig.bg }]}>{typeConfig.icon}</View>

                {/* Body */}
                <View style={[styles.textContainer, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                  {/* Top row: type badge + time */}
                  <View style={[styles.messageHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg + "18" }]}>
                      <Text style={[styles.typeBadgeText, { color: typeConfig.bg }]}>{typeConfig.label}</Text>
                    </View>
                    <Text style={styles.messageTime}>{formatTime(message.createdAt)}</Text>
                  </View>

                  {/* Sender name */}
                  <Text style={[styles.senderName, { textAlign: isRTL ? "left" : "right" }]}>
                    {message.clinicName ?? message.storeName ?? message.senderName ?? "الإدارة"}
                  </Text>

                  {/* Title */}
                  <Text
                    style={[
                      styles.messageSubject,
                      { textAlign: isRTL ? "left" : "right", color: message.isRead ? "#2C3E50" : "#1A252F" },
                    ]}
                    numberOfLines={1}
                  >
                    {message.title}
                  </Text>

                  {/* Preview */}
                  <Text style={[styles.messagePreview, { textAlign: isRTL ? "left" : "right" }]} numberOfLines={2}>
                    {message.content}
                  </Text>

                  {message.imageUrl ? (
                    <Image source={{ uri: message.imageUrl }} style={styles.messageImage} resizeMode="cover" />
                  ) : null}

                  {/* Footer row: priority + read status */}
                  <View style={[styles.messageFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.bg }]}>
                      <View style={[styles.priorityDot, { backgroundColor: priorityConfig.color }]} />
                      <Text style={[styles.priorityText, { color: priorityConfig.color }]}>{priorityConfig.label}</Text>
                    </View>
                    <View style={styles.readStatus}>
                      {message.isRead ? (
                        <>
                          <CheckCircle size={13} color={COLORS.success} />
                          <Text style={styles.readStatusText}>مقروءة</Text>
                        </>
                      ) : (
                        <>
                          <Clock size={13} color={COLORS.warning} />
                          <Text style={[styles.readStatusText, { color: COLORS.warning }]}>جديدة</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {messages?.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>لا توجد رسائل</Text>
            <Text style={styles.emptyStateSubtext}>
              {userMode === "veterinarian" ? "ستظهر هنا رسائل المرضى والعيادات الأخرى" : "ستظهر الرسائل هنا عند وصولها"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>الرد على الرسالة</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setReplyModalVisible(false)}>
                <X size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            {selectedMessage && (
              <View style={styles.originalMessage}>
                <Text style={styles.originalTitle}>{selectedMessage?.title}</Text>
                <Text style={styles.originalText}>{selectedMessage?.content}</Text>
                {selectedMessage.imageUrl ? (
                  <Image source={{ uri: selectedMessage.imageUrl }} style={styles.modalImage} resizeMode="cover" />
                ) : null}
                <Text style={styles.originalFrom}>
                  من: {selectedMessage?.clinicName ?? selectedMessage?.storeName ?? selectedMessage?.senderName ?? "الإدارة"}
                </Text>
              </View>
            )}

            {isLoadingReplies ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <ScrollView style={styles.repliesContainer}>
                {replies?.map((reply) => (
                  <View
                    key={reply.id}
                    style={[styles.replyItem, reply.isFromAdmin ? styles.adminReply : styles.userReply]}
                  >
                    <Text style={styles.replySender}>
                      {reply.userName}
                      <Text style={styles.replyTimestamp}> ({formatTime(new Date(reply.createdAt))})</Text>
                    </Text>
                    <Text style={styles.replyContent}>{reply.content}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* <TextInput
              style={styles.replyInput}
              placeholder="اكتب ردك هنا..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            /> */}

            {/* <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setReplyModalVisible(false)}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sendButton, !replyText?.trim() && styles.disabledButton]}
                onPress={() => handleSendReply()}
                disabled={!replyText?.trim()}
              >
                <Send size={16} color={!replyText?.trim() ? COLORS.darkGray : COLORS.white} />
                <Text style={[styles.sendButtonText, { color: !replyText?.trim() ? COLORS.darkGray : COLORS.white }]}>
                  إرسال الرد
                </Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  unreadCard: {
    backgroundColor: "#F0FBF4",
    shadowOpacity: 0.12,
    elevation: 5,
  },
  unreadAccent: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  messageContent: {
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  messageHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 3,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.darkGray,
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 13,
    color: COLORS.darkGray,
    lineHeight: 19,
    marginBottom: 10,
  },
  messageImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  messageFooter: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  readStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  readStatusText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: "center",
  },
  replyButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  replyButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  originalMessage: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  originalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  originalText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  originalFrom: {
    fontSize: 12,
    color: COLORS.primary,
  },
  modalImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    minHeight: 120,
    marginBottom: 16,
    textAlign: "left",
  },
  modalActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.darkGray,
    borderColor: COLORS.gray,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  sendButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  repliesContainer: {
    maxHeight: 350, // Limit height for scrollability
    marginBottom: 16,
    paddingRight: 10,
  },
  replyItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: "80%",
  },
  adminReply: {
    backgroundColor: COLORS.primary + "10",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },
  userReply: {
    backgroundColor: COLORS.lightGray,
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  replySender: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  replyTimestamp: {
    fontSize: 10,
    color: COLORS.gray,
    marginLeft: 5,
  },
  replyContent: {
    fontSize: 14,
    color: COLORS.black,
  },
});
