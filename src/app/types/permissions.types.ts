import { Permission, Role } from './base.types';

// Re-export dos tipos base
export type { Role, Permission, User } from './base.types';


export interface GetDefaultRolesResponse {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
}

export interface GetDefaultPermissionsResponse {
    id: number;
    name: string;
    description: string;
    module: string;
    action: string;
    resource: string;
}

export interface PermissionToUpdateUserPermission {
    id: number;
    Code: string;
    Name: string;
    Module: string;
    Description: string;
}

export interface UpdateUserPermissionsDto {
    UserId: number;
    Email: string;
    Name: string;
    RoleId?: number | null;
    Permissions?: Permission[]; // Array de IDs de permissões
    CustomPermissions: PermissionToUpdateUserPermission[]; // Array de objetos com ID
    IsActive?: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role | null;
  permissions: Permission[];
}