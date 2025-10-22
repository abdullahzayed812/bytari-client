import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Address, Order } from "../types";
import Button from "../components/Button";
import { MapPin, CreditCard, Banknote, Plus, Check } from 'lucide-react-native';

export default function CheckoutScreen() {
  const { t } = useI18n();
  const { cart, user, addresses, createOrder, addAddress } = useApp();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    addresses.find(addr => addr.isDefault) || addresses[0] || null
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
  });

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      name: newAddress.name,
      phone: newAddress.phone,
      address: newAddress.address,
      isDefault: addresses.length === 0,
    };

    await addAddress(address);
    setSelectedAddress(address);
    setShowAddressForm(false);
    setNewAddress({ name: user?.name || '', phone: user?.phone || '', address: '' });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('خطأ', 'يرجى اختيار عنوان التوصيل');
      return;
    }

    if (!user) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      return;
    }

    const order: Order = {
      id: Date.now().toString(),
      userId: user.id,
      items: cart,
      total: getTotalPrice(),
      status: 'pending',
      paymentMethod,
      deliveryAddress: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      },
      createdAt: new Date().toISOString(),
    };

    await createOrder(order);
    
    Alert.alert(
      'تم تأكيد الطلب',
      'تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً لتأكيد التوصيل.',
      [
        {
          text: 'موافق',
          onPress: () => router.replace('/(tabs)'),
        }
      ]
    );
  };

  const renderAddressItem = (address: Address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressItem,
        selectedAddress?.id === address.id && styles.selectedAddressItem
      ]}
      onPress={() => setSelectedAddress(address)}
    >
      <View style={styles.addressInfo}>
        <Text style={styles.addressName}>{address.name}</Text>
        <Text style={styles.addressPhone}>{address.phone}</Text>
        <Text style={styles.addressText}>{address.address}</Text>
      </View>
      {selectedAddress?.id === address.id && (
        <Check size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  const renderPaymentMethod = (method: 'card' | 'cash', title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.paymentMethod,
        paymentMethod === method && styles.selectedPaymentMethod
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      <View style={styles.paymentInfo}>
        {icon}
        <Text style={styles.paymentTitle}>{title}</Text>
      </View>
      {paymentMethod === method && (
        <Check size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'إتمام الشراء', headerShown: true }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الطلب</Text>
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>عدد المنتجات:</Text>
              <Text style={styles.summaryValue}>{cart.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>المجموع الفرعي:</Text>
              <Text style={styles.summaryValue}>{getTotalPrice().toFixed(2)} ريال</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>رسوم التوصيل:</Text>
              <Text style={styles.summaryValue}>مجاني</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>المجموع الكلي:</Text>
              <Text style={styles.totalValue}>{getTotalPrice().toFixed(2)} ريال</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>عنوان التوصيل</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddressForm(true)}
            >
              <Plus size={20} color={COLORS.primary} />
              <Text style={styles.addButtonText}>إضافة عنوان</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 && !showAddressForm ? (
            <View style={styles.emptyState}>
              <MapPin size={40} color={COLORS.gray} />
              <Text style={styles.emptyStateText}>لا توجد عناوين محفوظة</Text>
              <Button
                title="إضافة عنوان جديد"
                onPress={() => setShowAddressForm(true)}
                type="outline"
                size="small"
              />
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map(renderAddressItem)}
            </View>
          )}

          {showAddressForm && (
            <View style={styles.addressForm}>
              <Text style={styles.formTitle}>إضافة عنوان جديد</Text>
              <TextInput
                style={styles.input}
                placeholder="الاسم"
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="رقم الهاتف"
                value={newAddress.phone}
                onChangeText={(text) => setNewAddress({ ...newAddress, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="العنوان التفصيلي"
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => router.push('/map-location?returnTo=checkout')}
              >
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.mapButtonText}>تحديد الموقع على الخريطة</Text>
              </TouchableOpacity>
              <View style={styles.formButtons}>
                <Button
                  title="إلغاء"
                  onPress={() => setShowAddressForm(false)}
                  type="outline"
                  size="small"
                  style={styles.formButton}
                />
                <Button
                  title="حفظ"
                  onPress={handleAddAddress}
                  type="primary"
                  size="small"
                  style={styles.formButton}
                />
              </View>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طريقة الدفع</Text>
          <View style={styles.paymentMethods}>
            {renderPaymentMethod(
              'cash',
              'الدفع عند الاستلام',
              <Banknote size={24} color={COLORS.primary} />
            )}
            {renderPaymentMethod(
              'card',
              'الدفع الإلكتروني',
              <CreditCard size={24} color={COLORS.primary} />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`تأكيد الطلب - ${getTotalPrice().toFixed(2)} ريال`}
          onPress={handlePlaceOrder}
          type="primary"
          style={styles.placeOrderButton}
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginVertical: 12,
  },
  addressList: {
    gap: 12,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedAddressItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  addressForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginBottom: 12,
  },
  mapButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    marginLeft: 12,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  placeOrderButton: {
    width: '100%',
  },
});