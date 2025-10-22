import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

interface UserReplyFormProps {
  type: 'inquiry' | 'consultation';
  itemId: number;
  userId: number;
  isConversationOpen: boolean;
  onReplySuccess?: () => void;
}

export default function UserReplyForm({
  type,
  itemId,
  userId,
  isConversationOpen,
  onReplySuccess
}: UserReplyFormProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userReplyInquiryMutation = useMutation(trpc.inquiries.userReply.mutationOptions());
  const userReplyConsultationMutation = useMutation(trpc.consultations.userReply.mutationOptions());
  if (!isConversationOpen) {
    return (
      <View style={styles.closedContainer}>
        <Text style={styles.closedTitle}>🔒 المحادثة مغلقة</Text>
        <Text style={styles.closedText}>
          تم إغلاق هذه المحادثة من قبل المشرف ولا يمكن إضافة ردود جديدة.
        </Text>
      </View>
    );
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة الرد');
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'inquiry') {
        await userReplyInquiryMutation.mutateAsync({
          inquiryId: itemId,
          userId,
          content: replyContent,
        });
      } else {
        await userReplyConsultationMutation.mutateAsync({
          consultationId: itemId,
          userId,
          content: replyContent,
        });
      }

      Alert.alert(
        'تم الإرسال',
        'تم إرسال ردك بنجاح. سيتم إشعار المشرف المختص.',
        [
          {
            text: 'موافق',
            onPress: () => {
              setReplyContent('');
              onReplySuccess?.();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error submitting user reply:', error);
      const errorMessage = error?.message || 'حدث خطأ أثناء إرسال الرد';
      Alert.alert('خطأ', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        إضافة رد على {type === 'inquiry' ? 'الاستفسار' : 'الاستشارة'}
      </Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="اكتب ردك أو استفسارك الإضافي هنا..."
        placeholderTextColor={COLORS.darkGray}
        value={replyContent}
        onChangeText={setReplyContent}
        multiline
        numberOfLines={4}
        textAlign="right"
      />

      <Text style={styles.helpText}>
        سيتم إرسال ردك إلى المشرف المختص وستحصل على إشعار عند الرد
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
  closedContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  closedTitle: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  closedText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 20,
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