// Temporary empty exports to prevent import errors
// These will be replaced with real backend data as needed

export const mockClinics: any[] = [];
export const mockConsultations: any[] = [];
export const mockLostPets: any[] = [];
export const mockTips: any[] = [];
export const mockVetStores: any[] = [];
export const mockProducts: any[] = [];
export const mockVetArticles: any[] = [];
export const mockVetBooks: any[] = [];
export const mockPets: any[] = [];
export const mockVetProducts: any[] = [];
export const mockVetStoreProducts: any[] = [];
export const mockStoreNotifications: any[] = [];

// Type exports that some files might need
export interface VetStore {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface VetStoreProduct {
  id: string;
  name: string;
  price: number;
}

// Default export for compatibility
export default {
  mockClinics,
  mockConsultations,
  mockLostPets,
  mockTips,
  mockVetStores,
  mockProducts,
  mockVetArticles,
  mockVetBooks,
  mockPets,
  mockVetProducts,
  mockVetStoreProducts,
  mockStoreNotifications,
};
