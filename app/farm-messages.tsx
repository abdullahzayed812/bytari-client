import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from "../components/Button";
import { Send, Paperclip, Mic, Phone, Video, Image as ImageIcon } from 'lucide-react-native';

// Mock messages data
const mockMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: 'د. محمد أحمد',
    content: 'مرحباً، كيف حال الدفعة الجديدة؟',
    messageType: 'text',
    createdAt: '2024-01-20T10:30:00Z',
    isRead: true
  },
  {
    id: 2,
    senderId: 2,
    senderName: 'أحمد محمد',
    content: 'الحمد لله، الطيور بصحة جيدة. معدل النمو طبيعي',
    messageType: 'text',
    createdAt: '2024-01-20T10:35:00Z',
    isRead: true
  },
  {
    id: 3,
    senderId: 1,
    senderName: 'د. محمد أحمد',
    content: 'ممتاز، هل تم إعطاء التطعيمات في الموعد المحدد؟',
    messageType: 'text',
    createdAt: '2024-01-20T10:40:00Z',
    isRead: true
  },
  {
    id: 4,
    senderId: 2,
    senderName: 'أحمد محمد',
    content: 'نعم، تم إعطاء جميع التطعيمات. إليك صورة من الحقل',
    messageType: 'image',
    attachmentUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
    createdAt: '2024-01-20T11:00:00Z',
    isRead: false
  }
];

export default function FarmMessagesScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const farmId = params.farmId as string;
  const farmName = params.farmName as string;
  const ownerId = params.ownerId as string;
  const currentUserId = 1; // Mock current user ID

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      senderId: currentUserId,
      senderName: 'د. محمد أحمد',
      content: message.trim(),
      messageType: 'text' as const,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleVoiceCall = () => {
    Alert.alert('مكالمة صوتية', 'بدء مكالمة صوتية مع صاحب الحقل');
  };

  const handleVideoCall = () => {
    Alert.alert('مكالمة فيديو', 'بدء مكالمة فيديو مع صاحب الحقل');
  };

  const handleAttachment = () => {
    Alert.alert(
      'إرفاق ملف',
      'اختر نوع الملف',
      [
        { text: 'صورة', onPress: () => console.log('Image selected') },
        { text: 'فيديو', onPress: () => console.log('Video selected') },
        { text: 'ملف', onPress: () => console.log('File selected') },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item }: { item: typeof mockMessages[0] }) => {
    const isOwnMessage = item.senderId === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          {item.messageType === 'text' ? (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.content}
            </Text>
          ) : item.messageType === 'image' ? (
            <View>
              {item.content && (
                <Text style={[
                  styles.messageText,
                  isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                ]}>
                  {item.content}
                </Text>
              )}
              <Image 
                source={{ uri: item.attachmentUrl }} 
                style={styles.messageImage}
                resizeMode="cover"
              />
            </View>
          ) : null}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.farmName}>{farmName}</Text>
          <Text style={styles.headerSubtitle}>محادثة مع صاحب الحقل</Text>
        </View>
        
        <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.headerButton} onPress={handleVoiceCall}>
            <Phone size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
            <Video size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted={false}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Paperclip size={20} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder="اكتب رسالة..."
            placeholderTextColor={COLORS.darkGray}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  headerActions: {
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'right',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.black,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  ownMessageTime: {
    color: COLORS.white,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: COLORS.darkGray,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inputRow: {
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.black,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});