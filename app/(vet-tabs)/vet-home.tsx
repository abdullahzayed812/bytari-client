import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { useApp } from "../../providers/AppProvider";
import Button from "../../components/Button";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/Card";
import { mockClinics, mockConsultations, mockLostPets, mockTips } from "../../mocks/data";
import { Bell, Calendar, MapPin, MessageCircle, Phone, Star, Search, Heart, Download, User, Plus, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react-native';
import { UserModeToggle } from "../../components/UserModeToggle";
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

const heroImages = [
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
  'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
  'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80'
];

export default function VetHomeScreen() {
  const { t, isRTL } = useI18n();
  const { userMode, isSuperAdmin } = useApp();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const panRef = useRef<PanGestureHandler>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const startAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    autoSlideRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
  };

  const stopAutoSlide = () => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const onGestureEvent = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.END) {
      const threshold = screenWidth * 0.25;
      
      if (Math.abs(translationX) > threshold) {
        if (translationX > 0) {
          setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
          );
        } else {
          setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % heroImages.length
          );
        }
        startAutoSlide();
      }
    }
  };

  const onHandlerStateChange = (event: any) => {
    const { state } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      stopAutoSlide();
    } else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      startAutoSlide();
    }
  };

  const handleSendConsultation = () => {
    router.push('/new-inquiry');
  };

  const handleViewTips = () => {
    router.push('/vet-magazine');
  };

  const handleViewClinics = () => {
    router.push('/vet-stores-list');
  };

  const handleViewLostPets = () => {
    router.push('/vet-books');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.userInfoContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(vet-tabs)/profile')}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          
          <View style={[styles.userTextContainer, { marginRight: isRTL ? 8 : 0, marginLeft: isRTL ? 0 : 8 }]}>
            <Text style={[styles.greetingText, { textAlign: isRTL ? 'right' : 'left' }]}>
              مرحباً دكتور
            </Text>
            <Text style={[styles.userNameText, { textAlign: isRTL ? 'right' : 'left' }]}>أحمد محمد</Text>
          </View>
        </View>
        
        <View style={[styles.rightIcons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/search')}
          >
            <Search size={24} color={COLORS.black} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color={COLORS.black} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/messages')}
          >
            <MessageCircle size={24} color={COLORS.black} />
          </TouchableOpacity>
          
          <UserModeToggle />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* New Advertisement Section */}
        <View style={styles.advertisementSection}>
          {isSuperAdmin && (
            <View style={styles.adSectionHeader}>
              <Text style={[styles.adSectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                الإعلانات
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/admin-content-manager?type=ads')} 
                style={[styles.adminButton, styles.addButton]}
              >
                <Plus size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.adContainer}>
            <PanGestureHandler
              ref={panRef}
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetX={[-10, 10]}
              failOffsetY={[-5, 5]}
            >
              <TouchableOpacity 
                style={styles.adImageWrapper}
                onPress={() => {
                  router.push(`/ad-details?id=${currentImageIndex + 1}`);
                }}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: heroImages[currentImageIndex] }}
                  style={styles.adImage}
                  resizeMode="cover"
                />
                {/* Ad Text Overlay - Direct on image without background */}
                <View style={styles.adTextOverlay}>
                  <Text style={styles.adTitle}>
                    {currentImageIndex === 0 ? 'مؤتمر الطب البيطري السنوي' :
                     currentImageIndex === 1 ? 'دورة تدريبية في الجراحة البيطرية' :
                     currentImageIndex === 2 ? 'معدات طبية بيطرية متطورة' :
                     currentImageIndex === 3 ? 'برنامج التعليم المستمر للأطباء' :
                     'خدمات استشارية متخصصة'}
                  </Text>
                  <Text style={styles.adSubtitle}>
                    {currentImageIndex === 0 ? 'سجل الآن واحصل على خصم مبكر' :
                     currentImageIndex === 1 ? 'من أفضل الخبراء في المجال' :
                     currentImageIndex === 2 ? 'تقنيات حديثة لتشخيص دقيق' :
                     currentImageIndex === 3 ? 'طور مهاراتك المهنية' :
                     'استشارات من خبراء عالميين'}
                  </Text>
                </View>
                

              </TouchableOpacity>
            </PanGestureHandler>
            
            
            <View style={styles.paginationContainer}>
              {heroImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex ? styles.paginationDotActive : styles.paginationDotInactive
                  ]}
                  onPress={() => {
                    setCurrentImageIndex(index);
                    startAutoSlide();
                  }}
                />
              ))}
            </View>
          </View>
        </View>
        {/* Consultation Section */}
        <View style={styles.consultationSection}>
          <View style={styles.consultationCard}>
            <Text style={[styles.consultationText, { textAlign: 'center' }]}>
              أرسل استفسارك الطبي البيطري وسيتم الرد عليك من قبل خبراء متخصصين
            </Text>
            <Button
              title="ارسل استفسارك"
              onPress={handleSendConsultation}
              type="primary"
              size="medium"
              style={styles.consultationButton}
            />
          </View>
        </View>

        {/* Previous Inquiries Section */}
        <View style={styles.section}>
          <SectionHeader
            title="استفساراتك السابقة"
            onSeeAll={() => router.push('/vet-inquiries')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockConsultations.slice(0, 3).map((consultation) => (
              <TouchableOpacity
                key={consultation.id}
                style={[styles.consultationHistoryCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => router.push('/vet-inquiries')}
              >
                <Text style={[styles.consultationHistoryTitle, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {consultation.title}
                </Text>
                <Text style={[styles.consultationHistoryDescription, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={3}>
                  {consultation.description}
                </Text>
                <Text style={[styles.consultationHistoryDate, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {new Date(consultation.createdAt).toLocaleDateString('ar-SA')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Veterinary Stores Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <SectionHeader
              title="المتاجر البيطرية"
              onSeeAll={handleViewClinics}
            />
            {isSuperAdmin && (
              <TouchableOpacity 
                onPress={() => router.push('/home-stores-management')} 
                style={[styles.adminButton, styles.editButton]}
              >
                <Edit3 size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockClinics.slice(0, 3).map((clinic) => (
              <Card
                key={clinic.id}
                title={clinic.name}
                image={clinic.image}
                style={[styles.clinicCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => router.push({ pathname: '/clinic-profile', params: { id: clinic.id } })}
              >
                <View style={[styles.clinicInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <MapPin size={16} color={COLORS.gray} />
                  <Text style={[styles.clinicInfoText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                    {clinic.address}
                  </Text>
                </View>
                <View style={[styles.ratingContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Star size={16} color="#FFD700" />
                  <Text style={[styles.ratingText, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                    {clinic.rating}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Veterinary Magazine Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <SectionHeader
              title="المجلة البيطرية"
              onSeeAll={handleViewTips}
            />
            {isSuperAdmin && (
              <TouchableOpacity 
                onPress={() => router.push('/home-magazine-management')} 
                style={[styles.adminButton, styles.editButton]}
              >
                <Edit3 size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockTips.slice(0, 3).map((tip) => (
              <Card
                key={tip.id}
                title={tip.title}
                image={tip.image}
                style={[styles.tipCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => {
                  console.log(`View tip ${tip.id}`);
                }}
              >
                <Text style={[styles.tipContent, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {tip.content}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Veterinary Books Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithEdit}>
            <SectionHeader
              title="الكتب البيطرية"
              onSeeAll={handleViewLostPets}
            />
            {isSuperAdmin && (
              <TouchableOpacity 
                onPress={() => router.push('/home-books-management')} 
                style={[styles.adminButton, styles.editButton]}
              >
                <Edit3 size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockLostPets.slice(0, 3).map((pet) => (
              <Card
                key={pet.id}
                title={pet.name}
                image={pet.image}
                style={[styles.lostPetCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => router.push({ pathname: '/lost-pet', params: { id: pet.id } })}
              >
                <Text style={[styles.lostPetInfoText, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {pet.type} • {pet.breed}
                </Text>
                <View style={[styles.lostPetInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <MapPin size={14} color={COLORS.gray} />
                  <Text style={[styles.lostPetDate, { marginLeft: isRTL ? 0 : 4, marginRight: isRTL ? 4 : 0 }]}>
                    {pet.lastSeen.location}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  rightIcons: {
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userTextContainer: {
    alignItems: 'flex-start',
  },
  greetingText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingBottom: 90,
  },
  advertisementSection: {
    marginBottom: 16,
  },
  adContainer: {
    height: 220,
    marginHorizontal: 16,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  adImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adTextOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 6,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  adSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },


  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  adSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  adSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  adminButton: {
    padding: 6,
    borderRadius: 6,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: COLORS.success || '#28a745',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  sectionHeaderWithEdit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  consultationSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 16,
  },
  consultationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 26,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  consultationButton: {
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
  tipCard: {
    width: 250,
  },
  tipContent: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  clinicCard: {
    width: 250,
  },
  clinicInfo: {
    marginTop: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  clinicInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  consultationHistoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 300,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
    lineHeight: 22,
  },
  consultationHistoryDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  consultationHistoryDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  lostPetCard: {
    width: 250,
  },
  lostPetInfo: {
    marginTop: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  lostPetInfoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  lostPetDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});