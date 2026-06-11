import React from "react";
import { StyleSheet, Text, View, ScrollView, Modal, TouchableOpacity, Dimensions } from "react-native";
import { X } from "lucide-react-native";
import { COLORS } from "../constants/colors";

const { height } = Dimensions.get("window");

interface TermsAndConditionsProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  accountType?: "pet_owner" | "veterinarian" | "poultry";
}

// ─── Poultry-specific terms ────────────────────────────────────
function PoultryTermsContent() {
  return (
    <>
      <Text style={styles.introText}>
        يرجى قراءة هذه الشروط والأحكام بعناية قبل إنشاء حساب تاجر أو تسجيل حقل دواجن. باستخدامك لقسم الدواجن في التطبيق فإنك توافق على جميع البنود الواردة أدناه.
      </Text>

      <Text style={styles.subSectionTitle}>1. صحة البيانات</Text>
      <Text style={styles.listItem}>
        يقر المستخدم بأن جميع المعلومات المدخلة صحيحة، ويتحمل مسؤولية أي معلومات غير صحيحة أو مضللة.
      </Text>

      <Text style={styles.subSectionTitle}>2. الإعلانات</Text>
      <Text style={styles.listItem}>
        يمنع نشر إعلانات وهمية أو مكررة أو تحتوي على معلومات غير صحيحة عن الدواجن أو البيض أو الأسعار.
      </Text>

      <Text style={styles.subSectionTitle}>3. التواصل بين الأطراف</Text>
      <Text style={styles.listItem}>
        التطبيق يوفر وسيلة للتواصل بين البائع والمشتري ولا يتحمل مسؤولية أي اتفاق أو عملية بيع أو شراء بين العملاء.
      </Text>

      <Text style={styles.subSectionTitle}>4. أسعار البورصة</Text>
      <Text style={styles.listItem}>
        الأسعار المعروضة في بورصة الدواجن وبورصة البيض هي أسعار استرشادية وقد تختلف حسب المنطقة والجودة والكمية، ويجب التأكد منها قبل أي اتفاق.
      </Text>

      <Text style={styles.subSectionTitle}>5. الحقول المسجلة</Text>
      <Text style={styles.listItem}>
        يتحمل صاحب الحقل مسؤولية جميع البيانات والأعداد والإحصائيات المدخلة داخل الحقل.
      </Text>

      <Text style={styles.subSectionTitle}>6. الأطباء والموظفون</Text>
      <Text style={styles.listItem}>
        صاحب الحقل مسؤول عن منح الصلاحيات للأطباء البيطريين والموظفين وإدارة حساباتهم.
      </Text>

      <Text style={styles.subSectionTitle}>7. المحتوى المخالف</Text>
      <Text style={styles.warningText}>
        يحق لإدارة التطبيق حذف أي إعلان أو حساب أو حقل يخالف الشروط دون إشعار مسبق.
      </Text>

      <Text style={styles.subSectionTitle}>8. الخصوصية</Text>
      <Text style={styles.listItem}>
        يوافق المستخدم على استخدام البيانات المدخلة لأغراض تشغيل خدمات التطبيق وتحسينها.
      </Text>

      <Text style={styles.subSectionTitle}>9. الاشتراكات</Text>
      <Text style={styles.listItem}>
        الاشتراكات والرسوم المدفوعة غير قابلة للاسترداد بعد تفعيل الخدمة إلا في الحالات التي تحددها إدارة التطبيق.
      </Text>

      <Text style={styles.subSectionTitle}>10. الملكية الفكرية</Text>
      <Text style={styles.listItem}>
        جميع حقوق التطبيق والتصميم والبرمجيات والأنظمة التابعة له محفوظة لإدارة التطبيق، ولا يجوز نسخها أو إعادة بيعها أو استغلالها دون إذن رسمي.
      </Text>

      <Text style={styles.subSectionTitle}>11. فقدان البيانات</Text>
      <Text style={styles.listItem}>
        لا يتحمل التطبيق أي مسؤولية في حالة فقدان البيانات دون قصد أو خلل برمجي.
      </Text>

      <Text style={styles.subSectionTitle}>12. الموافقة</Text>
      <Text style={styles.listItem}>
        باستخدام قسم الدواجن أو إنشاء حساب تاجر أو حقل دواجن فإن المستخدم يوافق على جميع الشروط والأحكام، ويحق للتطبيق تعديل الشروط في أي وقت، واستمرار الاستخدام يعني الموافقة على التحديثات.
      </Text>

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>معلومات التواصل:</Text>
        <Text style={styles.contactText}>اسم التطبيق: بيطري</Text>
        <Text style={styles.contactText}>البريد الرسمي: baytariapp@gmail.com</Text>
        <Text style={styles.contactText}>رقم التواصل: 009647777564666</Text>
      </View>
    </>
  );
}

