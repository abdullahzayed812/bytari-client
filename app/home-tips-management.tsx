import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus, Edit3, Eye, EyeOff, Trash2, Download } from 'lucide-react-native';
import Button from "../components/Button";
import { mockTips } from "../mocks/data";

type Tip = {
  id: string;
  title: string;
  content: string;
  image: string;
  isSelectedForHome: boolean;
};

export default function HomeTipsManagementScreen() {
  const router = useRouter();
  const [tips, setTips] = useState<Tip[]>(
    mockTips.map(tip => ({
      ...tip,
      isSelectedForHome: true // Initially, all tips are shown on home
    }))
  );

  const handleToggleHomeVisibility = (tipId: string) => {
    setTips(prevTips => 
      prevTips.map(tip => 
        tip.id === tipId 
          ? { ...tip, isSelectedForHome: !tip.isSelectedForHome }
          : tip
      )
    );
  };

  const handleDeleteTip = (tipId: string) => {
    Alert.alert(
      'حذف النصيحة',
      'هل أنت متأكد من حذف هذه النصيحة من الصفحة الرئيسية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setTips(prevTips => prevTips.filter(tip => tip.id !== tipId));
          }
        }
      ]
    );
  };

  const handleEditTip = (tipId: string) => {
    router.push({ pathname: '/edit-tip', params: { id: tipId } });
  };

  const handleAddTip = () => {
    router.push('/add-tip');
  };

  const handleImportTips = () => {
    // Get all available tips from main sections that are not already selected for home
    const availableTips = mockTips.filter(tip => 
      !tips.some(homeTip => homeTip.id === tip.id)
    );

    if (availableTips.length === 0) {
      Alert.alert('لا توجد نصائح', 'جميع النصائح المتاحة موجودة بالفعل في الصفحة الرئيسية');
      return;
    }

    Alert.alert(
      'استيراد النصائح',
      `تم العثور على ${availableTips.length} نصيحة متاحة للاستيراد. هل تريد استيرادها جميعاً؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'استيراد الكل',
          onPress: () => {
            const importedTips = availableTips.map(tip => ({
              id: tip.id,
              title: tip.title,
              content: tip.content,
              image: tip.image,
              isSelectedForHome: true
            }));
            setTips(prevTips => [...prevTips, ...importedTips]);
            Alert.alert('تم الاستيراد', `تم استيراد ${importedTips.length} نصيحة بنجاح`);
          }
        },
        {
          text: 'اختيار يدوي',
          onPress: () => {
            // Show selection modal (for now, import first 2)
            const selectedTips = availableTips.slice(0, 2).map(tip => ({
              id: tip.id,
              title: tip.title,
              content: tip.content,
              image: tip.image,
              isSelectedForHome: true
            }));
            setTips(prevTips => [...prevTips, ...selectedTips]);
            Alert.alert('تم الاستيراد', `تم استيراد ${selectedTips.length} نصيحة بنجاح`);
          }
        }
      ]
    );
  };

  const visibleTips = tips.filter(tip => tip.isSelectedForHome);
  const hiddenTips = tips.filter(tip => !tip.isSelectedForHome);

  const renderTipCard = (tip: Tip, isVisible: boolean) => (
    <View key={tip.id} style={styles.tipCard}>
      <View style={styles.tipCardContent}>
        <Image source={{ uri: tip.image }} style={styles.tipImage} />
        
        <View style={styles.tipDetails}>
          <Text style={styles.tipTitle} numberOfLines={2}>{tip.title}</Text>
          <Text style={styles.tipContent} numberOfLines={3}>{tip.content}</Text>
        </View>
      </View>
      
      <View style={styles.tipActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.visibilityButton]}
          onPress={() => handleToggleHomeVisibility(tip.id)}
        >
          {isVisible ? (
            <EyeOff size={16} color={COLORS.white} />
          ) : (
            <Eye size={16} color={COLORS.white} />
          )}
          <Text style={styles.actionButtonText}>
            {isVisible ? 'إخفاء' : 'إظهار'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditTip(tip.id)}
        >
          <Edit3 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>تعديل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTip(tip.id)}
        >
          <Trash2 size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة النصائح - الصفحة الرئيسية',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>إدارة أفضل النصائح</Text>
          <Text style={styles.headerSubtitle}>
            تحكم في النصائح التي تظهر في الصفحة الرئيسية
          </Text>
        </View>
        
        {/* Add Tip Button */}
        <View style={styles.addSection}>
          <View style={styles.buttonRow}>
            <Button
              title="إضافة نصيحة جديدة"
              onPress={handleAddTip}
              type="primary"
              size="medium"
              icon={<Plus size={16} color={COLORS.white} />}
              style={styles.halfButton}
            />
            <Button
              title="استيراد من الأقسام"
              onPress={handleImportTips}
              type="secondary"
              size="medium"
              icon={<Download size={16} color={COLORS.primary} />}
              style={styles.halfButton}
            />
          </View>
        </View>
        
        {/* Visible Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            النصائح المعروضة في الصفحة الرئيسية ({visibleTips.length})
          </Text>
          {visibleTips.length > 0 ? (
            visibleTips.map(tip => renderTipCard(tip, true))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد نصائح معروضة في الصفحة الرئيسية</Text>
            </View>
          )}
        </View>
        
        {/* Hidden Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            النصائح المخفية ({hiddenTips.length})
          </Text>
          {hiddenTips.length > 0 ? (
            hiddenTips.map(tip => renderTipCard(tip, false))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>لا توجد نصائح مخفية</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  addSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  addButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 15,
  },
  tipCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipCardContent: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  tipDetails: {
    flex: 1,
    marginRight: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 22,
  },
  tipContent: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 20,
  },
  tipActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  visibilityButton: {
    backgroundColor: COLORS.info,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
  },
});