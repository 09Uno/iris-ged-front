import { Permission, Role } from "./base.types";

export interface User {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  role?: Role;
  permissions: Permission[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: Date;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role?: Role;
  permissions: Permission[];
}

export interface CreateUserDto {
  name: string;
  email: string;
  roleId?: number;
  permissions?: number[];
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  roleId?: number;
  permissions?: number[];
  isActive?: boolean;
}

export interface UserMeDto {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
  };
  permissions: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

export interface GetPagedUsersParamsDto {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

export interface PagedUsersResponseDto {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  users: UserInfo[];
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    name: string;
    description: string;
  };
  permissions?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPermissionsDto {
  userId: number;
  email?: string;
  name?: string;
  roleId?: number | null;
  permissions?: number[];
  isActive?: boolean;
}

export interface PermissionToUpdateUserPermission {
  id: number;
  code: string;
  name: string;
  module: string;
  description: string;
}