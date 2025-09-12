import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User, Role, Permission, UserSearchRequest, UserSearchResponse } from '../types';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private mockUsers: User[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      roleId: 1,
      role: { id: 1, name: 'Administrador', description: 'Acesso total', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      lastLogin: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      roleId: 2,
      role: { id: 2, name: 'Editor', description: 'Pode editar documentos', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-10T09:15:00Z',
      lastLogin: '2024-01-19T16:45:00Z'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      roleId: undefined,
      customPermissions: [
        { id: 1, name: 'Visualizar Documentos', module: 'documents', action: 'read', resource: 'document', description: 'Pode visualizar documentos' },
        { id: 5, name: 'Visualizar Usuários', module: 'users', action: 'read', resource: 'user', description: 'Pode visualizar usuários' }
      ],
      isActive: false,
      createdAt: '2024-01-05T11:30:00Z',
      lastLogin: '2024-01-18T08:20:00Z'
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      email: 'ana.oliveira@empresa.com',
      roleId: 3,
      role: { id: 3, name: 'Visualizador', description: 'Somente visualização', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-12T15:20:00Z',
      lastLogin: '2024-01-21T10:15:00Z'
    },
    {
      id: 5,
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@empresa.com',
      roleId: 2,
      role: { id: 2, name: 'Editor', description: 'Pode editar documentos', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-08T13:45:00Z',
      lastLogin: '2024-01-22T09:10:00Z'
    },
    {
      id: 6,
      name: 'Lucia Almeida',
      email: 'lucia.almeida@empresa.com',
      roleId: 4,
      role: { id: 4, name: 'Operador', description: 'Operações básicas', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-20T16:30:00Z',
      lastLogin: '2024-01-23T11:25:00Z'
    },
    {
      id: 7,
      name: 'Roberto Lima',
      email: 'roberto.lima@empresa.com',
      roleId: 1,
      role: { id: 1, name: 'Administrador', description: 'Acesso total', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: false,
      createdAt: '2024-01-03T08:15:00Z',
      lastLogin: '2024-01-17T14:50:00Z'
    },
    {
      id: 8,
      name: 'Fernanda Silva',
      email: 'fernanda.silva@empresa.com',
      roleId: 3,
      role: { id: 3, name: 'Visualizador', description: 'Somente visualização', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-18T12:00:00Z',
      lastLogin: '2024-01-24T15:35:00Z'
    },
    {
      id: 9,
      name: 'Paulo Mendes',
      email: 'paulo.mendes@empresa.com',
      roleId: 4,
      role: { id: 4, name: 'Operador', description: 'Operações básicas', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: true,
      createdAt: '2024-01-14T10:20:00Z',
      lastLogin: '2024-01-25T08:45:00Z'
    },
    {
      id: 10,
      name: 'Isabel Costa',
      email: 'isabel.costa@empresa.com',
      roleId: 2,
      role: { id: 2, name: 'Editor', description: 'Pode editar documentos', permissions: [], isActive: true, createdAt: '2024-01-01' },
      isActive: false,
      createdAt: '2024-01-06T14:55:00Z',
      lastLogin: '2024-01-16T17:20:00Z'
    }
  ];

  private availableRoles: Role[] = [
    { id: 1, name: 'Administrador', description: 'Acesso total ao sistema', permissions: [], isActive: true, createdAt: '2024-01-01' },
    { id: 2, name: 'Editor', description: 'Pode editar documentos', permissions: [], isActive: true, createdAt: '2024-01-01' },
    { id: 3, name: 'Visualizador', description: 'Somente visualização', permissions: [], isActive: true, createdAt: '2024-01-01' },
    { id: 4, name: 'Operador', description: 'Operações básicas', permissions: [], isActive: true, createdAt: '2024-01-01' }
  ];

  constructor() { }

  searchUsers(request: UserSearchRequest): Observable<UserSearchResponse> {
    // Simular delay da API
    return of(this.processUserSearch(request)).pipe(delay(500));
  }

  private processUserSearch(request: UserSearchRequest): UserSearchResponse {
    let filteredUsers = [...this.mockUsers];

    // Aplicar filtros
    if (request.searchTerm?.trim()) {
      const searchLower = request.searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role?.name.toLowerCase().includes(searchLower)
      );
    }

    if (request.roleId) {
      filteredUsers = filteredUsers.filter(user => 
        user.roleId?.toString() === request.roleId ||
        (request.roleId === 'custom' && !user.roleId && user.customPermissions?.length)
      );
    }

    if (request.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === request.isActive);
    }

    // Aplicar ordenação (se especificada)
    if (request.sortBy) {
      filteredUsers.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (request.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'email':
            aValue = a.email;
            bValue = b.email;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'lastLogin':
            aValue = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
            bValue = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return request.sortOrder === 'DESC' ? 1 : -1;
        if (aValue > bValue) return request.sortOrder === 'DESC' ? -1 : 1;
        return 0;
      });
    }

    // Calcular paginação
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / request.pageSize);
    const startIndex = (request.page - 1) * request.pageSize;
    const endIndex = startIndex + request.pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Calcular estatísticas
    const totalActiveUsers = this.mockUsers.filter(u => u.isActive).length;
    const totalInactiveUsers = this.mockUsers.filter(u => !u.isActive).length;
    const totalAdminUsers = this.mockUsers.filter(u => u.role?.name === 'Administrador').length;

    return {
      data: paginatedUsers,
      pagination: {
        currentPage: request.page,
        pageSize: request.pageSize,
        totalItems: totalItems,
        totalPages: totalPages,
        hasNextPage: request.page < totalPages,
        hasPreviousPage: request.page > 1
      },
      success: true,
      message: `Encontrados ${totalItems} usuários`,
      filters: {
        totalActiveUsers,
        totalInactiveUsers,
        totalAdminUsers
      }
    };
  }

  getAllRoles(): Observable<Role[]> {
    return of([...this.availableRoles]).pipe(delay(300));
  }

  createUser(userData: Partial<User>): Observable<{ success: boolean; message: string; data?: User }> {
    const newUser: User = {
      id: Math.max(...this.mockUsers.map(u => u.id)) + 1,
      name: userData.name!,
      email: userData.email!,
      roleId: userData.roleId,
      role: userData.roleId ? this.availableRoles.find(r => r.id === userData.roleId) : undefined,
      customPermissions: userData.customPermissions || [],
      isActive: userData.isActive ?? true,
      createdAt: new Date().toISOString(),
      lastLogin: undefined
    };

    this.mockUsers.push(newUser);
    
    return of({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: newUser
    }).pipe(delay(400));
  }

  updateUser(userId: number, userData: Partial<User>): Observable<{ success: boolean; message: string; data?: User }> {
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return of({
        success: false,
        message: 'Usuário não encontrado!'
      }).pipe(delay(400));
    }

    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      ...userData,
      role: userData.roleId ? this.availableRoles.find(r => r.id === userData.roleId) : undefined
    };

    return of({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      data: this.mockUsers[userIndex]
    }).pipe(delay(400));
  }

  deleteUser(userId: number): Observable<{ success: boolean; message: string }> {
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return of({
        success: false,
        message: 'Usuário não encontrado!'
      }).pipe(delay(400));
    }

    const user = this.mockUsers[userIndex];
    this.mockUsers.splice(userIndex, 1);

    return of({
      success: true,
      message: `Usuário "${user.name}" excluído com sucesso!`
    }).pipe(delay(400));
  }

  toggleUserStatus(userId: number): Observable<{ success: boolean; message: string; data?: User }> {
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return of({
        success: false,
        message: 'Usuário não encontrado!'
      }).pipe(delay(400));
    }

    this.mockUsers[userIndex].isActive = !this.mockUsers[userIndex].isActive;
    const statusText = this.mockUsers[userIndex].isActive ? 'ativado' : 'desativado';

    return of({
      success: true,
      message: `Usuário ${statusText} com sucesso!`,
      data: this.mockUsers[userIndex]
    }).pipe(delay(400));
  }
}