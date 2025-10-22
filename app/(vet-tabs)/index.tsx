import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useRouter } from 'expo-router';
import { useApp } from "../../providers/AppProvider";
import Button from "../../components/Button";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/Card";
import { mockClinics, mockConsultations, mockLostPets, mockTips } from "../../mocks/data";
import { Bell, Calendar, MapPin, MessageCircle, Phone, Search, Star } from 'lucide-react-native';

const heroImages = [
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
  'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
  'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2087&q=80'
];

export default function VetHomeScreen() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { user } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSendConsultation = () => {
    router.push('/consultation');
  };

  const handleViewTips = () => {
    router.push('/tips-list');
  };

  const handleViewClinics = () => {
    router.push('/clinics-list');
  };

  const handleViewConsultations = () => {
    router.push('/consultations-list');
  };

  const handleViewLostPets = () => {
    router.push('/lost-pets-list');
  };

  const handleReportLostPet = () => {
    router.push('/report-lost-pet');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left side - Action icons */}
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/search')}
          >
            <Search size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/messages')}
          >
            <MessageCircle size={24} color={COLORS.darkGray} />
          </TouchableOpacity>
          

        </View>
        
        {/* Right side - Profile section */}
        <View style={styles.headerRight}>
          <View style={styles.profileTextContainer}>
            <Text style={styles.greetingText}>مرحباً</Text>
            <Text style={styles.nameText}>{user?.name || 'د. محمد أحمد'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={() => router.push('/(vet-tabs)/profile')}
          >
            <Image 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Changing Images Section */}
        <View style={styles.imagesContainer}>
          <Image
            source={{ uri: heroImages[currentImageIndex] }}
            style={styles.changingImage}
            resizeMode="cover"
          />
        </View>

        {/* Consultation Section */}
        <View style={styles.consultationSection}>
          <View style={styles.consultationCard}>
            <Text style={[styles.consultationText, { textAlign: 'center' }]}>
              {t('home.consultation')}
            </Text>
            <Button
              title={t('home.sendConsultation')}
              onPress={handleSendConsultation}
              type="primary"
              size="medium"
              style={styles.consultationButton}
            />
          </View>
        </View>

        {/* Best Tips Section */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.bestTips')}
            onSeeAll={handleViewTips}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockTips.map((tip) => (
              <Card
                key={tip.id}
                title={tip.title}
                image={tip.image}
                style={[styles.tipCard, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => {
                  console.log(`View tip ${tip.id}`);
                  // TODO: Navigate to tip details
                }}
              >
                <Text style={[styles.tipContent, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {tip.content}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Available Clinics Section */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.availableClinics')}
            onSeeAll={handleViewClinics}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockClinics.map((clinic) => (
              <TouchableOpacity
                key={clinic.id}
                style={[styles.clinicCardNew, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => router.push({ pathname: '/clinic-profile', params: { id: clinic.id } })}
              >
                <View style={[styles.clinicCardContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {/* Clinic Info */}
                  <View style={[styles.clinicDetails, { flex: 1, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }]}>
                    {/* Premium Badge */}
                    {clinic.isPremium && (
                      <View style={[styles.premiumBadgeContainer, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}>
                        <View style={styles.premiumBadge}>
                          <Star size={12} color={COLORS.white} fill={COLORS.white} />
                          <Text style={styles.premiumBadgeText}>مميز</Text>
                        </View>
                      </View>
                    )}
                    
                    {/* Clinic Name */}
                    <Text style={[styles.clinicName, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {clinic.name}
                    </Text>
                    
                    {/* Location */}
                    <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <MapPin size={16} color="#10B981" />
                      <Text style={[styles.clinicInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                        {clinic.address}
                      </Text>
                    </View>
                    
                    {/* Phone */}
                    <View style={[styles.clinicInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Phone size={16} color="#10B981" />
                      <Text style={[styles.clinicInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                        {clinic.phone}
                      </Text>
                    </View>
                    
                    {/* Rating */}
                    <View style={[styles.clinicRatingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Text style={[styles.clinicRatingText, { marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }]}>
                        {clinic.rating}
                      </Text>
                      <Star size={16} color="#FFD700" fill="#FFD700" />
                    </View>
                  </View>
                  
                  {/* Clinic Image */}
                  <Image source={{ uri: clinic.image }} style={styles.clinicImage} />
                </View>
                
                {/* Action Buttons */}
                <View style={[styles.clinicActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity 
                    style={[styles.clinicActionButton, styles.primaryClinicActionButton]}
                    onPress={() => {
                      console.log(`Call clinic ${clinic.id}: ${clinic.phone}`);
                      // TODO: Implement phone call functionality
                    }}
                  >
                    <Text style={[styles.clinicActionButtonText, styles.primaryClinicActionButtonText]}>اتصال</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.clinicActionButton}
                    onPress={() => {
                      console.log(`Show map for clinic ${clinic.id}`);
                      // TODO: Implement map functionality
                    }}
                  >
                    <Text style={styles.clinicActionButtonText}>الخريطة</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Previous Consultations Section */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.previousConsultations')}
            onSeeAll={handleViewConsultations}
          />
          {mockConsultations.map((consultation) => (
            <Card
              key={consultation.id}
              title={consultation.question}
              subtitle={new Date(consultation.createdAt).toLocaleDateString()}
              style={styles.consultationHistoryCard}
              onPress={() => {
                console.log(`View consultation ${consultation.id}`);
                // TODO: Navigate to consultation details
              }}
            >
              <View style={[styles.statusContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View
                  style={[
                    styles.statusIndicator,
                    consultation.status === 'pending'
                      ? styles.statusPending
                      : consultation.status === 'answered'
                      ? styles.statusAnswered
                      : styles.statusClosed,
                  ]}
                />
                <Text style={[styles.statusText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                  {t(`consultation.${consultation.status}`)}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Lost Pets Section */}
        <View style={styles.section}>
          <SectionHeader
            title={t('home.lostPets')}
            onSeeAll={handleViewLostPets}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalScrollContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {mockLostPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.lostPetCardNew, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                onPress={() => router.push({ pathname: '/lost-pet', params: { id: pet.id } })}
              >
                <View style={[styles.lostPetCardContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {/* Pet Image */}
                  <Image source={{ uri: pet.image }} style={styles.lostPetImage} />
                  
                  {/* Pet Info */}
                  <View style={[styles.lostPetDetails, { flex: 1, marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadgeContainer, { alignSelf: isRTL ? 'flex-start' : 'flex-end' }]}>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>مفقود</Text>
                      </View>
                    </View>
                    
                    {/* Pet Name and Type */}
                    <Text style={[styles.lostPetName, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {pet.name}
                    </Text>
                    <Text style={[styles.lostPetType, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {t(`pets.types.${pet.type}`)}
                    </Text>
                    
                    {/* Location */}
                    <View style={[styles.lostPetInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <MapPin size={14} color="#10B981" />
                      <Text style={[styles.lostPetInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                        {pet.lastSeen.location}
                      </Text>
                    </View>
                    
                    {/* Date */}
                    <View style={[styles.lostPetInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Calendar size={14} color="#10B981" />
                      <Text style={[styles.lostPetInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                        {new Date(pet.lastSeen.date).toLocaleDateString('ar-SA')}
                      </Text>
                    </View>
                    
                    {/* Phone */}
                    <View style={[styles.lostPetInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Phone size={14} color="#10B981" />
                      <Text style={[styles.lostPetInfoRowText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
                        {pet.contactInfo.phone}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Description */}
                <Text style={[styles.lostPetDescription, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {pet.description}
                </Text>
                
                {/* Action Buttons */}
                <View style={[styles.lostPetActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      console.log(`Show location for lost pet ${pet.id}`);
                      // TODO: Implement map/location functionality
                    }}
                  >
                    <Text style={styles.actionButtonText}>الموقع</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      console.log(`Report found pet ${pet.id}`);
                      // TODO: Implement report found functionality
                    }}
                  >
                    <Text style={styles.actionButtonText}>ابلاغ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryActionButton]}
                    onPress={() => {
                      console.log(`Contact owner for pet ${pet.id}`);
                      // TODO: Implement contact owner functionality
                    }}
                  >
                    <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>اتصال</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            title={t('home.reportLostPet')}
            onPress={handleReportLostPet}
            type="outline"
            size="medium"
            style={styles.reportButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  iconButton: {
    padding: 8,
  },
  switchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginLeft: 12,
  },
  profileTextContainer: {
    alignItems: 'flex-end',
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  imagesContainer: {
    height: 200,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  changingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  consultationSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  },
  clinicInfoItem: {
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
  ratingStars: {
    fontSize: 14,
    color: '#FFD700',
  },
  clinicCardNew: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 320,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clinicCardContent: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clinicImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  clinicDetails: {
    justifyContent: 'flex-start',
  },
  premiumBadgeContainer: {
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  clinicInfoRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  clinicInfoRowText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  clinicRatingRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  clinicRatingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  clinicActions: {
    justifyContent: 'space-between',
    gap: 12,
  },
  clinicActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  clinicActionButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  primaryClinicActionButton: {
    backgroundColor: '#10B981',
  },
  primaryClinicActionButtonText: {
    color: COLORS.white,
  },
  consultationHistoryCard: {
    marginHorizontal: 16,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusAnswered: {
    backgroundColor: COLORS.success,
  },
  statusClosed: {
    backgroundColor: COLORS.darkGray,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  lostPetCard: {
    width: 250,
  },
  lostPetInfo: {
    marginTop: 8,
  },
  lostPetInfoItem: {
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
  lostPetsContainer: {
    paddingHorizontal: 16,
  },
  lostPetCardNew: {
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
  lostPetCardContent: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  lostPetImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  lostPetDetails: {
    justifyContent: 'flex-start',
  },
  statusBadgeContainer: {
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lostPetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  lostPetType: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  lostPetInfoRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  lostPetInfoRowText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  lostPetDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    lineHeight: 18,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  lostPetActions: {
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  primaryActionButton: {
    backgroundColor: '#10B981',
  },
  primaryActionButtonText: {
    color: COLORS.white,
  },
  reportButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
});