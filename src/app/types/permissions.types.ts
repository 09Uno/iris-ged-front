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

