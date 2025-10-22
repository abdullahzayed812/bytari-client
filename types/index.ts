// Basic type definitions for the veterinary app

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType?: "pet_owner" | "veterinarian";
  veterinarianType?: "student" | "veterinarian";
  gender?: "male" | "female";
  licenseVerified?: boolean;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: "male" | "female";
  weight?: number;
  ownerId: string;
  imageUrl?: string;
  description?: string;
  vaccinations?: Vaccination[];
  medicalHistory?: MedicalRecord[];
}

export interface LostPet {
  id: string;
  petId: string;
  reporterId: string;
  location: string;
  dateReported: string;
  description: string;
  contactInfo: string;
  imageUrl?: string;
  status: "lost" | "found" | "reunited";
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  services: string[];
  workingHours: WorkingHours;
  rating?: number;
  imageUrl?: string;
  veterinarians?: User[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
  sellerId: string;
  storeId?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface VetStore {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  products: Product[];
  imageUrl?: string;
  rating?: number;
}

export interface PoultryFarm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  totalBirds: number;
  batches: PoultryBatch[];
}

export interface PoultryBatch {
  id: string;
  farmId: string;
  batchNumber: string;
  birdType: string;
  initialCount: number;
  currentCount: number;
  dateStarted: string;
  expectedHarvestDate?: string;
}

export interface PoultryFinancial {
  id: string;
  farmId: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  period: string;
}

export interface ProductionCycle {
  id: string;
  batchId: string;
  phase: "brooding" | "growing" | "finishing" | "harvested";
  startDate: string;
  endDate?: string;
  mortality: number;
  feedConsumption: number;
  weight: number;
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  veterinarian: string;
  nextDue?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  veterinarian: string;
  notes?: string;
}

export interface WorkingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export type NotificationType = "join_request" | "message" | "reminder";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
};

export type UserMode = "pet_owner" | "veterinarian";

export type FavoriteItem = {
  id: string;
  name: string;
  image?: string;
  price?: number;
  type?: "clinic" | "product" | "service"; // optional
};

export type Order = {
  id: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "pending" | "completed" | "cancelled" | "confirmed" | "preparing" | "shipped" | "delivered";
  date: string; // or use Date type
};
