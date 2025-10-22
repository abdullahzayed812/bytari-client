import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter, Stack } from 'expo-router';
import { 
  MessageCircle, 
  Calendar, 
  Bookmark, 
  AlertTriangle, 
  Bell, 
  Award, 
  FileText,
  Edit3,
  Trash2,
  Plus,
  X,
  Save,
  EyeOff,
  Eye
} from 'lucide-react-native';

interface SectionItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  hidden?: boolean;
}

const iconMap: { [key: string]: React.ReactNode } = {
  'MessageCircle': <MessageCircle size={32} color={COLORS.white} />,
  'Calendar': <Calendar size={32} color={COLORS.white} />,
  'Bookmark': <Bookmark size={32} color={COLORS.white} />,
  'AlertTriangle': <AlertTriangle size={32} color={COLORS.white} />,
  'Bell': <Bell size={32} color={COLORS.white} />,
  'Award': <Award size={32} color={COLORS.white} />,
  'FileText': <FileText size={32} color={COLORS.white} />,
};

const colorOptions = [
  '#10B981', '#3B82F6', '#EF4444', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function SectionsManagementScreen() {
  const { t } = useI18n();
  const router = useRouter();
  
  const [sections, setSections] = useState<SectionItem[]>([
    {
      id: 'consultations',
      title: 'الاستشارات',
      icon: 'MessageCircle',
      color: '#10B981',
      route: '/consultation'
    },
    {
      id: 'appointments',
      title: 'المواعيد',
      icon: 'Calendar',
      color: '#3B82F6',
      route: '/appointments'
    },
    {
      id: 'tips',
      title: 'أفضل النصائح',
      icon: 'Bookmark',
      color: '#10B981',
      route: '/tips-list'
    },
    {
      id: 'lost-pets',
      title: 'حيوانات مفقودة',
      icon: 'AlertTriangle',
      color: '#EF4444',
      route: '/lost-pets-list'
    },
    {
      id: 'reminders',
      title: 'التذكيرات',
      icon: 'Bell',
      color: '#F59E0B',
      route: '/reminders'
    },
    {
      id: 'premium',
      title: 'العضوية المميزة',
      icon: 'Award',
      color: '#10B981',
      route: '/premium-subscription'
    },
    {
      id: 'clinics',
      title: 'العيادات',
      icon: 'FileText',
      color: '#3B82F6',
      route: '/(tabs)/clinics'
    }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: 'MessageCircle',
    color: '#10B981',
    route: ''
  });

  const handleAddSection = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      icon: 'MessageCircle',
      color: '#10B981',
      route: ''
    });
    setModalVisible(true);
  };

  const handleEditSection = (section: SectionItem) => {
    setEditingSection(section);
    setFormData({
      title: section.title,
      icon: section.icon,
      color: section.color,
      route: section.route
    });
    setModalVisible(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    Alert.alert(
      'حذف القسم',
      'هل أنت متأكد من حذف هذا القسم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setSections(prev => prev.filter(s => s.id !== sectionId));
            Alert.alert('تم الحذف', 'تم حذف القسم بنجاح');
          }
        }
      ]
    );
  };

  const handleHideSection = (sectionId: string) => {
    Alert.alert(
      'إخفاء القسم',
      'هل تريد إخفاء هذا القسم؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إخفاء',
          onPress: () => {
            setSections(prev => prev.map(s => 
              s.id === sectionId 
                ? { ...s, hidden: !s.hidden }
                : s
            ));
            Alert.alert('تم', 'تم تغيير حالة القسم');
          }
        }
      ]
    );
  };

  const handleSaveSection = () => {
    if (!formData.title.trim() || !formData.route.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (editingSection) {
      // تحديث قسم موجود
      setSections(prev => prev.map(s => 
        s.id === editingSection.id 
          ? { ...s, ...formData }
          : s
      ));
      Alert.alert('تم التحديث', 'تم تحديث القسم بنجاح');
    } else {
      // إضافة قسم جديد
      const newSection: SectionItem = {
        id: Date.now().toString(),
        ...formData,
        hidden: false
      };
      setSections(prev => [...prev, newSection]);
      Alert.alert('تم الإضافة', 'تم إضافة القسم الجديد بنجاح');
    }

    setModalVisible(false);
  };

  const renderSectionItem = (item: SectionItem, index: number) => {
    return (
      <View key={item.id} style={styles.sectionCard}>
        <View style={[styles.sectionPreview, { backgroundColor: item.color }]}>
          <View style={styles.sectionContent}>
            <View style={styles.iconContainer}>
              {iconMap[item.icon]}
            </View>
            <Text style={styles.sectionTitle}>
              {item.title}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            onPress={() => handleEditSection(item)}
          >
            <Edit3 size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>تعديل</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: item.hidden ? COLORS.success : COLORS.warning }]}
            onPress={() => handleHideSection(item.id)}
          >
            {item.hidden ? <Eye size={16} color={COLORS.white} /> : <EyeOff size={16} color={COLORS.white} />}
            <Text style={styles.actionButtonText}>{item.hidden ? 'إظهار' : 'إخفاء'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => handleDeleteSection(item.id)}
          >
            <Trash2 size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>حذف</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'إدارة الأقسام',
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.black,
            fontSize: 18,
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleAddSection}
              style={styles.addButton}
            >
              <Plus size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((item, index) => renderSectionItem(item, index))}
      </ScrollView>

      {/* Modal لإضافة/تعديل القسم */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </Text>
            <TouchableOpacity
              onPress={handleSaveSection}
              style={styles.saveButton}
            >
              <Save size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* عنوان القسم */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>عنوان القسم</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="أدخل عنوان القسم"
                textAlign="right"
              />
            </View>

            {/* رابط القسم */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رابط القسم</Text>
              <TextInput
                style={styles.textInput}
                value={formData.route}
                onChangeText={(text) => setFormData({...formData, route: text})}
                placeholder="مثال: /consultation"
                textAlign="left"
              />
            </View>

            {/* اختيار الأيقونة */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الأيقونة</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.iconOptions}>
                  {Object.keys(iconMap).map((iconKey) => (
                    <TouchableOpacity
                      key={iconKey}
                      style={[
                        styles.iconOption,
                        formData.icon === iconKey && styles.selectedIconOption
                      ]}
                      onPress={() => setFormData({...formData, icon: iconKey})}
                    >
                      {iconMap[iconKey]}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* اختيار اللون */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>اللون</Text>
              <View style={styles.colorOptions}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.selectedColorOption
                    ]}
                    onPress={() => setFormData({...formData, color})}
                  >
                    {formData.color === color && (
                      <View style={styles.colorCheckmark}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* معاينة القسم */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>معاينة</Text>
              <View style={[styles.previewSection, { backgroundColor: formData.color }]}>
                <View style={styles.previewContent}>
                  <View style={styles.previewIcon}>
                    {iconMap[formData.icon]}
                  </View>
                  <Text style={styles.previewTitle}>
                    {formData.title || 'عنوان القسم'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    marginRight: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionPreview: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  sectionContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
    minWidth: 70,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  saveButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  iconOptions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: COLORS.white,
  },
  colorCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewSection: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  previewContent: {
    alignItems: 'center',
  },
  previewIcon: {
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
});