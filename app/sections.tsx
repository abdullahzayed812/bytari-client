import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
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
  Settings,
  Edit3,
  Trash2,
  EyeOff,
  X,
  Save,
  Eye
} from 'lucide-react-native';

interface SectionItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  isHidden?: boolean;
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

export default function SectionsScreen() {
  const { isRTL } = useI18n();
  const router = useRouter();

  const [sections, setSections] = useState<SectionItem[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: 'MessageCircle',
    color: '#10B981',
    route: ''
  });

  const handleSectionPress = (route: string) => {
    router.push(route as any);
  };

  const handleEditSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setEditingSection(section);
      setFormData({
        title: section.title,
        icon: section.icon,
        color: section.color,
        route: section.route
      });
      setModalVisible(true);
    }
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
            setSections(sections.filter(s => s.id !== sectionId));
          }
        }
      ]
    );
  };

  const handleHideSection = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, isHidden: !s.isHidden }
        : s
    ));
  };

  const handleSaveSection = () => {
    if (!formData.title.trim() || !formData.route.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (editingSection) {
      // تحديث قسم موجود
      setSections(sections.map(s => 
        s.id === editingSection.id 
          ? { ...s, ...formData }
          : s
      ));
    }

    setModalVisible(false);
  };

  const renderSectionItem = (item: SectionItem, index: number) => {
    return (
      <View
        key={item.id}
        style={[
          styles.sectionItemContainer,
          index === sections.length - 1 && sections.length % 2 === 1 ? styles.fullWidthContainer : {}
        ]}
      >
        <TouchableOpacity
          style={[
            styles.sectionItem,
            { backgroundColor: item.color },
            index === sections.length - 1 && sections.length % 2 === 1 ? styles.fullWidthItem : {}
          ]}
          onPress={() => handleSectionPress(item.route)}
          activeOpacity={0.8}
        >
          <View style={styles.sectionContent}>
            <View style={styles.iconContainer}>
              {iconMap[item.icon]}
            </View>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'center' : 'center' }]}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* أزرار التعديل والحذف والإخفاء */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditSection(item.id)}
            activeOpacity={0.7}
          >
            <Edit3 size={14} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, item.isHidden ? styles.showButton : styles.hideButton]}
            onPress={() => handleHideSection(item.id)}
            activeOpacity={0.7}
          >
            {item.isHidden ? <Eye size={14} color={COLORS.white} /> : <EyeOff size={14} color={COLORS.white} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteSection(item.id)}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'الأقسام',
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
              onPress={() => router.push('/sections-management')}
              style={{ marginRight: 16 }}
            >
              <Settings size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionsGrid}>
          {sections.filter(item => !item.isHidden).map((item, index) => renderSectionItem(item, index))}
        </View>
        
        {/* الأقسام المخفية */}
        {sections.some(item => item.isHidden) && (
          <View style={styles.hiddenSectionsContainer}>
            <Text style={styles.hiddenSectionsTitle}>الأقسام المخفية</Text>
            <View style={styles.sectionsGrid}>
              {sections.filter(item => item.isHidden).map((item, index) => (
                <View key={item.id} style={[styles.sectionItemContainer, styles.hiddenSection]}>
                  <TouchableOpacity
                    style={[
                      styles.sectionItem,
                      { backgroundColor: item.color, opacity: 0.6 }
                    ]}
                    onPress={() => handleSectionPress(item.route)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.sectionContent}>
                      <View style={styles.iconContainer}>
                        {iconMap[item.icon]}
                      </View>
                      <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>
                        {item.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditSection(item.id)}
                      activeOpacity={0.7}
                    >
                      <Edit3 size={14} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.showButton]}
                      onPress={() => handleHideSection(item.id)}
                      activeOpacity={0.7}
                    >
                      <Eye size={14} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteSection(item.id)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal لتعديل القسم */}
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
              تعديل القسم
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
  sectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  sectionItemContainer: {
    width: '47%',
    position: 'relative',
  },
  fullWidthContainer: {
    width: '100%',
  },
  sectionItem: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fullWidthItem: {
    aspectRatio: 2.2,
  },
  actionButtons: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'column',
    gap: 4,
    zIndex: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  hideButton: {
    backgroundColor: '#6B7280',
  },
  showButton: {
    backgroundColor: '#10B981',
  },
  hiddenSectionsContainer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  hiddenSectionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  hiddenSection: {
    opacity: 0.7,
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
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  sectionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
});