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
  Linking,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../constants/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, PauseCircle, PlayCircle, Paperclip, X, Play } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "@/lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "@/providers/AppProvider";
import { useToastContext } from "@/providers/ToastProvider";

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

export default function ClinicChatThreadScreen() {
  const { chatId, petName, clinicName, ownerName, senderRole, clinicId, initialIsActive } = useLocalSearchParams<{
    chatId: string;
    petName: string;
    clinicName?: string;
    ownerName?: string;
    senderRole: string;
    clinicId?: string;
    initialIsActive?: string;
  }>();
  const { user } = useApp();
  const { showToast } = useToastContext();
  const flatListRef = useRef<FlatList>(null);
  const [text, setText] = useState("");
  const [chatIsActive, setChatIsActive] = useState(initialIsActive !== "false");
  const [pendingMedia, setPendingMedia] = useState<{ uri: string; type: "image" | "video"; url?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isVet = senderRole === "clinic";

  const { data, isLoading, refetch } = useQuery({
    ...trpc.clinics.chat.getMessages.queryOptions({ chatId: Number(chatId) }),
    refetchInterval: 5000,
  });
  const messages = ((data as any)?.messages ?? []) as Message[];

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const sendMutation = useMutation(trpc.clinics.chat.sendMessage.mutationOptions());
  const toggleMutation = useMutation(trpc.clinics.chat.toggleActive.mutationOptions());

  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطأ", "يلزم الإذن للوصول إلى المكتبة");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const isVideo = asset.type === "video";
    setPendingMedia({ uri: asset.uri, type: isVideo ? "video" : "image" });

    // Upload immediately
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = asset.uri.split("/").pop() || (isVideo ? "video.mp4" : "image.jpg");
      const ext = /\.(\w+)$/.exec(filename)?.[1] ?? (isVideo ? "mp4" : "jpg");
      const mimeType = isVideo ? `video/${ext}` : `image/${ext}`;
      // @ts-ignore
      formData.append("file", { uri: asset.uri, name: filename, type: mimeType });
      const response = await fetch(`${API_URL}/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (data.success && data.url) {
        setPendingMedia((prev) => (prev ? { ...prev, url: data.url } : null));
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      showToast({ type: "error", message: "فشل رفع الملف" });
      setPendingMedia(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingMedia?.url) return;
    setText("");
    const mediaUrl = pendingMedia?.url;
    const mediaType = pendingMedia?.type;
    setPendingMedia(null);
    sendMutation.mutate(
      {
        chatId: Number(chatId),
        message: trimmed,
        senderRole: senderRole as "owner" | "clinic",
        mediaUrl,
        mediaType,
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

  const handleToggle = () => {
    if (!clinicId) return;
    toggleMutation.mutate(
      { chatId: Number(chatId), clinicId: Number(clinicId) },
      {
        onSuccess: (result) => {
          const updated = (result as any)?.chat;
          if (updated) setChatIsActive(updated.isActive);
        },
        onError: (error) => showToast({ type: "error", message: error.message }),
      },
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === Number(user?.id);
    const senderLabel = isOwn ? "أنت" : isVet ? (ownerName ?? "صاحب الحيوان") : (clinicName ?? "العيادة");

    return (
      <View style={[styles.messageBubbleWrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
        <Text style={styles.senderLabel}>{senderLabel}</Text>
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          {item.mediaUrl && item.mediaType === "image" && (
            <TouchableOpacity onPress={() => Linking.openURL(item.mediaUrl!)}>
              <Image source={{ uri: item.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
            </TouchableOpacity>
          )}
          {item.mediaUrl && item.mediaType === "video" && (
            <TouchableOpacity style={styles.videoThumb} onPress={() => Linking.openURL(item.mediaUrl!)}>
              <View style={styles.playIcon}>
                <Play size={28} color={COLORS.white} fill={COLORS.white} />
              </View>
              <Text style={styles.videoLabel}>فيديو — اضغط للتشغيل</Text>
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

  const isPaused = chatIsActive === false;

  return (
    <>
      <Stack.Screen
        options={{
          title: petName ?? "المحادثة",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: isVet
            ? () => (
                <TouchableOpacity onPress={handleToggle} style={styles.backButton}>
                  {isPaused ? (
                    <PlayCircle size={24} color={COLORS.darkGray} />
                  ) : (
                    <PauseCircle size={24} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              )
            : undefined,
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

        {/* Paused banner for owner */}
        {isPaused && !isVet && (
          <View style={styles.pausedBanner}>
            <Text style={styles.pausedBannerText}>تم إيقاف المحادثة من قبل العيادة</Text>
          </View>
        )}

        {/* Input bar — hide for owner when paused */}
        {(!isPaused || isVet) && (
          <KeyboardAvoidingView behavior={"padding"} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 120}>
            {/* Media preview */}
            {pendingMedia && (
              <View style={styles.mediaPreviewBar}>
                {pendingMedia.type === "image" ? (
                  <Image source={{ uri: pendingMedia.uri }} style={styles.mediaPreviewThumb} />
                ) : (
                  <View style={[styles.mediaPreviewThumb, styles.videoPreviewBox]}>
                    <Play size={20} color={COLORS.white} />
                  </View>
                )}
                {isUploading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />}
                {!isUploading && pendingMedia.url && <Text style={styles.mediaReadyText}>جاهز للإرسال</Text>}
                <TouchableOpacity onPress={() => setPendingMedia(null)} style={styles.mediaRemoveBtn}>
                  <X size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputBar}>
              <TouchableOpacity
                style={[styles.sendButton, !text.trim() && !pendingMedia?.url && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={(!text.trim() && !pendingMedia?.url) || sendMutation.isPending || isUploading}
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
        )}
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
  pausedBanner: {
    backgroundColor: "#FFF3CD",
    borderTopWidth: 1,
    borderTopColor: "#FFEAA7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  pausedBannerText: {
    fontSize: 13,
    color: "#856404",
    textAlign: "center",
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
  videoPreviewBox: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
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
  videoThumb: {
    width: 200,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  playIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoLabel: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.85,
  },
});
