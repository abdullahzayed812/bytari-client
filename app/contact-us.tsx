import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, TextInput, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";

import { Stack, router } from "expo-router";
import { ArrowRight, Mail, Phone, MessageCircle, MapPin, Edit3, Save, X } from "lucide-react-native";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";

interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: {
    sunday_thursday: string;
    friday: string;
    saturday: string;
  };
}

export default function ContactUsScreen() {
  const { isSuperAdmin } = useApp();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "support@petcare.com",
    phone: "+964 750 123 4567",
    whatsapp: "+964 750 123 4567",
    address: "بغداد، العراق",
    workingHours: {
      sunday_thursday: "9:00 ص - 6:00 م",
      friday: "10:00 ص - 4:00 م",
      saturday: "مغلق",
    },
  });
  const [editedInfo, setEditedInfo] = useState<ContactInfo>(contactInfo);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // جلب معلومات التواصل من قاعدة البيانات
  const contactQuery = useQuery(trpc.admin.content.getContactInfo.queryOptions());
  const updateContactMutation = useMutation(trpc.admin.content.updateContactInfo.mutationOptions());

  useEffect(() => {
    if (contactQuery.data?.success) {
      setContactInfo(contactQuery.data.contactInfo);
      setEditedInfo(contactQuery.data.contactInfo);
    }
  }, [contactQuery.data]);

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsAppPress = (phone: string) => {
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo(contactInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(contactInfo);
  };

  const handleSave = async () => {
    if (!editedInfo.email || !editedInfo.phone || !editedInfo.whatsapp || !editedInfo.address) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateContactMutation.mutateAsync(editedInfo);
      if (result.success) {
        setContactInfo(editedInfo);
        setIsEditing(false);
        Alert.alert("نجح", "تم تحديث معلومات التواصل بنجاح");
        contactQuery.refetch();
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      Alert.alert("خطأ", "فشل في تحديث معلومات التواصل");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "تواصل معنا",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black, fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowRight size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      onPress={handleCancel}
                      style={[styles.headerButton, styles.cancelButton]}
                      disabled={isSaving}
                    >
                      <X size={20} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSave}
                      style={[styles.headerButton, styles.saveButton]}
                      disabled={isSaving}
                    >
                      <Save size={20} color={COLORS.white} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={handleEdit} style={[styles.headerButton, styles.editButton]}>
                    <Edit3 size={20} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            ) : null,
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>إذا كان لديك أي استفسار أو شكوى أو اقتراح فلا تتردد في التواصل معنا</Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>معلومات التواصل</Text>

          <View style={styles.contactCard}>
            {/* البريد الإلكتروني */}
            <View style={styles.contactItem}>
              <View style={styles.contactItemContent}>
                <Mail size={24} color={COLORS.primary} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editedInfo.email}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, email: text })}
                      keyboardType="email-address"
                      placeholder="البريد الإلكتروني"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => handleEmailPress(contactInfo.email)}>
                      <Text style={[styles.contactValue, styles.linkText]}>{contactInfo.email}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* رقم الهاتف */}
            <View style={styles.contactItem}>
              <View style={styles.contactItemContent}>
                <Phone size={24} color={COLORS.primary} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>رقم الهاتف</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editedInfo.phone}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, phone: text })}
                      keyboardType="phone-pad"
                      placeholder="رقم الهاتف"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => handlePhonePress(contactInfo.phone)}>
                      <Text style={[styles.contactValue, styles.linkText]}>{contactInfo.phone}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* واتساب */}
            <View style={styles.contactItem}>
              <View style={styles.contactItemContent}>
                <MessageCircle size={24} color={COLORS.primary} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>واتساب</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editedInfo.whatsapp}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, whatsapp: text })}
                      keyboardType="phone-pad"
                      placeholder="رقم الواتساب"
                    />
                  ) : (
                    <TouchableOpacity onPress={() => handleWhatsAppPress(contactInfo.whatsapp)}>
                      <Text style={[styles.contactValue, styles.linkText]}>{contactInfo.whatsapp}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* العنوان */}
            <View style={styles.contactItem}>
              <View style={styles.contactItemContent}>
                <MapPin size={24} color={COLORS.primary} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>العنوان</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.editInput}
                      value={editedInfo.address}
                      onChangeText={(text) => setEditedInfo({ ...editedInfo, address: text })}
                      placeholder="العنوان"
                      multiline
                    />
                  ) : (
                    <Text style={styles.contactValue}>{contactInfo.address}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.workingHours}>
          <Text style={styles.sectionTitle}>ساعات العمل</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursItem}>
              <Text style={styles.dayText}>الأحد - الخميس</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editTimeInput}
                  value={editedInfo.workingHours.sunday_thursday}
                  onChangeText={(text) =>
                    setEditedInfo({
                      ...editedInfo,
                      workingHours: { ...editedInfo.workingHours, sunday_thursday: text },
                    })
                  }
                  placeholder="ساعات العمل"
                />
              ) : (
                <Text style={styles.timeText}>{contactInfo.workingHours.sunday_thursday}</Text>
              )}
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.dayText}>الجمعة</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editTimeInput}
                  value={editedInfo.workingHours.friday}
                  onChangeText={(text) =>
                    setEditedInfo({
                      ...editedInfo,
                      workingHours: { ...editedInfo.workingHours, friday: text },
                    })
                  }
                  placeholder="ساعات العمل"
                />
              ) : (
                <Text style={styles.timeText}>{contactInfo.workingHours.friday}</Text>
              )}
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.dayText}>السبت</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editTimeInput}
                  value={editedInfo.workingHours.saturday}
                  onChangeText={(text) =>
                    setEditedInfo({
                      ...editedInfo,
                      workingHours: { ...editedInfo.workingHours, saturday: text },
                    })
                  }
                  placeholder="ساعات العمل"
                />
              ) : (
                <Text style={styles.timeText}>{contactInfo.workingHours.saturday}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.supportTypes}>
          <Text style={styles.sectionTitle}>أنواع الدعم المتاحة</Text>
          <View style={styles.supportCard}>
            <View style={styles.supportItem}>
              <Text style={styles.supportTitle}>الدعم الفني</Text>
              <Text style={styles.supportDescription}>مساعدة في استخدام التطبيق والمشاكل التقنية</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportTitle}>استفسارات عامة</Text>
              <Text style={styles.supportDescription}>أسئلة حول الخدمات والميزات المتاحة</Text>
            </View>
            <View style={styles.supportItem}>
              <Text style={styles.supportTitle}>الشكاوى والاقتراحات</Text>
              <Text style={styles.supportDescription}>نرحب بملاحظاتكم لتحسين خدماتنا</Text>
            </View>
          </View>
        </View>

        {/* Send Inquiry Form */}
        <InquiryForm />
      </ScrollView>
    </>
  );
}

