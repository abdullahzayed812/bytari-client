// Permissions utility for veterinary app

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
}

// Available permissions in the system
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  BAN_USERS: 'ban_users',
  DELETE_USERS: 'delete_users',

  // Pet management
  MANAGE_PETS: 'manage_pets',
  APPROVE_PETS: 'approve_pets',
  VIEW_ALL_PETS: 'view_all_pets',

  // Clinic management
  MANAGE_CLINICS: 'manage_clinics',
  APPROVE_CLINICS: 'approve_clinics',
  VIEW_ALL_CLINICS: 'view_all_clinics',

  // Store management
  MANAGE_STORES: 'manage_stores',
  APPROVE_STORES: 'approve_stores',
  VIEW_ALL_STORES: 'view_all_stores',

  // Content management
  MANAGE_CONTENT: 'manage_content',
  CREATE_ARTICLES: 'create_articles',
  EDIT_ARTICLES: 'edit_articles',
  DELETE_ARTICLES: 'delete_articles',

  // Field supervision
  ASSIGN_SUPERVISORS: 'assign_supervisors',
  MANAGE_FIELD_ASSIGNMENTS: 'manage_field_assignments',
  VIEW_FIELD_REPORTS: 'view_field_reports',

  // Admin functions
  ADMIN_ACCESS: 'admin_access',
  SUPER_ADMIN: 'super_admin',
  MODERATOR_ACCESS: 'moderator_access',

  // Approvals
  APPROVE_REGISTRATIONS: 'approve_registrations',
  REJECT_REGISTRATIONS: 'reject_registrations',
  VIEW_PENDING_APPROVALS: 'view_pending_approvals',

  // System settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
} as const;

// Available roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  MODERATOR: 'moderator',
  FIELD_SUPERVISOR: 'field_supervisor',
  VETERINARIAN: 'veterinarian',
  CLINIC_OWNER: 'clinic_owner',
  STORE_OWNER: 'store_owner',
  USER: 'user',
} as const;

// Role definitions with their permissions
export const rolePermissions: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_PETS,
    PERMISSIONS.APPROVE_PETS,
    PERMISSIONS.MANAGE_CLINICS,
    PERMISSIONS.APPROVE_CLINICS,
    PERMISSIONS.MANAGE_STORES,
    PERMISSIONS.APPROVE_STORES,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.APPROVE_REGISTRATIONS,
    PERMISSIONS.REJECT_REGISTRATIONS,
    PERMISSIONS.VIEW_PENDING_APPROVALS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.CREATE_ARTICLES,
    PERMISSIONS.EDIT_ARTICLES,
    PERMISSIONS.MODERATOR_ACCESS,
    PERMISSIONS.VIEW_PENDING_APPROVALS,
  ],
  [ROLES.FIELD_SUPERVISOR]: [
    PERMISSIONS.VIEW_FIELD_REPORTS,
    PERMISSIONS.MANAGE_FIELD_ASSIGNMENTS,
  ],
  [ROLES.VETERINARIAN]: [
    PERMISSIONS.VIEW_ALL_PETS,
    PERMISSIONS.CREATE_ARTICLES,
  ],
  [ROLES.CLINIC_OWNER]: [
    PERMISSIONS.MANAGE_CLINICS,
  ],
  [ROLES.STORE_OWNER]: [
    PERMISSIONS.MANAGE_STORES,
  ],
  [ROLES.USER]: [],
};

// Permission checking functions
export const hasPermission = (userPermissions: UserPermissions, permission: string): boolean => {
  if (userPermissions.isSuperAdmin) return true;
  
  // Check direct permissions
  if (userPermissions.permissions.includes(permission)) return true;
  
  // Check role-based permissions
  for (const roleId of userPermissions.roles) {
    if (rolePermissions[roleId]?.includes(permission)) {
      return true;
    }
  }
  
  return false;
};

export const hasAnyPermission = (userPermissions: UserPermissions, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userPermissions, permission));
};

export const hasAllPermissions = (userPermissions: UserPermissions, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userPermissions, permission));
};

export const hasRole = (userPermissions: UserPermissions, role: string): boolean => {
  if (userPermissions.isSuperAdmin) return true;
  return userPermissions.roles.includes(role);
};

export const isAdmin = (userPermissions: UserPermissions): boolean => {
  return userPermissions.isAdmin || userPermissions.isSuperAdmin || hasRole(userPermissions, ROLES.ADMIN);
};

export const isModerator = (userPermissions: UserPermissions): boolean => {
  return userPermissions.isModerator || isAdmin(userPermissions) || hasRole(userPermissions, ROLES.MODERATOR);
};

export const canManageUsers = (userPermissions: UserPermissions): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_USERS);
};

export const canApproveRegistrations = (userPermissions: UserPermissions): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.APPROVE_REGISTRATIONS);
};

export const canManageFieldAssignments = (userPermissions: UserPermissions): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.MANAGE_FIELD_ASSIGNMENTS) || 
         hasPermission(userPermissions, PERMISSIONS.ASSIGN_SUPERVISORS);
};

export const canViewAnalytics = (userPermissions: UserPermissions): boolean => {
  return hasPermission(userPermissions, PERMISSIONS.VIEW_ANALYTICS);
};

// Get user permissions from user object
export const getUserPermissions = (user: any): UserPermissions => {
  return {
    userId: user?.id || '',
    roles: user?.roles || [],
    permissions: user?.permissions || [],
    isAdmin: user?.isAdmin || false,
    isSuperAdmin: user?.isSuperAdmin || false,
    isModerator: user?.isModerator || false,
  };
};

