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
  reviewCount?: number;
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
  productId: number;
  product: Product;
  quantity: number;
}

export interface VetStore {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  products: Product[];
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export interface PoultryFarm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  totalBirds: number;
  batches: PoultryBatch[];
  address: string;
}

export interface PoultryBatch {
  id: string;
  farmId: string;
  batchNumber: number;
  birdType: string;
  initialCount: number;
  currentCount: number;
  dateStarted: string;
  expectedHarvestDate?: string;
}

export interface PoultryWeek {
  id: string;
  batchId: string;
  weekNumber: number; // رقم الأسبوع (1, 2, 3, ...)
  startDate: string;
  endDate: string;

  // Aggregated data from daily records
  days: PoultryDay[]; // الأيام المسجلة في هذا الأسبوع (1-7)

  // Summary statistics
  totalFeedConsumption: number; // إجمالي استهلاك العلف (كيلو)
  totalFeedCost: number; // إجمالي تكلفة العلف
  averageWeight: number; // متوسط الوزن للأسبوع (جرام)
  totalMortality: number; // إجمالي النفوق
  estimatedProfit: number; // الربح المقدر للأسبوع

  // Health summary
  healthStatus?: "excellent" | "good" | "fair" | "poor"; // الحالة الصحية العامة

  notes?: string; // ملاحظات الأسبوع
  createdAt: string;
  updatedAt?: string;
}

// ============== POULTRY DAY TYPES ==============

export interface PoultryDay {
  id: string;
  batchId: string;
  dayNumber: number; // رقم اليوم في الدفعة (1, 2, 3, ...)
  weekNumber?: number; // رقم الأسبوع (محسوب: Math.ceil(dayNumber / 7))
  date: string;

  // Environmental conditions
  temperature?: number; // درجة الحرارة (°C)
  humidity?: number; // الرطوبة (%)

  // Feed & water
  feedConsumption: number; // استهلاك العلف (كيلو)
  feedCost: number; // تكلفة العلف (د.ع)
  feedType?: string; // نوع العلف
  waterConsumption?: number; // الماء (لتر)

  // Weight tracking
  averageWeight: number; // متوسط الوزن (جرام)
  weightGain?: number; // الزيادة في الوزن عن اليوم السابق (جرام)

  // Activity
  activityLevel?: string; // الحركة والسلوك

  // Mortality tracking
  mortality: number; // عدد النفوق
  mortalityRate?: number; // معدل النفوق (%)
  mortalityReasons: string[]; // أسباب النفوق

  // Health and treatments
  treatments: Treatment[]; // العلاجات المستخدمة
  vaccinations: Vaccination[]; // التطعيمات
  healthObservations?: string[]; // ملاحظات صحية
  ventilation?: "poor" | "fair" | "good" | "excellent"; // التهوية

  // Financial
  estimatedProfit: number; // الربح المقدر لليوم
  dailyCosts?: number; // التكاليف اليومية الإضافية

  // General notes
  notes?: string; // ملاحظات اليوم
  recordedBy?: string; // من قام بالتسجيل (owner, supervisor, vet)

  createdAt: string;
  updatedAt?: string;
}

export interface TemperatureReading {
  morning?: number; // درجة الحرارة صباحاً (°C)
  afternoon?: number; // درجة الحرارة ظهراً (°C)
  evening?: number; // درجة الحرارة مساءً (°C)
  average?: number; // المتوسط (°C)
  min?: number; // الحد الأدنى (°C)
  max?: number; // الحد الأقصى (°C)
}

export interface Treatment {
  id: string;
  dayId: string;
  batchId: string;
  treatmentType: "medication" | "vitamin" | "vaccine" | "disinfectant" | "supplement" | "other";
  name: string; // اسم العلاج
  dosage: string; // الجرعة
  frequency: string; // التكرار (مرة واحدة، مرتين يومياً، إلخ)
  duration: number; // المدة (بالأيام)
  administeredBy: "owner" | "vet" | "supervisor" | "technician";
  administeredAt?: string; // وقت الإعطاء
  date: string;
  cost: number; // التكلفة
  reason: string; // السبب (علاج، وقاية، إلخ)
  effectiveness?: "excellent" | "good" | "fair" | "poor" | "none"; // الفعالية
  notes?: string;
  createdAt: string;
  updatedAt?: string;
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

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}
