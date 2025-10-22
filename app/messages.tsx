import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import React, { useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, MessageCircle, User, Building2, AlertCircle, Stethoscope } from "lucide-react-native";
import { Stack } from "expo-router";
import { useApp } from "../providers/AppProvider";
import { handleBackNavigation } from "../lib/navigation-utils";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";

interface Message {
  id: string;
  type: "system" | "consultation" | "clinic";
  sender: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  avatar?: string;
}

export default function MessagesScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { userMode, user } = useApp();

  const { data, isLoading, error } = useQuery(
    trpc.admin.messages.getUserSystemMessages.queryOptions({ userId: user?.id })
  );

  const messages = useMemo(() => (data as any)?.messages, [data]);

  const getMessageIcon = (type: string) => {
    if (userMode === "veterinarian") {
      switch (type) {
        case "clinic":
          return <Building2 size={20} color={COLORS.primary} />;
        case "consultation":
          return <Stethoscope size={20} color={COLORS.success} />;
        case "system":
          return <AlertCircle size={20} color={COLORS.warning} />;
        default:
          return <MessageCircle size={20} color={COLORS.darkGray} />;
      }
    } else {
      switch (type) {
        case "clinic":
          return <Building2 size={20} color={COLORS.primary} />;
        case "consultation":
          return <User size={20} color={COLORS.success} />;
        case "system":
          return <AlertCircle size={20} color={COLORS.warning} />;
        default:
          return <MessageCircle size={20} color={COLORS.darkGray} />;
      }
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "الآن";
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const handleMessagePress = (message: Message) => {
    console.log("Message pressed:", message.id);
    // Handle navigation based on message type
    if (message.type === "consultation") {
      // Navigate to consultation details
    } else if (message.type === "clinic") {
      // Navigate to clinic details
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
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
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {messages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[styles.messageCard, !message.read && styles.unreadCard]}
            onPress={() => handleMessagePress(message)}
          >
            <View style={[styles.messageContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <View style={styles.avatarContainer}>
                {message.avatar ? (
                  <Image source={{ uri: message.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.iconContainer}>{getMessageIcon(message.type)}</View>
                )}
              </View>

              <View
                style={[styles.textContainer, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}
              >
                <View style={[styles.messageHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                  <Text style={[styles.senderName, { textAlign: isRTL ? "right" : "left" }]}>{message.sender}</Text>
                  <Text style={[styles.messageTime, { textAlign: isRTL ? "left" : "right" }]}>
                    {formatTime(message.time)}
                  </Text>
                </View>

                <Text style={[styles.messageSubject, { textAlign: isRTL ? "right" : "left" }]}>{message.subject}</Text>

                <Text style={[styles.messagePreview, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={2}>
                  {message.preview}
                </Text>
              </View>

              {!message.read && <View style={styles.unreadIndicator} />}
            </View>
          </TouchableOpacity>
        ))}

        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>لا توجد رسائل</Text>
            <Text style={styles.emptyStateSubtext}>
              {userMode === "veterinarian" ? "ستظهر هنا رسائل المرضى والعيادات الأخرى" : "ستظهر الرسائل هنا عند وصولها"}
            </Text>
          </View>
        )}
      </ScrollView>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
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
  textContainer: {
    justifyContent: "flex-start",
  },
  messageHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 6,
  },
  messagePreview: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
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
});
