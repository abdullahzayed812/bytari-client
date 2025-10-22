import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text, Image } from 'react-native';
import { Edit3, User, UserCheck } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import Button from '@/components/Button';

interface ProfileIconProps {
  gender?: 'male' | 'female';
  size?: number;
  showEditButton?: boolean;
  onGenderChange?: (gender: 'male' | 'female') => void;
  customImage?: string;
  onImageChange?: (imageUri: string) => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
  gender = 'male',
  size = 80,
  showEditButton = false,
  onGenderChange,
  customImage,
  onImageChange
}) => {
  const [showGenderModal, setShowGenderModal] = useState(false);

  const getMaleIcon = () => (
    <View style={[styles.iconContainer, { width: size, height: size, backgroundColor: '#4A90E2' }]}>
      <User size={size * 0.5} color={COLORS.white} />
    </View>
  );

  const getFemaleIcon = () => (
    <View style={[styles.iconContainer, { width: size, height: size, backgroundColor: '#E91E63' }]}>
      <UserCheck size={size * 0.5} color={COLORS.white} />
    </View>
  );

  const handleEditPress = () => {
    setShowGenderModal(true);
  };

  const handleGenderSelect = (selectedGender: 'male' | 'female') => {
    onGenderChange?.(selectedGender);
    setShowGenderModal(false);
  };

  const renderProfileImage = () => {
    if (customImage) {
      return (
        <Image 
          source={{ uri: customImage }} 
          style={[styles.customImage, { width: size, height: size, borderRadius: size / 2 }]} 
        />
      );
    }
    
    return gender === 'male' ? getMaleIcon() : getFemaleIcon();
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {renderProfileImage()}
        
        {showEditButton && (
          <TouchableOpacity 
            style={[styles.editButton, { width: size * 0.3, height: size * 0.3 }]} 
            onPress={handleEditPress}
          >
            <Edit3 size={size * 0.15} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showGenderModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>اختر نوع الصورة الشخصية</Text>
          </View>
          
          <View style={styles.genderOptions}>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'male' && styles.selectedGenderOption]}
              onPress={() => handleGenderSelect('male')}
            >
              <View style={[styles.genderIconContainer, { backgroundColor: '#4A90E2' }]}>
                <User size={40} color={COLORS.white} />
              </View>
              <Text style={styles.genderLabel}>ذكر</Text>
              {gender === 'male' && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'female' && styles.selectedGenderOption]}
              onPress={() => handleGenderSelect('female')}
            >
              <View style={[styles.genderIconContainer, { backgroundColor: '#E91E63' }]}>
                <UserCheck size={40} color={COLORS.white} />
              </View>
              <Text style={styles.genderLabel}>أنثى</Text>
              {gender === 'female' && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalActions}>
            <Button
              title="إلغاء"
              onPress={() => setShowGenderModal(false)}
              type="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
  },
  iconContainer: {
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customImage: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 40,
    gap: 20,
  },
  genderOption: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.gray,
    flex: 1,
    position: 'relative',
  },
  selectedGenderOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  genderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  modalActions: {
    padding: 20,
    paddingTop: 0,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default ProfileIcon;