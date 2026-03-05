import React, { useMemo, useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from "expo-router";
import { ArrowLeft, MessageCircle, AlertCircle, CheckCircle, Clock, Send, X } from "lucide-react-native";
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
    }) // Use -1 or handle undefined appropriately
  );
  const replies = useMemo(() => repliesData?.replies, [repliesData]);

  const { data, isLoading, error } = useQuery(
    trpc.admin.messages.getUserSystemMessages.queryOptions({ userId: Number(user?.id) })
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
      }
    );
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <AlertCircle size={20} color={COLORS.primary} />;
      case "maintenance":
        return <Clock size={20} color={COLORS.warning} />;
      case "update":
        return <CheckCircle size={20} color={COLORS.success} />;
      case "warning":
        return <AlertCircle size={20} color={COLORS.error} />;
      default:
        return <MessageCircle size={20} color={COLORS.darkGray} />;
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

  const getPriorityColor = (priority: Message["priority"]) => {
    switch (priority) {
      case "high":
        return COLORS.error;
      case "normal":
        return COLORS.warning;
      case "low":
        return COLORS.success;
      case "urgent":
        return COLORS.red;
      default:
        return COLORS.gray;
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
      }
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
        {messages?.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[styles.messageCard, !message.isRead && styles.unreadCard]}
            onPress={() => handleMessagePress(message)}
          >
            <View style={[styles.messageContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View style={styles.avatarContainer}>
                <View style={[styles.iconContainer, !message.isRead && styles.iconContainerUnread]}>{getMessageIcon(message.type)}</View>
              </View>

              <View
                style={[styles.textContainer, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}
              >
                <View style={[styles.messageHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <View style={[styles.senderBadge, !message.isRead && styles.senderBadgeUnread]}>
                    <Text style={[styles.senderName, !message.isRead && styles.senderNameUnread, { textAlign: isRTL ? "left" : "right" }]}>الإدارة</Text>
                  </View>
                  <Text style={[styles.messageTime, !message.isRead && styles.messageTimeUnread, { textAlign: isRTL ? "left" : "right" }]}>
                    {formatTime(message.createdAt)}
                  </Text>
                </View>

                <Text style={[styles.messageSubject, !message.isRead && styles.messageSubjectUnread, { textAlign: isRTL ? "left" : "right" }]}>{message.title}</Text>

                <Text style={[styles.messagePreview, !message.isRead && styles.messagePreviewUnread, { textAlign: isRTL ? "left" : "right" }]} numberOfLines={2}>
                  {message.content}
                </Text>

                {message.imageUrl ? (
                  <Image source={{ uri: message.imageUrl }} style={styles.messageImage} resizeMode="cover" />
                ) : null}
              </View>

              <View style={styles.messageActions}>
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(message.priority) }]} />
                {message.isRead ? (
                  <CheckCircle size={16} color={COLORS.success} />
                ) : (
                  <Clock size={16} color={COLORS.warning} />
                )}
                {/* <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => {
                    setSelectedMessage(message);
                    setReplyModalVisible(true);
                  }}
                >
                  <Send size={14} color={COLORS.white} />
                  <Text style={styles.replyButtonText}>رد</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </TouchableOpacity>
        ))}

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
                <Text style={styles.originalFrom}>من: الإدارة</Text>
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
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  unreadCard: {
    backgroundColor: "#C8E6C9",
    borderLeftColor: "#1B5E20",
  },
  messageContent: {
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerUnread: {
    backgroundColor: "#C8E6C9",
  },
  textContainer: {
    justifyContent: "flex-start",
  },
  messageHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  senderBadge: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 6,
  },
  senderBadgeUnread: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  senderNameUnread: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  messageTimeUnread: {
    color: "#1B5E20",
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  messageSubjectUnread: {
    color: "#1B5E20",
    fontWeight: "bold",
  },
  messagePreview: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  messagePreviewUnread: {
    color: "#2E7D32",
  },
  messageImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginTop: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
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
  messageActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    fontSize: 10,
    color: COLORS.gray,
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
