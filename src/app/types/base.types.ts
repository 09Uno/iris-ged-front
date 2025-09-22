// Tipos fundamentais do sistema - base para outros módulos

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  id: number;
  name: string;
  code?: string; // Código opcional para identificação
  description?: string;
  module: string;
  action: string;
  resource: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  role?: Role;
  Permissions?: Permission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Interfaces para paginação
export interface PaginationRequest {
  page: number;
  pageSize: number;
  searchTerm?: string;
  roleId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  success: boolean;
  message?: string;
}

export interface UserSearchRequest extends PaginationRequest {
  roleId?: string;
  isActive?: boolean;
}

export interface UserSearchResponse extends PaginationResponse<User> {
  filters: {
    totalActiveUsers: number;
    totalInactiveUsers: number;
    totalAdminUsers: number;
  };
}