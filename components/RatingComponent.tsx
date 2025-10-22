import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Text, TextInput, Alert } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Button from './Button';

// Simple rating component for inline use
interface SimpleRatingProps {
  currentRating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  maxRating?: number;
}

export function SimpleRating({ 
  currentRating, 
  onRatingChange, 
  size = 20,
  readonly = false,
  maxRating = 5
}: SimpleRatingProps) {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= currentRating;
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !readonly && onRatingChange(i)}
          style={[styles.starButton, readonly && styles.readonlyButton]}
          disabled={readonly}
        >
          <Star
            size={size}
            color={isFilled ? '#FFD700' : '#E5E7EB'}
            fill={isFilled ? '#FFD700' : 'transparent'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
}

// Modal rating component for full rating experience
interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  title: string;
  entityName: string;
}

export default function RatingComponent({ 
  visible,
  onClose,
  onSubmit,
  title,
  entityName
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار تقييم أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      Alert.alert('شكراً لك', 'تم إرسال تقييمك بنجاح');
      handleClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.modalStarButton}
        >
          <Star
            size={32}
            color={isFilled ? '#FFD700' : '#E5E7EB'}
            fill={isFilled ? '#FFD700' : 'transparent'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.entityName}>{entityName}</Text>
          
          <Text style={styles.ratingLabel}>كيف تقيم تجربتك؟</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'ضعيف جداً'}
              {rating === 2 && 'ضعيف'}
              {rating === 3 && 'متوسط'}
              {rating === 4 && 'جيد'}
              {rating === 5 && 'ممتاز'}
            </Text>
          )}
          
          <Text style={styles.commentLabel}>أضف تعليقاً (اختياري)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="شاركنا رأيك وتجربتك..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlign="right"
            maxLength={500}
          />
          
          <View style={styles.modalActions}>
            <Button
              title="إلغاء"
              onPress={handleClose}
              type="outline"
              style={styles.cancelButton}
            />
            <Button
              title={isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              onPress={handleSubmit}
              type="primary"
              style={styles.submitButton}
              disabled={isSubmitting || rating === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  starButton: {
    padding: 2,
  },
  readonlyButton: {
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  entityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalStarButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 30,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});