function InquiryForm() {
  const { user } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  const createInquiryMutation = useMutation(trpc.inquiries.create.mutationOptions());

  const handleSendInquiry = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول");
      return;
    }

    createInquiryMutation.mutate(
      {
        // userId is inferred from context on backend if user is logged in
        userId: user?.id ? Number(user.id) : undefined,
        title: `رسالة من ${name}`,
        content: message,
        category: "Contact Us",
        priority: "normal",
        // The procedure might need to be adjusted to accept name/email for guests
        guestInfo: !user ? { name, email } : undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.");
          setMessage("");
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل إرسال الرسالة");
        },
      }
    );
  };

  return (
    <View style={styles.inquirySection}>
      <Text style={styles.sectionTitle}>أرسل رسالة</Text>
      <View style={styles.inquiryForm}>
        <TextInput style={styles.inquiryInput} placeholder="الاسم الكامل" value={name} onChangeText={setName} />
        <TextInput
          style={styles.inquiryInput}
          placeholder="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.inquiryInput, styles.messageInput]}
          placeholder="رسالتك..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Button
          title={createInquiryMutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
          onPress={handleSendInquiry}
          disabled={createInquiryMutation.isPending}
          type="primary"
        />
      </View>
    </View>
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
  },
  headerText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  contactSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactItemContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  contactInfo: {
    marginRight: 16,
    flex: 1,
    alignItems: "flex-end",
  },
  contactLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
  },
  workingHours: {
    margin: 16,
  },
  hoursCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursItem: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dayText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  supportTypes: {
    margin: 16,
    marginBottom: 32,
  },
  supportCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: "flex-end",
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  cancelButton: {
    backgroundColor: COLORS.error || "#dc3545",
  },
  editInput: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
    textAlign: "right",
    minWidth: 200,
  },
  editTimeInput: {
    fontSize: 16,
    color: COLORS.darkGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 4,
    textAlign: "right",
    minWidth: 120,
  },
  linkText: {
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  inquirySection: {
    margin: 16,
  },
  inquiryForm: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inquiryInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    backgroundColor: COLORS.white,
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
