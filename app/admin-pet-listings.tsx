import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from 'expo-router';
import Button from "../components/Button";
import { Check, X, Eye, Clock, AlertCircle } from 'lucide-react-native';
import { trpc } from "../lib/trpc";

type ListingStatus = 'pending' | 'approved' | 'rejected';

export default function AdminPetListingsScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ListingStatus>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, refetch } = trpc.pets.listings.getAll.useQuery({
    isAdmin: true,
    status: selectedStatus,
  });

  const approveMutation = trpc.pets.listings.approve.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('نجح', 'تم الموافقة على القائمة بنجاح');
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message);
    },
  });

  const rejectMutation = trpc.pets.listings.reject.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert('نجح', 'تم رفض القائمة بنجاح');
    },
    onError: (error: any) => {
      Alert.alert('خطأ', error.message);
    },
  });

  const handleApprove = (listingId: number) => {
    Alert.alert(
      'تأكيد الموافقة',
      'هل أنت متأكد من الموافقة على هذه القائمة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'موافقة',
          onPress: () => approveMutation.mutate({ listingId }),
        },
      ]
    );
  };

  const handleReject = (listingId: number) => {
    Alert.prompt(
      'رفض القائمة',
      'يرجى إدخال سبب الرفض:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'رفض',
          onPress: (reason) => {
            if (reason && reason.trim()) {
              rejectMutation.mutate({
                listingId,
                rejectionReason: reason.trim(),
              });
            } else {
              Alert.alert('خطأ', 'يرجى إدخال سبب الرفض');
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getListingTypeText = (listingType: string) => {
    switch (listingType) {
      case 'adoption':
        return 'للتبني';
      case 'breeding':
        return 'للتزاوج';
      case 'lost':
        return 'مفقود';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'في الانتظار';
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير محدد';
    }
  };

  const renderStatusTabs = () => (
    <View style={styles.tabsContainer}>
      {(['pending', 'approved', 'rejected'] as ListingStatus[]).map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.tab,
            selectedStatus === status && styles.activeTab,
          ]}
          onPress={() => setSelectedStatus(status)}
        >
          <Text
            style={[
              styles.tabText,
              selectedStatus === status && styles.activeTabText,
            ]}
          >
            {getStatusText(status)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListingCard = (listing: any) => (
    <View key={listing.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: listing.image || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.petImage}
          />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{listing.name}</Text>
            <Text style={styles.petDetails}>
              {listing.type} • {getListingTypeText(listing.listingType)}
            </Text>
            <Text style={styles.ownerName}>المالك: {listing.ownerName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
          <Text style={styles.statusText}>{getStatusText(listing.status)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.location}>📍 {listing.location}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {listing.description}
        </Text>
        <Text style={styles.createdAt}>
          تاريخ الإرسال: {new Date(listing.createdAt).toLocaleDateString('ar-SA')}
        </Text>
      </View>

      {selectedStatus === 'pending' && (
        <View style={styles.cardActions}>
          <Button
            title="موافقة"
            onPress={() => handleApprove(listing.id)}
            type="primary"
            size="small"
            style={[styles.actionButton, styles.approveButton]}
            disabled={approveMutation.isPending}
          />
          <Button
            title="رفض"
            onPress={() => handleReject(listing.id)}
            type="secondary"
            size="small"
            style={[styles.actionButton, styles.rejectButton]}
            disabled={rejectMutation.isPending}
          />
        </View>
      )}

      {listing.status === 'rejected' && listing.rejectionReason && (
        <View style={styles.rejectionReason}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.rejectionText}>سبب الرفض: {listing.rejectionReason}</Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'إدارة قوائم الحيوانات',
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.container}>
        {renderStatusTabs()}

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {listings && listings.length > 0 ? (
            listings.map(renderListingCard)
          ) : (
            <View style={styles.emptyState}>
              <Clock size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyText}>
                لا توجد قوائم {getStatusText(selectedStatus)} حالياً
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'right',
  },
  petDetails: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 2,
    textAlign: 'right',
  },
  ownerName: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardContent: {
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'right',
  },
  createdAt: {
    fontSize: 12,
    color: COLORS.lightGray,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.lightGray,
    marginTop: 16,
    textAlign: 'center',
  },
});