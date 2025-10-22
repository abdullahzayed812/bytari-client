import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bot, Zap, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

interface AiStatusIndicatorProps {
  isEnabled: boolean;
  type: 'consultations' | 'inquiries';
  showDetails?: boolean;
  onPress?: () => void;
}

export default function AiStatusIndicator({ 
  isEnabled, 
  type, 
  showDetails = false, 
  onPress 
}: AiStatusIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  
  // جلب حالة الذكاء الاصطناعي المفصلة
  const { data: aiStatus, isLoading } = trpc.ai.checkStatus.useQuery(
    { type },
    { 
      enabled: isEnabled && showDetails,
      refetchInterval: 30000, // تحديث كل 30 ثانية
    }
  );

  if (!isEnabled) {
    return showDetails ? (
      <View style={[styles.container, styles.disabledContainer]}>
        <View style={styles.iconContainer}>
          <XCircle size={16} color="#EF4444" />
        </View>
        <Text style={[styles.text, styles.disabledText]}>
          الذكاء الاصطناعي معطل للـ{type === 'consultations' ? 'استشارات' : 'استفسارات'}
        </Text>
      </View>
    ) : null;
  }

  const typeText = type === 'consultations' ? 'الاستشارات' : 'الاستفسارات';
  const Container = onPress ? TouchableOpacity : View;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (showDetails) {
      setExpanded(!expanded);
    }
  };

  return (
    <Container 
      style={[
        styles.container,
        onPress && styles.pressable,
        !aiStatus?.apiHealthy && styles.warningContainer
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        <View style={styles.iconContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : aiStatus?.apiHealthy === false ? (
            <AlertCircle size={16} color="#F59E0B" />
          ) : (
            <Bot size={16} color="#10B981" />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            الذكاء الاصطناعي مفعل للرد على {typeText}
          </Text>
          
          {showDetails && aiStatus && (
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.statusText}>
                  {aiStatus.responseDelay}ث
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Zap size={12} color="#6B7280" />
                <Text style={styles.statusText}>
                  {aiStatus.apiHealthy ? 'متصل' : 'منقطع'}
                </Text>
              </View>
              
              {aiStatus.priority && (
                <View style={styles.statusItem}>
                  <CheckCircle size={12} color="#6B7280" />
                  <Text style={styles.statusText}>
                    {aiStatus.priority === 'high' ? 'عالي' : 'عادي'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      
      {expanded && showDetails && aiStatus && (
        <View style={styles.expandedContent}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الحد الأقصى للرد:</Text>
            <Text style={styles.detailValue}>{aiStatus.maxResponseLength} حرف</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الموافقة التلقائية:</Text>
            <Text style={styles.detailValue}>
              {aiStatus.autoApprove ? 'مفعلة' : 'معطلة'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>آخر فحص:</Text>
            <Text style={styles.detailValue}>
              {aiStatus.lastChecked ? 
                new Date(aiStatus.lastChecked).toLocaleTimeString('ar-SA') : 
                'غير محدد'
              }
            </Text>
          </View>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  disabledContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  warningContainer: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  pressable: {
    // Add subtle shadow for pressable items
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500',
  },
  disabledText: {
    color: '#DC2626',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#6B7280',
  },
});