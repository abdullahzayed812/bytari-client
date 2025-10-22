import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, MessageCircle, Building2, AlertCircle } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useApp } from "../../providers/AppProvider";
import { trpc } from "../../lib/trpc";

interface Message {
  id: string;
  type: 'system' | 'clinic';
  sender: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  avatar?: string;
}

const mockMessages: Message[] = [

  {
    id: '2',
    type: 'system',
    sender: 'إدارة التطبيق',
    subject: 'مرحباً بك في تطبيق الحيوانات الأليفة',
    preview: 'نرحب بك في تطبيقنا! يمكنك الآن الاستفادة من جميع الخدمات المتاحة مثل الاستشارات البيطرية...',
    time: '2024-01-14T10:15:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'clinic',
    sender: 'عيادة الرحمة البيطرية',
    subject: 'تأكيد موعد الفحص',
    preview: 'تم تأكيد موعدك لفحص حيوانك الأليف "فلافي" يوم الأحد الساعة 10:00 صباحاً...',
    time: '2024-01-13T16:45:00Z',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2013&q=80',
  },

  {
    id: '5',
    type: 'system',
    sender: 'إدارة التطبيق',
    subject: 'تحديث سياسة الخصوصية',
    preview: 'تم تحديث سياسة الخصوصية الخاصة بنا. يرجى مراجعة التغييرات الجديدة...',
    time: '2024-01-11T13:00:00Z',
    read: true,
  },
];

export default function MessagesScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // استعلام الرسائل من قاعدة البيانات
  const messagesQuery = trpc.admin.messages.getUserSystemMessages.useQuery(
    { userId: parseInt(user?.id || '0') },
    { 
      enabled: !!user?.id && !isNaN(parseInt(user.id)),
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  useEffect(() => {
    if (messagesQuery.data) {
      // تحويل البيانات من قاعدة البيانات إلى تنسيق الرسائل
      const dbMessages: Message[] = messagesQuery.data.map((msg: any) => ({
        id: msg.id.toString(),
        type: msg.type === 'system' ? 'system' : 'clinic',
        sender: msg.type === 'system' ? 'إدارة التطبيق' : 'استشارة طبية',
        subject: msg.title,
        preview: msg.content.substring(0, 100) + '...',
        time: msg.sentAt || msg.createdAt,
        read: msg.isRead || false,
        avatar: undefined
      }));
      
      setMessages(dbMessages);
      setIsLoading(false);
    } else if (!messagesQuery.isLoading) {
      // إذا لم تكن هناك بيانات من قاعدة البيانات، استخدم البيانات الوهمية
      setMessages(mockMessages);
      setIsLoading(false);
    }
  }, [messagesQuery.data, messagesQuery.isLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await messagesQuery.refetch();
    setRefreshing(false);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'clinic':
        return <Building2 size={20} color={COLORS.primary} />;

      case 'system':
        return <AlertCircle size={20} color={COLORS.warning} />;
      default:
        return <MessageCircle size={20} color={COLORS.darkGray} />;
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  const handleMessagePress = (message: Message) => {
    console.log('Message pressed:', message.id);
    // Handle navigation based on message type
    if (message.type === 'clinic') {
      // Navigate to clinic details
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'الرسائل',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.black,
            fontSize: 18,
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              {isRTL ? (
                <ArrowRight size={24} color={COLORS.black} />
              ) : (
                <ArrowLeft size={24} color={COLORS.black} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        // Pull to refresh functionality will be added later
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل الرسائل...</Text>
          </View>
        ) : messages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={[
              styles.messageCard,
              !message.read && styles.unreadCard,
            ]}
            onPress={() => handleMessagePress(message)}
          >
            <View style={[styles.messageContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.avatarContainer}>
                {message.avatar ? (
                  <Image source={{ uri: message.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.iconContainer}>
                    {getMessageIcon(message.type)}
                  </View>
                )}
              </View>
              
              <View style={[styles.textContainer, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                <View style={[styles.messageHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.senderName, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {message.sender}
                  </Text>
                  <Text style={[styles.messageTime, { textAlign: isRTL ? 'left' : 'right' }]}>
                    {formatTime(message.time)}
                  </Text>
                </View>
                
                <Text style={[styles.messageSubject, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {message.subject}
                </Text>
                
                <Text style={[styles.messagePreview, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {message.preview}
                </Text>
              </View>
              
              {!message.read && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {!isLoading && messages.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>لا توجد رسائل</Text>
            <Text style={styles.emptyStateSubtext}>ستظهر الرسائل هنا عند وصولها</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'flex-start',
  },
  messageHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.lightGray,
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});