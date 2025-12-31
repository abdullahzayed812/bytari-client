import React, { useMemo, useState } from "react";
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
import { Stack, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { COLORS } from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";
import { AdminTopBar } from "@/components/AdminTopBar";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ImageIcon,
  Link,
  MessageCircle,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react-native";

interface AdminMessage {
  id: string;
  senderId: number;
  senderName: string;
  title: string;
  content: string;
  type: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "sent" | "replied"; // Add this
  createdAt: Date;
  targetAudience: "all" | "users" | "vets" | "students" | "clinics" | "stores" | "specific" | "multiple";
  targetCategories: string[] | null;
  targetUserIds: number[] | null;
  imageUrl: string | null;
  linkUrl: string | null;
  replyCount: number;
}

export default function AdminMessagesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient(); // Add useQueryClient
  const { hasAdminAccess, isSuperAdmin, isModerator, user } = useApp();

  const {
    data: messagesData,
    isLoading,
    error,
  } = useQuery(trpc.admin.messages.getAllSystemMessages.queryOptions({ adminId: Number(user?.id) }));

  const messages = useMemo(() => messagesData?.messages, [messagesData]);

  const markAsReadMutation = useMutation(trpc.admin.messages.markAsRead.mutationOptions());
  const sendSystemMessageReplyMutation = useMutation(trpc.admin.messages.sendReply.mutationOptions());

  const [filter, setFilter] = useState<"all" | "pending" | "replied" | "high">("all");
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [replyModalVisible, setReplyModalVisible] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [sendMessageModalVisible, setSendMessageModalVisible] = useState<boolean>(false);

  // Fetch replies for the selected message
  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    refetch: refetchReplies,
  } = useQuery({
    ...trpc.admin.messages.getReplies.queryOptions({
      messageId: selectedMessage?.id ? Number(selectedMessage.id) : -1,
    }),
    enabled: replyModalVisible && !!selectedMessage?.id, // Only fetch when modal is visible and message is selected
  });
  const replies = useMemo(() => repliesData?.replies, [repliesData]);
  const [newMessage, setNewMessage] = useState<{
    title: string;
    content: string;
    type: "announcement" | "maintenance" | "update" | "warning";
    priority: "low" | "normal" | "high" | "urgent";
    targetAudience:
      | "all"
      | "users"
      | "vets"
      | "students"
      | "clinics"
      | "stores"
      | "poultry_owners"
      | "poultry_vets"
      | "union_officials"
      | "hospital_officials"
      | "multiple";
    targetCategories: string[];
    locationTargeting: {
      enabled: boolean;
      country?: string;
      governorate?: string;
    };
    imageUrl?: string;
    linkUrl?: string;
  }>({
    title: "",
    content: "",
    type: "announcement",
    priority: "normal",
    targetAudience: "all",
    targetCategories: [],
    locationTargeting: {
      enabled: false,
      country: "",
      governorate: "",
    },
    imageUrl: "",
    linkUrl: "",
  });

  const sendMessageMutation = useMutation(trpc.admin.messages.sendSystemMessage.mutationOptions());

  if (!hasAdminAccess && !isModerator) {
    Alert.alert("خطأ", "ليس لديك صلاحية للوصول إلى هذه الصفحة");
    router.back();
    return null;
  }

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
        return <MessageCircle size={20} color={COLORS.gray} />;
    }
  };

  const getStatusIcon = (isRead: boolean) => {
    return isRead ? <CheckCircle size={16} color={COLORS.success} /> : <Clock size={16} color={COLORS.warning} />;
  };

  const getPriorityColor = (priority: AdminMessage["priority"]) => {
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

  const handleReply = (message: AdminMessage) => {
    setSelectedMessage(message);
    setReplyModalVisible(true);
  };

  // const sendReply = () => {
  //   if (!replyText?.trim() || !selectedMessage) return;

  //   const updatedMessages = messages?.map((msg) => {
  //     if (msg.id === selectedMessage.id) {
  //       return {
  //         ...msg,
  //         status: "replied" as const,
  //         reply: replyText,
  //         repliedBy: {
  //           name: user?.name || "مشرف",
  //           role: isSuperAdmin ? "المدير العام" : "مشرف",
  //           timestamp: new Date(),
  //         },
  //       };
  //     }
  //     return msg;
  //   });

  //   // setMessages(updatedMessages);
  //   setReplyModalVisible(false);
  //   setReplyText("");
  //   setSelectedMessage(null);

  //   Alert.alert("تم الإرسال", "تم إرسال الرد بنجاح");
  // };

  const handleSendNewMessage = async () => {
    if (!newMessage?.title?.trim() || !newMessage?.content?.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (newMessage.targetAudience === "multiple" && newMessage.targetCategories.length === 0) {
      Alert.alert("خطأ", "يرجى اختيار فئة واحدة على الأقل");
      return;
    }

    sendMessageMutation.mutate(
      {
        senderId: Number(user?.id),
        title: newMessage.title,
        content: newMessage.content,
        type: newMessage.type,
        targetAudience: newMessage.targetAudience,
        targetCategories: newMessage.targetAudience === "multiple" ? newMessage.targetCategories : undefined,
        priority: newMessage.priority,
      },
      {
        onSuccess: () => {
          Alert.alert("تم الإرسال", "تم إرسال الرسالة بنجاح");
          setSendMessageModalVisible(false);
          setNewMessage({
            title: "",
            content: "",
            type: "announcement",
            priority: "normal",
            targetAudience: "all",
            targetCategories: [],
            locationTargeting: {
              enabled: false,
              country: "",
              governorate: "",
            },
            imageUrl: "",
            linkUrl: "",
          });
          queryClient.invalidateQueries(trpc.admin.messages.getAllSystemMessages.queryKey as any);
        },
        onError: (error) => {
          Alert.alert("خطأ", "حدث خطأ أثناء إرسال الرسالة");
        },
      }
    );
  };

  const toggleCategory = (category: string) => {
    setNewMessage((prev) => ({
      ...prev,
      targetCategories: prev.targetCategories.includes(category)
        ? prev.targetCategories.filter((c) => c !== category)
        : [...prev.targetCategories, category],
    }));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "users":
        return "أصحاب الحيوانات";
      case "vets":
        return "الأطباء البيطريين";
      case "students":
        return "الطلاب";
      case "clinics":
        return "أصحاب العيادات";
      case "stores":
        return "أصحاب المذاخر";
      case "poultry_owners":
        return "أصحاب الدواجن";
      case "poultry_vets":
        return "أطباء الدواجن";
      case "union_officials":
        return "مسؤولين النقابة";
      case "hospital_officials":
        return "مسؤولين المستشفيات";
      default:
        return category;
    }
  };

  const getTargetAudienceLabel = (audience: string) => {
    switch (audience) {
      case "all":
        return "الكل";
      case "users":
        return "أصحاب الحيوانات";
      case "vets":
        return "الأطباء البيطريين";
      case "students":
        return "الطلاب";
      case "clinics":
        return "أصحاب العيادات";
      case "stores":
        return "أصحاب المذاخر";
      case "poultry_owners":
        return "أصحاب الدواجن";
      case "poultry_vets":
        return "أطباء الدواجن";
      case "union_officials":
        return "مسؤولين النقابة";
      case "hospital_officials":
        return "مسؤولين المستشفيات";
      case "multiple":
        return "فئات متعددة";
      default:
        return audience;
    }
  };

  const markAsRead = (messageId: number) => {
    if (!user?.id) return;
    markAsReadMutation.mutate(
      { userId: Number(user.id), messageId: messageId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.admin.messages.getAllSystemMessages.queryKey as any);
        },
      }
    );
  };

  const sendReply = () => {
    if (!replyText?.trim() || !selectedMessage || !user?.id) return;

    sendSystemMessageReplyMutation.mutate(
      {
        messageId: Number(selectedMessage.id),
        userId: user.id,
        content: replyText,
        isFromAdmin: true,
      },
      {
        onSuccess: () => {
          Alert.alert("تم الإرسال", "تم إرسال الرد بنجاح");
          // setReplyModalVisible(false);
          setReplyText("");
          setSelectedMessage(null);
          queryClient.invalidateQueries(trpc.admin.messages.getAllSystemMessages);
        },
        onError: (error) => {
          Alert.alert("خطأ", `حدث خطأ أثناء إرسال الرد: ${error.message}`);
        },
      }
    );
  };

  const filteredMessages = messages?.filter((message) => {
    switch (filter) {
      case "pending":
        return message.status === "sent"; // Assuming 'pending' means not yet replied
      case "replied":
        return message.status === "replied";
      case "high":
        return message.priority === "high" || message.priority === "urgent";
      default:
        return true;
    }
  });

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "announcement":
        return "إعلان";
      case "maintenance":
        return "صيانة";
      case "update":
        return "تحديث";
      case "warning":
        return "تحذير";
      default:
        return "رسالة";
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "رسائل الإدارة",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <AdminTopBar />

      {/* Send New Message Button */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.sendMessageButton} onPress={() => setSendMessageModalVisible(true)}>
          <Plus size={20} color={COLORS.white} />
          <Text style={styles.sendMessageButtonText}>إرسال رسالة جديدة</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>الكل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "pending" && styles.activeFilter]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.activeFilterText]}>قيد الانتظار</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "replied" && styles.activeFilter]}
          onPress={() => setFilter("replied")}
        >
          <Text style={[styles.filterText, filter === "replied" && styles.activeFilterText]}>تم الرد</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === "high" && styles.activeFilter]}
          onPress={() => setFilter("high")}
        >
          <Text style={[styles.filterText, filter === "high" && styles.activeFilterText]}>عالية الأولوية</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredMessages?.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[
              styles.messageCard,
              !message.isRead && { borderLeftWidth: 4, borderLeftColor: COLORS.warning, backgroundColor: "#fffbf0" },
            ]}
            // onPress={() => !message.isRead && markAsRead(Number(message.id))}
          >
            <View style={styles.messageHeader}>
              <View style={styles.messageInfo}>
                {getMessageIcon(message.type)}
                <View style={styles.messageContent}>
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messageType}>{getTypeLabel(message.type)}</Text>
                  <Text style={styles.messageFrom}>من: {message.senderName}</Text>
                </View>
              </View>

              <View style={styles.messageActions}>
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(message.priority) }]} />
                {getStatusIcon(message.isRead)}
                {message.replyCount > 0 && (
                  <View style={styles.replyCountContainer}>
                    <MessageCircle size={14} color={COLORS.gray} />
                    <Text style={styles.replyCountText}>{message.replyCount}</Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.messageText} numberOfLines={3}>
              {message.content}
            </Text>

            <View style={styles.messageFooter}>
              <Text style={styles.timestamp}>{formatTime(new Date(message.createdAt))}</Text>

              {
                <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(message)}>
                  <Send size={14} color={COLORS.white} />
                  <Text style={styles.replyButtonText}>رد</Text>
                </TouchableOpacity>
              }
            </View>
          </TouchableOpacity>
        ))}

        {filteredMessages?.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد رسائل</Text>
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
                <Text style={styles.originalFrom}>من: {selectedMessage?.senderName}</Text>
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

            <TextInput
              style={styles.replyInput}
              placeholder="اكتب ردك هنا..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setReplyModalVisible(false)}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sendButton, !replyText?.trim() && styles.disabledButton]}
                onPress={sendReply}
                disabled={!replyText?.trim()}
              >
                <Send size={16} color={!replyText?.trim() ? COLORS.darkGray : COLORS.white} />
                <Text style={[styles.sendButtonText, { color: !replyText?.trim() ? COLORS.darkGray : COLORS.white }]}>
                  إرسال الرد
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send New Message Modal */}
      <Modal
        visible={sendMessageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSendMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>إرسال رسالة جديدة</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSendMessageModalVisible(false)}>
                  <X size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              {/* Message Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>عنوان الرسالة *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="أدخل عنوان الرسالة"
                  value={newMessage.title}
                  onChangeText={(text) => setNewMessage((prev) => ({ ...prev, title: text }))}
                />
              </View>

              {/* Message Content */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>محتوى الرسالة *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="أدخل محتوى الرسالة"
                  value={newMessage.content}
                  onChangeText={(text) => setNewMessage((prev) => ({ ...prev, content: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Message Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نوع الرسالة</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { key: "announcement", label: "إعلان" },
                    { key: "maintenance", label: "صيانة" },
                    { key: "update", label: "تحديث" },
                    { key: "warning", label: "تحذير" },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.key}
                      style={[styles.optionButton, newMessage.type === type.key && styles.selectedOption]}
                      onPress={() =>
                        setNewMessage((prev) => ({
                          ...prev,
                          type: type.key as any,
                        }))
                      }
                    >
                      <Text style={[styles.optionText, newMessage.type === type.key && styles.selectedOptionText]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الأولوية</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { key: "low", label: "منخفضة" },
                    { key: "normal", label: "عادية" },
                    { key: "high", label: "عالية" },
                    { key: "urgent", label: "عاجلة" },
                  ].map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      style={[styles.optionButton, newMessage.priority === priority.key && styles.selectedOption]}
                      onPress={() =>
                        setNewMessage((prev) => ({
                          ...prev,
                          priority: priority.key as any,
                        }))
                      }
                    >
                      <Text
                        style={[styles.optionText, newMessage.priority === priority.key && styles.selectedOptionText]}
                      >
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Target Audience */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الفئة المستهدفة *</Text>
                <View style={styles.optionsContainer}>
                  {[
                    { key: "all", label: "الكل" },
                    { key: "users", label: "أصحاب الحيوانات" },
                    { key: "vets", label: "الأطباء البيطريين" },
                    { key: "students", label: "الطلاب" },
                    { key: "clinics", label: "أصحاب العيادات" },
                    { key: "stores", label: "أصحاب المذاخر" },
                    { key: "poultry_owners", label: "أصحاب الدواجن" },
                    { key: "poultry_vets", label: "أطباء الدواجن" },
                    { key: "union_officials", label: "مسؤولين النقابة" },
                    { key: "hospital_officials", label: "مسؤولين المستشفيات" },
                    { key: "multiple", label: "فئات متعددة" },
                  ].map((audience) => (
                    <TouchableOpacity
                      key={audience.key}
                      style={[styles.optionButton, newMessage.targetAudience === audience.key && styles.selectedOption]}
                      onPress={() =>
                        setNewMessage((prev) => ({
                          ...prev,
                          targetAudience: audience.key as any,
                          targetCategories: audience.key !== "multiple" ? [] : prev.targetCategories,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          newMessage.targetAudience === audience.key && styles.selectedOptionText,
                        ]}
                      >
                        {audience.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Multiple Categories Selection */}
              {newMessage.targetAudience === "multiple" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>اختر الفئات *</Text>
                  <View style={styles.categoriesContainer}>
                    {[
                      "users",
                      "vets",
                      "students",
                      "clinics",
                      "stores",
                      "poultry_owners",
                      "poultry_vets",
                      "union_officials",
                      "hospital_officials",
                    ].map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.categoryItem}
                        onPress={() => toggleCategory(category)}
                      >
                        <View
                          style={[styles.checkbox, newMessage.targetCategories.includes(category) && styles.checkedBox]}
                        >
                          {newMessage.targetCategories.includes(category) && (
                            <CheckCircle size={16} color={COLORS.white} />
                          )}
                        </View>
                        <Text style={styles.categoryLabel}>{getCategoryLabel(category)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Location Targeting */}
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.locationToggle}
                  onPress={() =>
                    setNewMessage((prev) => ({
                      ...prev,
                      locationTargeting: {
                        ...prev.locationTargeting,
                        enabled: !prev.locationTargeting.enabled,
                        country: !prev.locationTargeting.enabled ? prev.locationTargeting.country : "",
                        governorate: !prev.locationTargeting.enabled ? prev.locationTargeting.governorate : "",
                      },
                    }))
                  }
                >
                  <View style={[styles.checkbox, newMessage.locationTargeting.enabled && styles.checkedBox]}>
                    {newMessage.locationTargeting.enabled && <CheckCircle size={16} color={COLORS.white} />}
                  </View>
                  <Text style={styles.categoryLabel}>تحديد الموقع (اختياري)</Text>
                </TouchableOpacity>

                {newMessage.locationTargeting.enabled && (
                  <View style={styles.locationContainer}>
                    {/* Country Selection */}
                    <View style={styles.locationRow}>
                      <Text style={styles.locationLabel}>البلد:</Text>
                      <View style={styles.locationOptions}>
                        {["العراق", "السعودية", "الأردن", "الكويت", "الإمارات", "قطر", "البحرين", "عمان"].map(
                          (country) => (
                            <TouchableOpacity
                              key={country}
                              style={[
                                styles.locationButton,
                                newMessage.locationTargeting.country === country && styles.selectedLocationButton,
                              ]}
                              onPress={() =>
                                setNewMessage((prev) => ({
                                  ...prev,
                                  locationTargeting: {
                                    ...prev.locationTargeting,
                                    country: country,
                                    governorate: "", // Reset governorate when country changes
                                  },
                                }))
                              }
                            >
                              <Text
                                style={[
                                  styles.locationButtonText,
                                  newMessage.locationTargeting.country === country && styles.selectedLocationButtonText,
                                ]}
                              >
                                {country}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>

                    {/* Governorate Selection - Only show if Iraq is selected */}
                    {newMessage.locationTargeting.country === "العراق" && (
                      <View style={styles.locationRow}>
                        <Text style={styles.locationLabel}>المحافظة:</Text>
                        <View style={styles.locationOptions}>
                          {[
                            "بغداد",
                            "البصرة",
                            "نينوى",
                            "أربيل",
                            "النجف",
                            "كربلاء",
                            "الأنبار",
                            "دهوك",
                            "كركوك",
                            "بابل",
                            "ديالى",
                            "المثنى",
                            "القادسية",
                            "صلاح الدين",
                            "واسط",
                            "ذي قار",
                            "ميسان",
                            "السليمانية",
                          ].map((governorate) => (
                            <TouchableOpacity
                              key={governorate}
                              style={[
                                styles.locationButton,
                                newMessage.locationTargeting.governorate === governorate &&
                                  styles.selectedLocationButton,
                              ]}
                              onPress={() =>
                                setNewMessage((prev) => ({
                                  ...prev,
                                  locationTargeting: {
                                    ...prev.locationTargeting,
                                    governorate: governorate,
                                  },
                                }))
                              }
                            >
                              <Text
                                style={[
                                  styles.locationButtonText,
                                  newMessage.locationTargeting.governorate === governorate &&
                                    styles.selectedLocationButtonText,
                                ]}
                              >
                                {governorate}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Location Summary */}
                    {(newMessage.locationTargeting.country || newMessage.locationTargeting.governorate) && (
                      <View style={styles.locationSummary}>
                        <Text style={styles.locationSummaryText}>
                          سيتم إرسال الرسالة إلى المستخدمين في:{" "}
                          {newMessage.locationTargeting.governorate &&
                            `محافظة ${newMessage.locationTargeting.governorate}, `}
                          {newMessage.locationTargeting.country}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Image Upload */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رفع صورة (اختياري)</Text>
                <View style={styles.mediaContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="أدخل رابط الصورة"
                    value={newMessage.imageUrl}
                    onChangeText={(text) => setNewMessage((prev) => ({ ...prev, imageUrl: text }))}
                  />
                  <TouchableOpacity style={styles.mediaButton}>
                    <ImageIcon size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {newMessage.imageUrl ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: newMessage.imageUrl }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setNewMessage((prev) => ({ ...prev, imageUrl: "" }))}
                    >
                      <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              {/* Link URL */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رابط إضافي (اختياري)</Text>
                <View style={styles.mediaContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="أدخل الرابط"
                    value={newMessage.linkUrl}
                    onChangeText={(text) => setNewMessage((prev) => ({ ...prev, linkUrl: text }))}
                  />
                  <TouchableOpacity style={styles.mediaButton}>
                    <Link size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {newMessage.linkUrl ? (
                  <View style={styles.linkPreview}>
                    <Link size={16} color={COLORS.primary} />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {newMessage.linkUrl}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setNewMessage((prev) => ({ ...prev, linkUrl: "" }))}
                    >
                      <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setSendMessageModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!newMessage?.title?.trim() ||
                      !newMessage?.content?.trim() ||
                      (newMessage.targetAudience === "multiple" && newMessage.targetCategories.length === 0)) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSendNewMessage}
                  disabled={
                    !newMessage?.title?.trim() ||
                    !newMessage?.content?.trim() ||
                    (newMessage.targetAudience === "multiple" && newMessage.targetCategories.length === 0)
                  }
                >
                  <Send size={16} color={COLORS.white} />
                  <Text style={styles.sendButtonText}>إرسال الرسالة</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  activeFilterText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  messageType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  messageFrom: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  messageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  replyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
  },
  replyText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "500",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.gray,
  },
  replyButton: {
    flexDirection: "row",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
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
    flexDirection: "row",
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
  replyInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    minHeight: 120,
    marginBottom: 16,
    textAlign: "right",
  },
  modalActions: {
    flexDirection: "row",
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
    flexDirection: "row",
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
  headerActions: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sendMessageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    gap: 8,
  },
  sendMessageButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: COLORS.white,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryLabel: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  mediaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mediaButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: {
    marginTop: 8,
    position: "relative",
    alignSelf: "flex-start",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  linkPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  locationToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  locationContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  locationRow: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  locationOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  selectedLocationButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  locationButtonText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  selectedLocationButtonText: {
    color: COLORS.white,
  },
  locationSummary: {
    backgroundColor: COLORS.primary + "20",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationSummaryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    textAlign: "center",
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
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  userReply: {
    backgroundColor: COLORS.lightGray,
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
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
