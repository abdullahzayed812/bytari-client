import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../constants/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, Paperclip, X, FileText, Download } from "lucide-react-native";
import * as Linking from "expo-linking";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/providers/AppProvider";
import { useToastContext } from "@/providers/ToastProvider";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import ImageViewerModal from "@/components/ImageViewerModal";

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  senderRole: string;
  senderName: string | null;
  message: string;
  mediaUrl: string | null;
  mediaType: string | null;
  isRead: boolean;
  createdAt: string;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function PoultryFarmChatThreadScreen() {
  const { chatId, title } = useLocalSearchParams<{ chatId: string; title?: string }>();
  const { user } = useApp();
  const { showToast } = useToastContext();
  const flatListRef = useRef<FlatList>(null);
  const [text, setText] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

  const { pickAndUploadImage, takeAndUploadFromCamera, isLoading: isImageUploading } = useImageUpload({
    onUploadSuccess: (url) => setPendingImageUrl(url),
    onUploadError: () => showToast({ type: "error", message: "فشل رفع الصورة" }),
  });

  const { pickAndUploadFile, isLoading: isFileUploading } = useFileUpload({
    onUploadSuccess: (url) => setPendingFileUrl(url),
    onUploadError: () => showToast({ type: "error", message: "فشل رفع الملف" }),
  });

  const isUploading = isImageUploading || isFileUploading;

  const { data, isLoading, refetch } = useQuery({
    ...trpc.poultryFarms.chat.getMessages.queryOptions({ chatId: Number(chatId) }),
    refetchInterval: 5000,
  });
  const messages = ((data as any)?.messages ?? []) as Message[];

  const markAsReadMutation = useMutation(trpc.poultryFarms.chat.markAsRead.mutationOptions());

  useEffect(() => {
    markAsReadMutation.mutate({ chatId: Number(chatId) });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const sendMutation = useMutation(trpc.poultryFarms.chat.sendMessage.mutationOptions());

  const handlePickMedia = () => {
    Alert.alert("إرفاق", "اختر نوع المرفق", [
      { text: "الكاميرا", onPress: () => takeAndUploadFromCamera() },
      { text: "صورة من المعرض", onPress: () => pickAndUploadImage() },
      { text: "ملف", onPress: () => pickAndUploadFile() },
      { text: "إلغاء", style: "cancel" },
    ]);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingImageUrl && !pendingFileUrl) return;
    setText("");
    const mediaUrl = pendingImageUrl ?? pendingFileUrl ?? undefined;
    const mediaType = pendingImageUrl ? "image" : pendingFileUrl ? "file" : undefined;
    setPendingImageUrl(null);
    setPendingFileUrl(null);
    sendMutation.mutate(
      {
        chatId: Number(chatId),
        message: trimmed,
        mediaUrl,
        mediaType: mediaType as any,
      },
      {
        onSuccess: () => {
          refetch();
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        },
        onError: (error) => showToast({ type: "error", message: error.message }),
      },
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === Number(user?.id);
    const senderLabel = isOwn ? "أنت" : (item.senderName ?? "المستخدم");

    return (
      <View style={[styles.messageBubbleWrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
        <Text style={styles.senderLabel}>{senderLabel}</Text>
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          {item.mediaUrl && item.mediaType === "image" && (
            <TouchableOpacity onPress={() => setViewerImageUrl(item.mediaUrl!)}>
              <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
            </TouchableOpacity>
          )}
          {item.mediaUrl && item.mediaType === "file" && (
            <TouchableOpacity
              style={[styles.fileBubble, isOwn ? styles.fileBubbleOwn : styles.fileBubbleOther]}
              onPress={() => Linking.openURL(item.mediaUrl!)}
            >
              <FileText size={22} color={isOwn ? COLORS.white : COLORS.primary} />
              <Text style={[styles.fileNameText, isOwn ? styles.ownText : styles.otherText]} numberOfLines={1}>
                {decodeURIComponent(item.mediaUrl.split("/").pop() ?? "ملف")}
              </Text>
              <Download size={18} color={isOwn ? COLORS.white : COLORS.primary} />
            </TouchableOpacity>
          )}
          {item.message.trim().length > 0 && (
            <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>{item.message}</Text>
          )}
        </View>
        <Text style={styles.timeText}>{formatMessageTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: title || "المحادثة",
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
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            style={{ flex: 1 }}
          />
        )}

        <ImageViewerModal visible={!!viewerImageUrl} imageUrl={viewerImageUrl ?? ""} onClose={() => setViewerImageUrl(null)} />

        <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 120}>
          {(pendingImageUrl || pendingFileUrl || isUploading) && (
            <View style={styles.mediaPreviewBar}>
              {pendingImageUrl ? (
                <Image source={{ uri: pendingImageUrl }} style={styles.mediaPreviewThumb} />
              ) : pendingFileUrl ? (
                <View style={styles.filePreviewBox}>
                  <FileText size={22} color={COLORS.primary} />
                  <Text style={styles.filePreviewName} numberOfLines={1}>
                    {decodeURIComponent(pendingFileUrl.split("/").pop() ?? "ملف")}
                  </Text>
                </View>
              ) : (
                <View style={[styles.mediaPreviewThumb, { backgroundColor: COLORS.lightGray }]} />
              )}
              {isUploading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />}
              {!isUploading && (pendingImageUrl || pendingFileUrl) && <Text style={styles.mediaReadyText}>جاهز للإرسال</Text>}
              {!isUploading && (
                <TouchableOpacity onPress={() => { setPendingImageUrl(null); setPendingFileUrl(null); }} style={styles.mediaRemoveBtn}>
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.inputBar}>
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && !pendingImageUrl && !pendingFileUrl && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={(!text.trim() && !pendingImageUrl && !pendingFileUrl) || sendMutation.isPending || isUploading}
            >
              {sendMutation.isPending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Send size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              placeholder="اكتب رسالة..."
              placeholderTextColor={COLORS.darkGray}
              multiline
              maxLength={1000}
              textAlign="right"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.attachButton} onPress={handlePickMedia} disabled={isUploading}>
              <Paperclip size={22} color={COLORS.darkGray} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
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
  loader: {
    marginTop: 40,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageBubbleWrapper: {
    maxWidth: "78%",
    gap: 3,
  },
  ownWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderLabel: {
    fontSize: 11,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  ownText: {
    color: COLORS.white,
    textAlign: "right",
  },
  otherText: {
    color: COLORS.black,
    textAlign: "right",
  },
  timeText: {
    fontSize: 11,
    color: COLORS.darkGray,
  },
  inputBar: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.gray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.black,
    maxHeight: 100,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaPreviewBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 8,
  },
  mediaPreviewThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  mediaReadyText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.success,
    textAlign: "right",
  },
  mediaRemoveBtn: {
    padding: 4,
  },
  mediaImage: {
    width: 200,
    height: 160,
    borderRadius: 10,
    marginBottom: 4,
  },
  fileBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
    maxWidth: 220,
  },
  fileBubbleOwn: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  fileBubbleOther: {
    backgroundColor: COLORS.gray,
  },
  fileNameText: {
    flex: 1,
    fontSize: 13,
  },
  filePreviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  filePreviewName: {
    flex: 1,
    fontSize: 12,
    color: COLORS.black,
  },
});
