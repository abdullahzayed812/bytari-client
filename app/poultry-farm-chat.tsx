import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Send, Camera, Paperclip, Phone, Video, MoreVertical } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderType: 'vet' | 'farmer' | 'admin';
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  fileName?: string;
  isRead: boolean;
}

// Mock messages data
const mockMessages: Message[] = [
  {
    id: '1',
    text: 'مرحباً دكتور، أريد استشارة حول حالة الدواجن في الأسبوع الثالث',
    senderId: 'farmer1',
    senderName: 'أحمد محمد',
    senderType: 'farmer',
    timestamp: '2024-01-22T10:30:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    text: 'أهلاً وسهلاً، كيف حال الدواجن؟ هل تلاحظ أي أعراض غريبة؟',
    senderId: 'vet1',
    senderName: 'د. محمد أحمد',
    senderType: 'vet',
    timestamp: '2024-01-22T10:35:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    text: 'لاحظت انخفاض في الشهية عند بعض الطيور، وإليك صورة للحالة',
    senderId: 'farmer1',
    senderName: 'أحمد محمد',
    senderType: 'farmer',
    timestamp: '2024-01-22T10:40:00Z',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    isRead: true
  },
  {
    id: '4',
    text: 'شكراً على الصورة. يبدو أن هناك حاجة لتعديل نوع العلف. سأرسل لك التوصيات',
    senderId: 'vet1',
    senderName: 'د. محمد أحمد',
    senderType: 'vet',
    timestamp: '2024-01-22T10:45:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '5',
    text: 'ممتاز، في انتظار التوصيات',
    senderId: 'farmer1',
    senderName: 'أحمد محمد',
    senderType: 'farmer',
    timestamp: '2024-01-22T10:50:00Z',
    type: 'text',
    isRead: false
  }
];

export default function PoultryFarmChatScreen() {
  const { isRTL } = useI18n();
  const { farmName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const currentUserId = 'vet1'; // This would come from auth context
  const currentUserType = 'vet'; // This would come from auth context

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      senderId: currentUserId,
      senderName: currentUserType === 'vet' ? 'د. محمد أحمد' : 'أحمد محمد',
      senderType: currentUserType as 'vet' | 'farmer',
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachImage = () => {
    Alert.alert(
      'إرفاق صورة',
      'اختر مصدر الصورة',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'الكاميرا', onPress: () => console.log('Open camera') },
        { text: 'المعرض', onPress: () => console.log('Open gallery') }
      ]
    );
  };

  const handleAttachFile = () => {
    Alert.alert(
      'إرفاق ملف',
      'اختر نوع الملف',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'مستند', onPress: () => console.log('Attach document') },
        { text: 'فيديو', onPress: () => console.log('Attach video') }
      ]
    );
  };

  const handleVoiceCall = () => {
    Alert.alert('مكالمة صوتية', 'بدء مكالمة صوتية مع المزارع؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'اتصال', onPress: () => console.log('Start voice call') }
    ]);
  };

  const handleVideoCall = () => {
    Alert.alert('مكالمة فيديو', 'بدء مكالمة فيديو مع المزارع؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'اتصال', onPress: () => console.log('Start video call') }
    ]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;
    const isAdmin = item.senderType === 'admin';

    return (
      <View style={[
        styles.messageContainer,
        {
          alignSelf: isCurrentUser ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start'),
          marginLeft: isCurrentUser ? (isRTL ? 0 : 50) : 0,
          marginRight: isCurrentUser ? (isRTL ? 50 : 0) : 0,
        }
      ]}>
        {!isCurrentUser && (
          <View style={[styles.senderInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.senderName, { color: isAdmin ? COLORS.error : COLORS.primary }]}>
              {item.senderName}
              {isAdmin && ' (مشرف)'}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isCurrentUser ? COLORS.primary : COLORS.white,
            borderTopLeftRadius: isCurrentUser && !isRTL ? 4 : 16,
            borderTopRightRadius: isCurrentUser && isRTL ? 4 : 16,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }
        ]}>
          {item.type === 'image' && item.mediaUrl && (
            <TouchableOpacity onPress={() => console.log('View full image')}>
              <Image source={{ uri: item.mediaUrl }} style={styles.messageImage} />
            </TouchableOpacity>
          )}
          
          {item.type === 'text' && (
            <Text style={[
              styles.messageText,
              {
                color: isCurrentUser ? COLORS.white : COLORS.black,
                textAlign: isRTL ? 'right' : 'left'
              }
            ]}>
              {item.text}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            {
              color: isCurrentUser ? COLORS.white : COLORS.darkGray,
              textAlign: isRTL ? 'right' : 'left'
            }
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: farmName as string || 'محادثة المزرعة',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity style={styles.headerButton} onPress={handleVoiceCall}>
                <Phone size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleVideoCall}>
                <Video size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => console.log('More options')}>
                <MoreVertical size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={[styles.inputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.attachButton} onPress={handleAttachImage}>
              <Camera size={20} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.attachButton} onPress={handleAttachFile}>
              <Paperclip size={20} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TextInput
              style={[
                styles.textInput,
                { 
                  textAlign: isRTL ? 'right' : 'left',
                  flex: 1,
                  marginHorizontal: 8
                }
              ]}
              placeholder="اكتب رسالة..."
              value={newMessage}
              onChangeText={setNewMessage}
              placeholderTextColor={COLORS.darkGray}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { backgroundColor: newMessage.trim() ? COLORS.primary : COLORS.lightGray }
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  chatContainer: {
    flex: 1,
  },
  headerActions: {
    alignItems: 'center',
    gap: 16,
    marginRight: 8,
  },
  headerButton: {
    padding: 4,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  senderInfo: {
    marginBottom: 4,
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    padding: 16,
  },
  inputRow: {
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
  },
  textInput: {
    backgroundColor: COLORS.gray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: COLORS.black,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});