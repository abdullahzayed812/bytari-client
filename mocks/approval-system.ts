// Mock data for approval system testing

export const mockApprovalRequests = [
  {
    id: '1',
    type: 'clinic',
    requesterId: 'user1',
    requesterName: 'د. أحمد محمد',
    title: 'طلب تفعيل عيادة الرحمة البيطرية',
    description: 'طلب تفعيل عيادة بيطرية في منطقة الكرادة',
    status: 'pending',
    createdAt: '2024-09-25T10:00:00Z',
    documents: [
      { id: '1', name: 'رخصة مهنة', url: '#' },
      { id: '2', name: 'شهادة الخبرة', url: '#' }
    ]
  },
  {
    id: '2', 
    type: 'veterinarian',
    requesterId: 'user2',
    requesterName: 'د. فاطمة علي',
    title: 'طلب تسجيل كطبيب بيطري',
    description: 'طلب تسجيل حساب طبيب بيطري مختص بجراحة الحيوانات الصغيرة',
    status: 'approved',
    createdAt: '2024-09-24T14:30:00Z',
    approvedAt: '2024-09-24T16:45:00Z',
    approvedBy: 'admin1',
    documents: [
      { id: '3', name: 'شهادة التخرج', url: '#' },
      { id: '4', name: 'هوية النقابة', url: '#' }
    ]
  },
  {
    id: '3',
    type: 'store',
    requesterId: 'user3', 
    requesterName: 'محمد سالم',
    title: 'طلب تفعيل متجر مستلزمات الطيور',
    description: 'طلب تفعيل متجر لبيع أغذية ومستلزمات الطيور المنزلية',
    status: 'rejected',
    createdAt: '2024-09-23T09:15:00Z',
    rejectedAt: '2024-09-23T11:30:00Z',
    rejectedBy: 'admin2',
    rejectionReason: 'الوثائق المطلوبة غير مكتملة',
    documents: [
      { id: '5', name: 'سجل تجاري', url: '#' }
    ]
  }
];

export const mockApprovalStats = {
  pending: 12,
  approved: 45,
  rejected: 8,
  total: 65
};

export const mockApprovalTypes = [
  { id: 'all', name: 'جميع الطلبات', count: 65 },
  { id: 'clinic', name: 'العيادات', count: 25 },
  { id: 'veterinarian', name: 'الأطباء', count: 18 },
  { id: 'store', name: 'المتاجر', count: 15 },
  { id: 'warehouse', name: 'المخازن', count: 7 }
];

export const mockPendingApprovals = mockApprovalRequests.filter(req => req.status === 'pending');
export const mockApprovedRequests = mockApprovalRequests.filter(req => req.status === 'approved');  
export const mockRejectedRequests = mockApprovalRequests.filter(req => req.status === 'rejected');

// Helper functions for approval system
export const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'approved': return '#4CAF50';
    case 'rejected': return '#F44336';
    default: return '#757575';
  }
};

export const getApprovalStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'قيد المراجعة';
    case 'approved': return 'تمت الموافقة';
    case 'rejected': return 'مرفوض';
    default: return 'غير محدد';
  }
};

export const getApprovalTypeIcon = (type: string) => {
  switch (type) {
    case 'clinic': return '🏥';
    case 'veterinarian': return '👨‍⚕️';
    case 'store': return '🏪';
    case 'warehouse': return '🏭';
    default: return '📋';
  }
};

// Function to simulate creating mock data (for testing)
export const createAllMockData = async () => {
  // Simulate API calls to create mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock approval data created successfully');
      resolve(mockApprovalRequests);
    }, 1000);
  });
};

export default {
  mockApprovalRequests,
  mockApprovalStats,
  mockApprovalTypes,
  mockPendingApprovals,
  mockApprovedRequests,
  mockRejectedRequests,
  getApprovalStatusColor,
  getApprovalStatusText,
  getApprovalTypeIcon,
  createAllMockData
};
