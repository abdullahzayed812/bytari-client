import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useApp } from "../providers/AppProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { COLORS } from "../constants/colors";

export default function DebugSplashScreen() {
  const { hasSeenSplash, setHasSeenSplash, isAuthenticated } = useApp();

  const resetSplashState = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenSplash');
      setHasSeenSplash(false);
      Alert.alert('تم إعادة تعيين حالة الشاشة الترحيبية', 'يمكنك الآن رؤية الشاشة الترحيبية مرة أخرى');
    } catch (error) {
      console.error('Error resetting splash state:', error);
      Alert.alert('خطأ', 'فشل في إعادة تعيين حالة الشاشة الترحيبية');
    }
  };

  const goToSplash = () => {
    router.push('/splash');
  };

  const clearAllStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('تم مسح جميع البيانات', 'تم مسح جميع البيانات المحفوظة');
    } catch (error) {
      console.error('Error clearing storage:', error);
      Alert.alert('خطأ', 'فشل في مسح البيانات');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>أدوات تصحيح الشاشة الترحيبية</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>حالة الشاشة الترحيبية: {hasSeenSplash ? 'تم عرضها' : 'لم يتم عرضها'}</Text>
        <Text style={styles.infoText}>حالة المصادقة: {isAuthenticated ? 'مصادق عليه' : 'غير مصادق عليه'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={resetSplashState}>
        <Text style={styles.buttonText}>إعادة تعيين حالة الشاشة الترحيبية</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={goToSplash}>
        <Text style={styles.buttonText}>الذهاب إلى الشاشة الترحيبية</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearAllStorage}>
        <Text style={styles.buttonText}>مسح جميع البيانات المحفوظة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.black,
  },
  infoContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.black,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});