// Permission labels for UI
export const getPermissionLabel = (permission: string): string => {
  const labels: Record<string, string> = {
    [PERMISSIONS.MANAGE_USERS]: 'إدارة المستخدمين',
    [PERMISSIONS.VIEW_USERS]: 'عرض المستخدمين',
    [PERMISSIONS.BAN_USERS]: 'حظر المستخدمين',
    [PERMISSIONS.DELETE_USERS]: 'حذف المستخدمين',
    [PERMISSIONS.MANAGE_PETS]: 'إدارة الحيوانات',
    [PERMISSIONS.APPROVE_PETS]: 'الموافقة على الحيوانات',
    [PERMISSIONS.VIEW_ALL_PETS]: 'عرض جميع الحيوانات',
    [PERMISSIONS.MANAGE_CLINICS]: 'إدارة العيادات',
    [PERMISSIONS.APPROVE_CLINICS]: 'الموافقة على العيادات',
    [PERMISSIONS.VIEW_ALL_CLINICS]: 'عرض جميع العيادات',
    [PERMISSIONS.MANAGE_STORES]: 'إدارة المتاجر',
    [PERMISSIONS.APPROVE_STORES]: 'الموافقة على المتاجر',
    [PERMISSIONS.VIEW_ALL_STORES]: 'عرض جميع المتاجر',
    [PERMISSIONS.MANAGE_CONTENT]: 'إدارة المحتوى',
    [PERMISSIONS.CREATE_ARTICLES]: 'إنشاء المقالات',
    [PERMISSIONS.EDIT_ARTICLES]: 'تعديل المقالات',
    [PERMISSIONS.DELETE_ARTICLES]: 'حذف المقالات',
    [PERMISSIONS.ASSIGN_SUPERVISORS]: 'تعيين المشرفين',
    [PERMISSIONS.MANAGE_FIELD_ASSIGNMENTS]: 'إدارة تعيينات الحقل',
    [PERMISSIONS.VIEW_FIELD_REPORTS]: 'عرض تقارير الحقل',
    [PERMISSIONS.ADMIN_ACCESS]: 'الوصول للإدارة',
    [PERMISSIONS.SUPER_ADMIN]: 'الإدارة العليا',
    [PERMISSIONS.MODERATOR_ACCESS]: 'الوصول للإشراف',
    [PERMISSIONS.APPROVE_REGISTRATIONS]: 'الموافقة على التسجيلات',
    [PERMISSIONS.REJECT_REGISTRATIONS]: 'رفض التسجيلات',
    [PERMISSIONS.VIEW_PENDING_APPROVALS]: 'عرض الطلبات المعلقة',
    [PERMISSIONS.MANAGE_SETTINGS]: 'إدارة الإعدادات',
    [PERMISSIONS.VIEW_ANALYTICS]: 'عرض التحليلات',
    [PERMISSIONS.EXPORT_DATA]: 'تصدير البيانات',
  };
  
  return labels[permission] || permission;
};

// Role labels for UI
export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    [ROLES.SUPER_ADMIN]: 'الإدارة العليا',
    [ROLES.ADMIN]: 'مدير',
    [ROLES.MODERATOR]: 'مشرف',
    [ROLES.FIELD_SUPERVISOR]: 'مشرف حقلي',
    [ROLES.VETERINARIAN]: 'طبيب بيطري',
    [ROLES.CLINIC_OWNER]: 'صاحب عيادة',
    [ROLES.STORE_OWNER]: 'صاحب متجر',
    [ROLES.USER]: 'مستخدم',
  };
  
  return labels[role] || role;
};

// Additional exports that might be imported by other files
export const permissionManager = {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  isAdmin,
  isModerator,
  canManageUsers,
  canApproveRegistrations,
  canManageFieldAssignments,
  canViewAnalytics,
  getUserPermissions,
};

// Hook for using permissions in components
export const usePermissions = (user?: any) => {
  const userPermissions = getUserPermissions(user);
  
  return {
    ...userPermissions,
    hasPermission: (permission: string) => hasPermission(userPermissions, permission),
    hasRole: (role: string) => hasRole(userPermissions, role),
    isAdmin: () => isAdmin(userPermissions),
    isModerator: () => isModerator(userPermissions),
    canManageUsers: () => canManageUsers(userPermissions),
    canApproveRegistrations: () => canApproveRegistrations(userPermissions),
    canManageFieldAssignments: () => canManageFieldAssignments(userPermissions),
    canViewAnalytics: () => canViewAnalytics(userPermissions),
  };
};

// Specific permission sets for different roles
export const MODERATOR_PERMISSIONS = rolePermissions[ROLES.MODERATOR];
export const ADMIN_PERMISSIONS = rolePermissions[ROLES.ADMIN];
export const FIELD_SUPERVISOR_PERMISSIONS = rolePermissions[ROLES.FIELD_SUPERVISOR];

// Type aliases for compatibility
export type User = UserPermissions & {
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
};

export default {
  PERMISSIONS,
  ROLES,
  rolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  isAdmin,
  isModerator,
  canManageUsers,
  canApproveRegistrations,
  canManageFieldAssignments,
  canViewAnalytics,
  getUserPermissions,
  getPermissionLabel,
  getRoleLabel,
  permissionManager,
  usePermissions,
  MODERATOR_PERMISSIONS,
  ADMIN_PERMISSIONS,
  FIELD_SUPERVISOR_PERMISSIONS,
};
