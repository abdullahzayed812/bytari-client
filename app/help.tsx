import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { Stack, router } from 'expo-router';
import { ArrowRight, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from 'lucide-react-native';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'كيف يمكنني إضافة حيوان أليف جديد؟',
      answer: 'يمكنك إضافة حيوان أليف جديد من خلال الذهاب إلى قسم "حيواناتي الأليفة" والضغط على زر "إضافة حيوان أليف". ستحتاج إلى ملء المعلومات الأساسية مثل الاسم والنوع والعمر.'
    },
    {
      id: '2',
      question: 'كيف يمكنني حجز موعد مع طبيب بيطري؟',
      answer: 'يمكنك حجز موعد من خلال قسم "العيادات" واختيار العيادة المناسبة، ثم تحديد التاريخ والوقت المناسب. ستتلقى تأكيد الحجز عبر الإشعارات.'
    },
    {
      id: '3',
      question: 'كيف يمكنني الإبلاغ عن حيوان مفقود؟',
      answer: 'اذهب إلى قسم "الحيوانات المفقودة" واضغط على "الإبلاغ عن حيوان مفقود". أدخل تفاصيل الحيوان وصورته وموقع فقدانه لمساعدة الآخرين في العثور عليه.'
    },
    {
      id: '4',
      question: 'كيف يمكنني تغيير معلومات حسابي؟',
      answer: 'اذهب إلى "الملف الشخصي" ثم "الإعدادات" واختر "إعدادات الحساب". يمكنك تعديل اسمك وبريدك الإلكتروني ورقم هاتفك من هناك.'
    },
    {
      id: '5',
      question: 'كيف يمكنني إيقاف الإشعارات؟',
      answer: 'يمكنك إدارة الإشعارات من خلال "الإعدادات" ثم "إعدادات الإشعارات". يمكنك اختيار نوع الإشعارات التي تريد تلقيها أو إيقافها تماماً.'
    },
    {
      id: '6',
      question: 'كيف يمكنني الشراء من المتجر؟',
      answer: 'اذهب إلى قسم "المتجر" واختر المنتجات التي تريدها. أضفها إلى السلة ثم اضغط على "الدفع" لإكمال عملية الشراء.'
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'المساعدة والدعم',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowRight size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <HelpCircle size={40} color={COLORS.white} />
          <Text style={styles.headerText}>
            نحن هنا لمساعدتك! ابحث عن إجابات لأسئلتك الشائعة
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأسئلة الشائعة</Text>
          
          <View style={styles.faqCard}>
            {faqData.map((item, index) => (
              <View key={item.id}>
                <TouchableOpacity 
                  style={styles.faqItem}
                  onPress={() => toggleExpanded(item.id)}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    {expandedItems.includes(item.id) ? (
                      <ChevronUp size={20} color={COLORS.primary} />
                    ) : (
                      <ChevronDown size={20} color={COLORS.primary} />
                    )}
                  </View>
                </TouchableOpacity>
                
                {expandedItems.includes(item.id) && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
                
                {index < faqData.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>لم تجد ما تبحث عنه؟</Text>
          <Text style={styles.contactSubtitle}>تواصل معنا مباشرة</Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => router.push('/contact-us')}
            >
              <MessageCircle size={24} color={COLORS.primary} />
              <Text style={styles.contactOptionText}>إرسال رسالة</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactOption}>
              <Phone size={24} color={COLORS.primary} />
              <Text style={styles.contactOptionText}>اتصال هاتفي</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactOption}>
              <Mail size={24} color={COLORS.primary} />
              <Text style={styles.contactOptionText}>بريد إلكتروني</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>نصائح للاستخدام الأمثل</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>• حدث معلومات حيوانك الأليف</Text>
              <Text style={styles.tipDescription}>تأكد من تحديث معلومات حيوانك الأليف بانتظام للحصول على أفضل رعاية</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>• فعل الإشعارات</Text>
              <Text style={styles.tipDescription}>فعل الإشعارات لتلقي تذكيرات المواعيد والتطعيمات</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipTitle}>• استخدم البحث</Text>
              <Text style={styles.tipDescription}>استخدم خاصية البحث للعثور بسرعة على ما تحتاجه</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 12,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  faqAnswer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 16,
  },
  contactSection: {
    backgroundColor: COLORS.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  contactOption: {
    alignItems: 'center',
    padding: 12,
  },
  contactOptionText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  tipsSection: {
    margin: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'right',
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipItem: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'right',
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 20,
  },
});