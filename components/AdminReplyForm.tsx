import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

interface AdminReplyFormProps {
  type: 'inquiry' | 'consultation';
  itemId: number;
  moderatorId: number;
  onReplySuccess?: () => void;
}

export default function AdminReplyForm({ type, itemId, moderatorId, onReplySuccess }: AdminReplyFormProps) {
  const [replyContent, setReplyContent] = useState('');
  const [keepConversationOpen, setKeepConversationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const replyInquiryMutation = useMutation(trpc.inquiries.reply.mutationOptions());
  const replyConsultationMutation = useMutation(trpc.consultations.reply.mutationOptions());

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة الرد');
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'inquiry') {
        await replyInquiryMutation.mutateAsync({
          inquiryId: itemId,
          responderId: moderatorId,
          content: replyContent,
          keepConversationOpen,
        });
      } else {
        await replyConsultationMutation.mutateAsync({
          consultationId: itemId,
          responderId: moderatorId,
          content: replyContent,
          keepConversationOpen,
        });
      }

      Alert.alert(
        'تم الإرسال',
        keepConversationOpen 
          ? 'تم إرسال الرد بنجاح. المحادثة مفتوحة للرد.'
          : 'تم إرسال الرد بنجاح. تم إغلاق المحادثة.',
        [
          {
            text: 'موافق',
            onPress: () => {
              setReplyContent('');
              setKeepConversationOpen(false);
              onReplySuccess?.();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting reply:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الرد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        الرد على {type === 'inquiry' ? 'الاستفسار' : 'الاستشارة'}
      </Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="اكتب ردك هنا..."
        placeholderTextColor={COLORS.darkGray}
        value={replyContent}
        onChangeText={setReplyContent}
        multiline
        numberOfLines={4}
        textAlign="right"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          إبقاء المحادثة مفتوحة للرد
        </Text>
        <Switch
          value={keepConversationOpen}
          onValueChange={setKeepConversationOpen}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
          thumbColor={keepConversationOpen ? COLORS.white : COLORS.darkGray}
        />
      </View>

      <Text style={styles.helpText}>
        {keepConversationOpen 
          ? 'سيتمكن المستخدم من الرد مرة أخرى على هذه المحادثة'
          : 'سيتم إغلاق المحادثة ولن يتمكن المستخدم من الرد'
        }
      </Text>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!replyContent.trim() || isSubmitting) && styles.submitButtonDisabled
        ]}
        onPress={handleSubmitReply}
        disabled={!replyContent.trim() || isSubmitting}
      >
        <Send size={20} color={COLORS.white} />
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرد'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.6,
  },
});