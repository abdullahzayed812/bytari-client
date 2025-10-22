import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Camera, Paperclip, Phone, Video, Mic, Image as ImageIcon } from 'lucide-react-native';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'vet' | 'owner';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  isRead: boolean;
}

export default function FieldChatScreen() {
  const router = useRouter();
  const { fieldId, ownerId } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  
  // Mock messages data
  const [messages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'owner1',
      senderName: 'أحمد محمد علي',
      senderType: 'owner',
      content: 'السلام عليكم دكتور، لاحظت أن بعض الطيور تبدو خاملة اليوم',
      timestamp: '2024-02-05 09:30',
      type: 'text',
      isRead: true
    },
    {
      id: '2',
      senderId: 'vet1',
      senderName: 'د. محمد أحمد',
      senderType: 'vet',
      content: 'وعليكم السلام، هل يمكنك إرسال صور للطيور المتأثرة؟',
      timestamp: '2024-02-05 09:35',
      type: 'text',
      isRead: true
    },
    {
      id: '3',
      senderId: 'owner1',
      senderName: 'أحمد محمد علي',
      senderType: 'owner',
      content: 'بالطبع دكتور، هذه صور للطيور',
      timestamp: '2024-02-05 09:40',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400',
      isRead: true
    },
    {
      id: '4',
      senderId: 'vet1',
      senderName: 'د. محمد أحمد',
      senderType: 'vet',
      content: 'شكراً لك، أرى أن هناك علامات على التعب. أنصح بزيادة التهوية وتقليل الكثافة قليلاً. سأمر غداً للفحص',
      timestamp: '2024-02-05 09:45',
      type: 'text',
      isRead: true
    },
    {
      id: '5',
      senderId: 'owner1',
      senderName: 'أحمد محمد علي',
      senderType: 'owner',
      content: 'شكراً دكتور، سأطبق نصائحك فوراً. في أي وقت ستأتي غداً؟',
      timestamp: '2024-02-05 10:00',
      type: 'text',
      isRead: false
    }
  ]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      // Here you would typically send the message to your backend
      setMessageText('');
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'إرسال صورة',
      'اختر مصدر الصورة',
      [
        { text: 'الكاميرا', onPress: () => console.log('Camera selected') },
        { text: 'المعرض', onPress: () => console.log('Gallery selected') },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const handleVoiceCall = () => {
    Alert.alert('مكالمة صوتية', 'هل تريد إجراء مكالمة صوتية؟', [
      { text: 'نعم', onPress: () => console.log('Voice call initiated') },
      { text: 'إلغاء', style: 'cancel' }
    ]);
  };

  const handleVideoCall = () => {
    Alert.alert('مكالمة فيديو', 'هل تريد إجراء مكالمة فيديو؟', [
      { text: 'نعم', onPress: () => console.log('Video call initiated') },
      { text: 'إلغاء', style: 'cancel' }
    ]);
  };

  const renderMessage = (message: Message) => {
    const isVet = message.senderType === 'vet';
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isVet ? styles.vetMessage : styles.ownerMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isVet ? styles.vetBubble : styles.ownerBubble
        ]}>
          <Text style={styles.senderName}>{message.senderName}</Text>
          
          {message.type === 'image' && message.mediaUrl ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: message.mediaUrl }} style={styles.messageImage} />
              {message.content && (
                <Text style={[
                  styles.messageText,
                  isVet ? styles.vetMessageText : styles.ownerMessageText
                ]}>{message.content}</Text>
              )}
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isVet ? styles.vetMessageText : styles.ownerMessageText
            ]}>{message.content}</Text>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{message.timestamp}</Text>
            {!message.isRead && !isVet && (
              <View style={styles.unreadIndicator} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>محادثة الحقل</Text>
          <Text style={styles.headerSubtitle}>{ownerId}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleVoiceCall}>
            <Phone size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleVideoCall}>
            <Video size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton} onPress={handleImagePicker}>
            <Camera size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor={COLORS.darkGray}
            multiline
            textAlign='right'
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : null]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send size={20} color={messageText.trim() ? COLORS.white : COLORS.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Mic size={16} color={COLORS.primary} />
            <Text style={styles.quickActionText}>تسجيل صوتي</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleImagePicker}>
            <ImageIcon size={16} color={COLORS.primary} />
            <Text style={styles.quickActionText}>صورة</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Paperclip size={16} color={COLORS.primary} />
            <Text style={styles.quickActionText}>ملف</Text>
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  vetMessage: {
    alignItems: 'flex-start',
  },
  ownerMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vetBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  ownerBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.darkGray,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'right',
  },
  vetMessageText: {
    color: COLORS.black,
  },
  ownerMessageText: {
    color: COLORS.white,
  },
  imageContainer: {
    gap: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  messageFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: COLORS.white,
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.gray,
    gap: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
});