export default function TermsAndConditions({
  visible,
  onClose,
  onAccept,
  accountType = "pet_owner",
}: TermsAndConditionsProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {accountType === "poultry"
                ? "شروط وأحكام قسم الدواجن"
                : "اتفاقية الاستخدام وشروط التسجيل"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.content}>
              {accountType === "poultry" ? (
                <PoultryTermsContent />
              ) : (
              <>
              <Text style={styles.introText}>
                يرجى قراءة هذه الاتفاقية بعناية قبل التسجيل أو استخدام التطبيق. إن قيامك بإنشاء حساب أو استخدام أي من
                خدمات التطبيق يُعد موافقة صريحة وملزمة قانونيًا على جميع الشروط والأحكام الواردة أدناه.
              </Text>

              <Text style={styles.sectionTitle}>أولًا: التعريفات</Text>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>التطبيق:</Text> يقصد به منصة البيطري بجميع خدماتها الإلكترونية.
              </Text>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>المستخدم:</Text> كل من يقوم بإنشاء حساب على التطبيق.
              </Text>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>صاحب الحيوان:</Text> المستخدم الذي يسجل حيواناته للاستفادة من الخدمات.
              </Text>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>الطبيب البيطري:</Text> كل طبيب أو طالب أو عيادة أو مكتب بيطري مسجل مهنيًا على
                المنصة.
              </Text>
              <Text style={styles.paragraph}>
                <Text style={styles.bold}>الاستشارات:</Text> الآراء الطبية المقدمة عبر التطبيق (بشرية أو عبر الذكاء
                الاصطناعي).
              </Text>

              <Text style={styles.sectionTitle}>ثانيًا: طبيعة الخدمة</Text>
              <Text style={styles.listItem}>
                • التطبيق منصة رقمية وسيطة تربط بين أصحاب الحيوانات والأطباء والعيادات والمتاجر البيطرية.
              </Text>
              <Text style={styles.listItem}>• التطبيق لا يُعد منشأة طبية ولا يقدم علاجًا مباشرًا.</Text>
              <Text style={styles.listItem}>
                • جميع الخدمات الطبية المقدمة هي مسؤولية مقدّمها (الطبيب/العيادة) وليست مسؤولية التطبيق.
              </Text>

              {accountType === "pet_owner" ? (
                <>
                  <Text style={styles.sectionTitle}>شروط استخدام صاحب الحيوان</Text>

                  <Text style={styles.subSectionTitle}>1. إنشاء الحساب</Text>
                  <Text style={styles.listItem}>• يلتزم المستخدم بتقديم معلومات صحيحة ودقيقة عن نفسه وعن الحيوان.</Text>
                  <Text style={styles.listItem}>• يتحمل المسؤولية الكاملة عن أي معلومات خاطئة أو مضللة.</Text>

                  <Text style={styles.subSectionTitle}>2. السجلات الطبية والمتابعات والإضافات</Text>
                  <Text style={styles.listItem}>
                    • يوافق المستخدم على إمكانية مشاركة بيانات حيوانه مع العيادات بعد منحه الإذن.
                  </Text>
                  <Text style={styles.listItem}>• التطبيق غير مسؤول عن أي استخدام طبي للبيانات من قبل الطبيب.</Text>

                  <Text style={styles.subSectionTitle}>3. الاستشارات الطبية</Text>
                  <Text style={styles.listItem}>• الاستشارات عبر التطبيق هي لأغراض إرشادية فقط.</Text>
                  <Text style={styles.listItem}>• لا تغني عن الفحص السريري المباشر.</Text>
                  <Text style={styles.listItem}>
                    • التطبيق غير مسؤول عن أي قرارات علاجية يتخذها المستخدم بناءً على الاستشارة.
                  </Text>

                  <Text style={styles.subSectionTitle}>4. استشارات الذكاء الاصطناعي</Text>
                  <Text style={styles.listItem}>
                    • بعض الردود تتم عبر أنظمة ذكاء اصطناعي (ذكاء اصطناعي مختص بالطب البيطري) في الأوقات التي لا يتوفر
                    أطباء بيطريين متاحين.
                  </Text>
                  <Text style={styles.listItem}>• قد تحتوي على أخطاء أو معلومات غير مكتملة.</Text>
                  <Text style={styles.warningText}>لا يُعتمد عليها كتشخيص نهائي.</Text>

                  <Text style={styles.subSectionTitle}>5. المتجر الإلكتروني</Text>
                  <Text style={styles.listItem}>• التطبيق وسيط بيع بين المستخدم والبائع.</Text>
                  <Text style={styles.listItem}>• مسؤولية جودة المنتجات تقع على البائع.</Text>
                  <Text style={styles.listItem}>• لا يتحمل التطبيق أي أضرار ناتجة عن سوء استخدام المنتجات.</Text>

                  <Text style={styles.subSectionTitle}>6. فقدان البيانات</Text>
                  <Text style={styles.listItem}>
                    • لا يتحمل التطبيق أي مسؤولية في حالة فقدان البيانات دون قصد أو خلل برمجي.
                  </Text>

                  <Text style={styles.subSectionTitle}>7. حدود المسؤولية</Text>
                  <Text style={styles.paragraph}>يُخلي صاحب التطبيق مسؤوليته القانونية عن:</Text>
                  <Text style={styles.listItem}>• أي ضرر يصيب الحيوان نتيجة استشارة أو علاج.</Text>
                  <Text style={styles.listItem}>• سوء استخدام الأدوية أو المنتجات.</Text>
                  <Text style={styles.listItem}>• أخطاء التشخيص عن بُعد.</Text>
                  <Text style={styles.listItem}>• الاعتماد على الذكاء الاصطناعي دون مراجعة مختص.</Text>
                  <Text style={styles.listItem}>• التعاملات التجارية بين المستخدمين.</Text>

                  <Text style={styles.subSectionTitle}>8. إخلاء المسؤولية الطبية</Text>
                  <Text style={styles.paragraph}>جميع المعلومات داخل التطبيق:</Text>
                  <Text style={styles.listItem}>• لأغراض تثقيفية وإرشادية فقط.</Text>
                  <Text style={styles.listItem}>• لا تُعد بديلًا عن الفحص البيطري المباشر.</Text>
                </>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>شروط الأطباء والعيادات والمذاخر</Text>

                  <Text style={styles.subSectionTitle}>1. التحقق والتراخيص</Text>
                  <Text style={styles.listItem}>• يلتزم الطبيب/طالب الطب البيطري بتقديم وثائق رسمية سارية.</Text>
                  <Text style={styles.listItem}>• يحق للتطبيق رفض أو إلغاء أي حساب دون إبداء الأسباب.</Text>

                  <Text style={styles.subSectionTitle}>2. المسؤولية الطبية</Text>
                  <Text style={styles.paragraph}>يتحمل الطبيب كامل المسؤولية القانونية والمهنية عن:</Text>
                  <Text style={styles.listItem}>• التشخيص</Text>
                  <Text style={styles.listItem}>• الوصفات</Text>
                  <Text style={styles.listItem}>• الاستشارات</Text>
                  <Text style={styles.listItem}>• التوصيات العلاجية</Text>
                  <Text style={styles.warningText}>التطبيق غير مسؤول عن الأخطاء الطبية أو المضاعفات.</Text>

                  <Text style={styles.subSectionTitle}>3. الاستشارات داخل المنصة</Text>
                  <Text style={styles.listItem}>• يلتزم الطبيب بتقديم معلومات دقيقة ومهنية.</Text>
                  <Text style={styles.listItem}>• يمنع تقديم وصفات خطرة دون فحص عند الإمكان.</Text>

                  <Text style={styles.subSectionTitle}>4. استخدام الذكاء الاصطناعي</Text>
                  <Text style={styles.listItem}>• قد تُستخدم أنظمة ذكاء اصطناعي مساعدة.</Text>
                  <Text style={styles.listItem}>• الطبيب مسؤول عن مراجعة أي رد قبل اعتماده طبيًا.</Text>

                  <Text style={styles.subSectionTitle}>5. إضافة العيادات والمتاجر</Text>
                  <Text style={styles.listItem}>• يلتزم مقدم الخدمة بصحة بيانات الموقع والتراخيص.</Text>
                  <Text style={styles.listItem}>• يتحمل المسؤولية القانونية عن المنتجات أو الخدمات المباعة.</Text>

                  <Text style={styles.subSectionTitle}>6. المتجر الإلكتروني</Text>
                  <Text style={styles.listItem}>• التطبيق وسيط بيع بين المستخدم والبائع.</Text>
                  <Text style={styles.listItem}>• مسؤولية جودة المنتجات تقع على البائع.</Text>
                  <Text style={styles.listItem}>• لا يتحمل التطبيق أي أضرار ناتجة عن سوء استخدام المنتجات.</Text>

                  <Text style={styles.subSectionTitle}>7. فقدان البيانات</Text>
                  <Text style={styles.listItem}>
                    • لا يتحمل التطبيق أي مسؤولية في حالة فقدان البيانات دون قصد أو خلل برمجي.
                  </Text>

                  <Text style={styles.subSectionTitle}>8. القوانين العامة</Text>
                  <Text style={styles.listItem}>
                    • تسري على الأطباء البيطريين والطلاب جميع القوانين سارية في اتفاقية صاحب الحيوان.
                  </Text>
                </>
              )}

              <Text style={styles.sectionTitle}>الشروط المشتركة</Text>

              <Text style={styles.subSectionTitle}>{accountType === "pet_owner" ? "9" : "9"}. الخصوصية والبيانات</Text>
              <Text style={styles.listItem}>• يوافق المستخدم على تخزين بياناته وبيانات حيواناته.</Text>
              <Text style={styles.listItem}>• تُستخدم لتحسين الخدمة فقط.</Text>
              <Text style={styles.listItem}>• لا يتم بيع البيانات لطرف ثالث دون إذن قانوني.</Text>
              <Text style={styles.listItem}>
                • في حالة النزاع يحق للتطبيق تسليم البيانات الحقيقية للجهات المختصة حسب القانون.
              </Text>

              <Text style={styles.subSectionTitle}>{accountType === "pet_owner" ? "10" : "10"}. السلوك المحظور</Text>
              <Text style={styles.paragraph}>يُمنع:</Text>
              <Text style={styles.listItem}>• تقديم معلومات مزيفة.</Text>
              <Text style={styles.listItem}>• انتحال صفة طبيب.</Text>
              <Text style={styles.listItem}>• بيع منتجات غير مرخصة.</Text>
              <Text style={styles.listItem}>• إساءة استخدام المنصة.</Text>
              <Text style={styles.warningText}>ويحق للتطبيق إيقاف الحساب فورًا.</Text>

              <Text style={styles.subSectionTitle}>{accountType === "pet_owner" ? "11" : "11"}. الملكية الفكرية</Text>
              <Text style={styles.paragraph}>جميع حقوق:</Text>
              <Text style={styles.listItem}>• التصميم</Text>
              <Text style={styles.listItem}>• المحتوى</Text>
              <Text style={styles.listItem}>• الشعار</Text>
              <Text style={styles.listItem}>• البرمجيات</Text>
              <Text style={styles.paragraph}>مملوكة لصاحب التطبيق ولا يجوز استخدامها دون إذن.</Text>

              <Text style={styles.subSectionTitle}>{accountType === "pet_owner" ? "12" : "12"}. إيقاف الخدمة</Text>
              <Text style={styles.paragraph}>يحق للتطبيق:</Text>
              <Text style={styles.listItem}>• تعديل الخدمات.</Text>
              <Text style={styles.listItem}>• إيقاف الحسابات المخالفة.</Text>
              <Text style={styles.listItem}>• إلغاء أو تقييد الوصول دون إشعار مسبق.</Text>

              <Text style={styles.subSectionTitle}>
                {accountType === "pet_owner" ? "13" : "13"}. التعديلات على الاتفاقية
              </Text>
              <Text style={styles.listItem}>• يحق للتطبيق تعديل الشروط في أي وقت.</Text>
              <Text style={styles.listItem}>• استمرار الاستخدام يعني الموافقة على التحديثات.</Text>

              <Text style={styles.subSectionTitle}>
                {accountType === "pet_owner" ? "14" : "14"}. القانون الواجب التطبيق
              </Text>
              <Text style={styles.paragraph}>تخضع هذه الاتفاقية لقوانين:</Text>
              <Text style={styles.listItem}>(قوانين بلدك او الدولة التي تقيم بها)</Text>
              <Text style={styles.paragraph}>وتُحال النزاعات إلى محاكمها المختصة.</Text>

              <Text style={styles.subSectionTitle}>{accountType === "pet_owner" ? "15" : "15"}. الإقرار والموافقة</Text>
              <Text style={styles.paragraph}>بالضغط على زر "موافق" فإنك تقر بأنك:</Text>
              <Text style={styles.listItem}>• قرأت الاتفاقية كاملة.</Text>
              <Text style={styles.listItem}>• فهمت جميع البنود.</Text>
              <Text style={styles.listItem}>• وافقت عليها دون قيد أو شرط.</Text>

              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>معلومات التواصل:</Text>
                <Text style={styles.contactText}>اسم التطبيق: بيطري</Text>
                <Text style={styles.contactText}>البريد الرسمي: baytariapp@gmail.com</Text>
                <Text style={styles.contactText}>رقم التواصل: 009647777564666</Text>
              </View>
              </>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>أوافق على الشروط</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: "90%",
    maxHeight: height * 0.85,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    textAlign: "left",
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 20,
  },
  introText: {
    fontSize: 15,
    color: COLORS.black,
    textAlign: "left",
    lineHeight: 24,
    marginBottom: 20,
    backgroundColor: "#FFF9E6",
    padding: 12,
    borderRadius: 8,
    borderRightWidth: 3,
    borderRightColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "left",
    marginTop: 20,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "left",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: COLORS.black,
    textAlign: "left",
    lineHeight: 24,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    color: COLORS.black,
    textAlign: "left",
    lineHeight: 24,
    marginBottom: 6,
    paddingRight: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 15,
    color: "#d32f2f",
    textAlign: "left",
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "600",
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 6,
  },
  contactSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "left",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "left",
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: "600",
  },
});
