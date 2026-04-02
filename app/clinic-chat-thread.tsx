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
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../constants/colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send, PauseCircle, PlayCircle } from "lucide-react-native";
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
  isRead: boolean;
  createdAt: string;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function ClinicChatThreadScreen() {
  const { chatId, petName, clinicName, ownerName, senderRole, clinicId, initialIsActive } =
    useLocalSearchParams<{
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

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    sendMutation.mutate(
      { chatId: Number(chatId), message: trimmed, senderRole: senderRole as "owner" | "clinic" },
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
    const senderLabel = isOwn ? "أنت" : (isVet ? (ownerName ?? "صاحب الحيوان") : (clinicName ?? "العيادة"));

    return (
      <View style={[styles.messageBubbleWrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
        <Text style={styles.senderLabel}>{senderLabel}</Text>
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.message}
          </Text>
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

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
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
          <View style={styles.inputBar}>
            <TouchableOpacity
              style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sendMutation.isPending}
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
          </View>
        )}
      </KeyboardAvoidingView>
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
});
