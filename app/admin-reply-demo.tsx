import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS } from "../constants/colors";
import AdminReplyForm from "../components/AdminReplyForm";
import UserReplyForm from "../components/UserReplyForm";

export default function AdminReplyDemoScreen() {
  const handleReplySuccess = () => {
    console.log('Reply sent successfully!');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'نظام الردود - عرض توضيحي',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' }
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>للمشرفين المختصين</Text>
        <Text style={styles.description}>
          يمكن للمشرفين الرد على الاستفسارات والاستشارات مع تحديد ما إذا كانت المحادثة ستبقى مفتوحة للرد أم لا
        </Text>
        
        <AdminReplyForm
          type="inquiry"
          itemId={1}
          moderatorId={1}
          onReplySuccess={handleReplySuccess}
        />

        <Text style={styles.sectionTitle}>للمستخدمين</Text>
        <Text style={styles.description}>
          يمكن للمستخدمين الرد على استفساراتهم أو استشاراتهم فقط إذا كانت المحادثة مفتوحة
        </Text>
        
        <UserReplyForm
          type="consultation"
          itemId={1}
          userId={1}
          isConversationOpen={true}
          onReplySuccess={handleReplySuccess}
        />

        <Text style={styles.sectionTitle}>محادثة مغلقة</Text>
        <Text style={styles.description}>
          عندما يختار المشرف إغلاق المحادثة، لن يتمكن المستخدم من الرد
        </Text>
        
        <UserReplyForm
          type="inquiry"
          itemId={2}
          userId={1}
          isConversationOpen={false}
          onReplySuccess={handleReplySuccess}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>كيف يعمل النظام:</Text>
          <Text style={styles.infoText}>
            1. عندما يرد المشرف، يحدد ما إذا كانت المحادثة ستبقى مفتوحة{'\n'}
            2. إذا اختار إبقاء المحادثة مفتوحة، يمكن للمستخدم الرد مرة أخرى{'\n'}
            3. إذا اختار إغلاق المحادثة، لن يتمكن المستخدم من الرد{'\n'}
            4. عندما يرد المستخدم، تعود حالة الاستفسار/الاستشارة إلى &quot;في الانتظار&quot;
          </Text>
        </View>
      </ScrollView>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: COLORS.black,
    lineHeight: 24,
    textAlign: 'right',
  },
});