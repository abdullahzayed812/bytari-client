import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useRef } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Send, Mic, Paperclip, Phone, Video } from 'lucide-react-native';
import { Stack } from 'expo-router';

// Mock chat data
const mockMessages = [
  {
    id: '1',
    senderId: 'owner',
    senderName: 'أحمد محمد',
    message: 'السلام عليكم دكتور، أريد استشارة حول الدواجن',
    timestamp: '10:30 ص',
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    senderId: 'doctor',
    senderName: 'د. محمد أحمد',
    message: 'وعليكم السلام، أهلاً بك. ما هي المشكلة؟',
    timestamp: '10:32 ص',
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    senderId: 'owner',
    senderName: 'أحمد محمد',
    message: 'لاحظت زيادة في معدل النفوق هذا الأسبوع',
    timestamp: '10:35 ص',
    type: 'text',
    isRead: true
  },
  {
    id: '4',
    senderId: 'doctor',
    senderName: 'د. محمد أحمد',
    message: 'كم عدد الطيور النافقة تقريباً؟ وهل لاحظت أي أعراض أخرى؟',
    timestamp: '10:37 ص',
    type: 'text',
    isRead: true
  },
  {
    id: '5',
    senderId: 'owner',
    senderName: 'أحمد محمد',
    message: 'حوالي 15 طائر، وبعضها يظهر عليه خمول',
    timestamp: '10:40 ص',
    type: 'text',
    isRead: true
  },
  {
    id: '6',
    senderId: 'owner',
    senderName: 'أحمد محمد',
    message: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
    timestamp: '10:42 ص',
    type: 'image',
    isRead: true
  },
  {
    id: '7',
    senderId: 'doctor',
    senderName: 'د. محمد أحمد',
    message: 'شكراً على الصورة. يبدو أن هناك علامات على مرض تنفسي. سأرسل لك وصفة علاجية الآن',
    timestamp: '10:45 ص',
    type: 'text',
    isRead: true
  }
];

const mockOwnerData = {
  id: '1',
  name: 'أحمد محمد',
  farmName: 'مزرعة الأمل للدواجن',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  phone: '+966 50 123 4567',
  isOnline: true
};

export default function FarmChatScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();
  const { farmId, ownerId } = useLocalSearchParams();
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        senderId: 'doctor',
        senderName: 'د. محمد أحمد',
        message: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        type: 'text' as const,
        isRead: false
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleVoiceCall = () => {
    Alert.alert('مكالمة صوتية', `سيتم الاتصال بـ ${mockOwnerData.name}`);
  };

  const handleVideoCall = () => {
    Alert.alert('مكالمة فيديو', `سيتم بدء مكالمة فيديو مع ${mockOwnerData.name}`);
  };

  const handleAttachment = () => {
    Alert.alert(
      'إرفاق ملف',
      'اختر نوع الملف',
      [
        { text: 'صورة', onPress: () => handleImagePicker() },
        { text: 'كاميرا', onPress: () => handleCamera() },
        { text: 'ملف', onPress: () => handleFilePicker() },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const handleImagePicker = () => {
    console.log('Open image picker');
    // TODO: Implement image picker
  };

  const handleCamera = () => {
    console.log('Open camera');
    // TODO: Implement camera
  };

  const handleFilePicker = () => {
    console.log('Open file picker');
    // TODO: Implement file picker
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      Alert.alert('تم الإرسال', 'تم إرسال الرسالة الصوتية');
    } else {
      setIsRecording(true);
      Alert.alert('تسجيل', 'بدء تسجيل الرسالة الصوتية');
    }
  };

  const renderMessage = (message: typeof mockMessages[0], index: number) => {
    const isOwner = message.senderId === 'owner';
    const isDoctor = message.senderId === 'doctor';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isDoctor ? styles.doctorMessage : styles.ownerMessage,
          { alignSelf: isDoctor ? (isRTL ? 'flex-start' : 'flex-end') : (isRTL ? 'flex-end' : 'flex-start') }
        ]}
      >
        {message.type === 'image' ? (
          <View style={styles.imageMessageContainer}>
            <Image source={{ uri: message.message }} style={styles.messageImage} />
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            isDoctor ? styles.doctorMessageText : styles.ownerMessageText,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {message.message}
          </Text>
        )}
        
        <Text style={[
          styles.messageTime,
          isDoctor ? styles.doctorMessageTime : styles.ownerMessageTime,
          { textAlign: isRTL ? 'right' : 'left' }
        ]}>
          {message.timestamp}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowRight size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Image source={{ uri: mockOwnerData.image }} style={styles.headerImage} />
              <View style={[styles.headerInfo, { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                <Text style={styles.headerName}>{mockOwnerData.name}</Text>
                <Text style={styles.headerStatus}>
                  {mockOwnerData.isOnline ? 'متصل الآن' : 'غير متصل'}
                </Text>
              </View>
            </View>
          ),
          headerTitle: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerAction} onPress={handleVoiceCall}>
                <Phone size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerAction} onPress={handleVideoCall}>
                <Video size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>
      
      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachment}
          >
            <Paperclip size={20} color={COLORS.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={[
              styles.textInput,
              { textAlign: isRTL ? 'right' : 'left' },
              { flex: 1, marginHorizontal: 8 }
            ]}
            placeholder="اكتب رسالتك هنا..."
            placeholderTextColor={COLORS.darkGray}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          
          {newMessage.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Send size={20} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.recordingButton
              ]}
              onPress={handleVoiceRecording}
            >
              <Mic size={20} color={isRecording ? COLORS.white : COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  headerLeft: {
    alignItems: 'center',
  },
  headerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.success,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerAction: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
  },
  doctorMessage: {
    backgroundColor: COLORS.primary,
  },
  ownerMessage: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  doctorMessageText: {
    color: COLORS.white,
  },
  ownerMessageText: {
    color: COLORS.black,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  doctorMessageTime: {
    color: COLORS.white,
  },
  ownerMessageTime: {
    color: COLORS.darkGray,
  },
  imageMessageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  inputRow: {
    alignItems: 'flex-end',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: COLORS.error,
  },
});