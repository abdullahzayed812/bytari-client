import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { router, Stack } from 'expo-router';
import { 
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  MessageSquare
} from 'lucide-react-native';
import RatingComponent from "../components/RatingComponent";

const { width } = Dimensions.get('window');

export default function ClinicProfileScreen() {
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  
  // Mock clinic data for public view
  const clinic = {
    id: 'clinic1',
    name: 'عيادة الرحمة البيطرية',
    address: 'بغداد - الكرادة - شارع الطيران',
    latitude: 33.3152,
    longitude: 44.3661,
    phone: '+964 770 123 4567',
    rating: 4.8,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    isOpen: true,
    openingHours: '8:00 ص - 10:00 م',
    services: ['فحص عام', 'تطعيمات', 'جراحة', 'أشعة', 'علاج الأسنان', 'العمليات الجراحية'],
    isPremium: true,
    description: 'عيادة بيطرية متخصصة تقدم أفضل الخدمات الطبية للحيوانات الأليفة مع فريق من الأطباء المتخصصين وأحدث المعدات الطبية.',
    doctors: [
      { name: 'د. أحمد محمد', specialty: 'طب بيطري عام' },
      { name: 'د. فاطمة علي', specialty: 'جراحة بيطرية' },
      { name: 'د. محمد حسن', specialty: 'طب الأسنان البيطري' }
    ],
    workingDays: 'السبت - الخميس',
    emergencyAvailable: true
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={16} color="#FFD700" fill="#FFD700" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} color="#E5E7EB" />
      );
    }
    
    return stars;
  };

  const handleCall = async () => {
    try {
      const phoneUrl = `tel:${clinic.phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('خطأ', 'لا يمكن إجراء المكالمة من هذا الجهاز');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء محاولة الاتصال');
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    console.log('Rating submitted:', { rating, comment, clinicId: clinic.id });
    // TODO: Implement API call to submit rating
    // await submitClinicRating(clinic.id, rating, comment);
  };







  return (
    <>
      <Stack.Screen 
        options={{
          title: clinic.name,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => {
                console.log('Clinic profile back button pressed');
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Clinic Header */}
        <View style={styles.clinicHeader}>
          <Image source={{ uri: clinic.image }} style={styles.clinicHeaderImage} />
          <View style={styles.clinicHeaderOverlay}>
            <Text style={styles.clinicHeaderName}>{clinic.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{clinic.isOpen ? 'مفتوح الآن' : 'مغلق'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          {/* Rating and Reviews */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{clinic.rating}</Text>
              <View style={styles.starsContainer}>
                {renderStars(clinic.rating)}
              </View>
              <Text style={styles.reviewsCount}>({clinic.reviewsCount} تقييم)</Text>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>نبذة عن العيادة</Text>
            <Text style={styles.descriptionText}>{clinic.description}</Text>
          </View>
          
          {/* Contact Information */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>معلومات الاتصال</Text>
            
            <View style={styles.contactItem}>
              <MapPin size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{clinic.address}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Phone size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>{clinic.phone}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Clock size={20} color={COLORS.primary} />
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactText}>ساعات العمل: {clinic.openingHours}</Text>
                <Text style={styles.contactSubText}>أيام العمل: {clinic.workingDays}</Text>
                {clinic.emergencyAvailable && (
                  <Text style={styles.emergencyText}>متوفر للحالات الطارئة</Text>
                )}
              </View>
            </View>
          </View>
          
          {/* Services */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>الخدمات المتوفرة</Text>
            {clinic.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceText}>• {service}</Text>
              </View>
            ))}
          </View>
          
          {/* Doctors */}
          <View style={styles.doctorsSection}>
            <Text style={styles.sectionTitle}>الأطباء</Text>
            {clinic.doctors.map((doctor, index) => (
              <View key={index} style={styles.doctorItem}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              </View>
            ))}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCall}
            >
              <Phone size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>اتصال</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.directionsButton]}
              onPress={() => {
                console.log('Opening directions to clinic');
                router.push({
                  pathname: '/map-location',
                  params: {
                    latitude: clinic.latitude,
                    longitude: clinic.longitude,
                    name: clinic.name,
                    address: clinic.address,
                    mode: 'directions'
                  }
                });
              }}
            >
              <Navigation size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>الاتجاهات</Text>
            </TouchableOpacity>
          </View>
          
          {/* Rating Button */}
          <TouchableOpacity 
            style={styles.ratingButton}
            onPress={() => setShowRatingModal(true)}
          >
            <MessageSquare size={20} color={COLORS.primary} />
            <Text style={styles.ratingButtonText}>قيم العيادة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <RatingComponent
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        title="تقييم العيادة"
        entityName={clinic.name}
      />
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
  clinicHeader: {
    height: 200,
    position: 'relative',
  },
  clinicHeaderImage: {
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
  clinicHeaderOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  clinicHeaderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  ratingSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  descriptionSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    textAlign: 'right',
  },
  contactSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.black,
    flex: 1,
    textAlign: 'right',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactSubText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'right',
  },
  emergencyText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'right',
  },
  servicesSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'right',
  },
  serviceItem: {
    paddingVertical: 8,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'right',
  },
  doctorsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: COLORS.success,
  },
  directionsButton: {
    backgroundColor: COLORS.info,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});