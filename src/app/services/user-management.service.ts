import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User, GetPagedUsersParamsDto, PagedUsersResponseDto, CreateUserManagementDto, UpdateUserManagementDto, GetUserManagementResponse } from '../types/user.types';
import { UpdateUserPermissionsDto } from '../types/permissions.types';
import { environment } from '@environments/environment';
import GedApiService from '../ged.api.service';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private gedApi: GedApiService) {}

  /**
   * Obtém usuários com paginação
   */
  async getPagedUsers(params: GetPagedUsersParamsDto): Promise<Observable<PagedUsersResponseDto>> {
    try {
      console.log('📡 UserManagementService: getPagedUsers chamado com:', params);
      const result = await this.gedApi.getPagedUsers(params);
      console.log('📡 UserManagementService: resultado do gedApi:', result);
      return result;
    } catch (error) {
      console.error('❌ UserManagementService: Erro ao buscar usuários paginados:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os usuários do sistema (usando paginação com tamanho grande)
   */
  async getAllUsers(): Promise<Observable<User[]>> {
    try {
      const params: GetPagedUsersParamsDto = {
        pageNumber: 1,
        pageSize: 100 // Busca muitos usuários para simular "todos"
      };

      const pagedUsersObservable = await this.gedApi.getPagedUsers(params);

      return pagedUsersObservable.pipe(
        map((response: PagedUsersResponseDto) => {
          // Converte UserInfo[] para User[]
          if (!response.users || !Array.isArray(response.users)) {
            return [];
          }
          return response.users.map((userInfo: any) => ({
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            roleId: userInfo.role?.id,
            role: userInfo.role ? {
              id: userInfo.role.id,
              name: userInfo.role.name,
              description: userInfo.role.description,
              permissions: [],
              isActive: true,
              createdAt: new Date().toISOString()
            } : undefined,
            permissions: userInfo.permissions || [],
            isActive: userInfo.isActive,
            createdAt: userInfo.createdAt || new Date().toISOString(),
            updatedAt: userInfo.updatedAt
          }));
        }),
        catchError(this.handleError)
      );
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Obtém um usuário específico por ID (v1/UserManagement/{id})
   */
  async getUserManagementById(id: number): Promise<Observable<GetUserManagementResponse>> {
    try {
      return await this.gedApi.getUserManagementById(id);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário (v1/UserManagement)
   */
  async createUserManagement(dto: CreateUserManagementDto): Promise<Observable<any>> {
    try {
      return await this.gedApi.createUserManagement(dto);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza um usuário existente (v1/UserManagement/{id})
   */
  async updateUserManagement(dto: UpdateUserManagementDto): Promise<Observable<any>> {
    try {
      return await this.gedApi.updateUserManagement(dto);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS LEGADOS (manter compatibilidade)
  // ========================================

  /**
   * Obtém um usuário específico por ID (método legado)
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cria um novo usuário (método legado)
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza um usuário existente (método legado)
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza o status de ativo/inativo de um usuário
   */
  updateUserStatus(id: number, isActive: boolean): Observable<any> {
    console.log('🔄 UserManagementService: updateUserStatus chamado - não implementado ainda');
    return new Observable(observer => {
      // Simular sucesso por enquanto
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }

  /**
   * Exclui um usuário
   */
  deleteUser(id: number): Observable<any> {
    console.log('🗑️ UserManagementService: deleteUser chamado - não implementado ainda');
    return new Observable(observer => {
      // Simular sucesso por enquanto
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 500);
    });
  }

  /**
   * Atualiza as permissões de um usuário
   */
  async updateUserPermissions(updateDto: UpdateUserPermissionsDto): Promise<Observable<any>> {
    try {
      return await this.gedApi.updateUserPermissions(updateDto);
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  }

  /**
   * Buscar roles disponíveis
   */
  async getAvailableRoles(): Promise<Observable<any[]>> {
    try {
      return await this.gedApi.GetDefaultRoles();
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw error;
    }
  }

  /**
   * Buscar permissões disponíveis
   */
  async getAvailablePermissions(): Promise<Observable<any[]>> {
    try {
      return await this.gedApi.GetAllPermissions();
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      throw error;
    }
  }


  /**
   * Obtém as permissões de um usuário específico
   */
  getUserPermissions(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/permissions`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca usuários por termo de pesquisa
   */
  searchUsers(searchTerm: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/search`, {
      params: { q: searchTerm }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtém usuários por função/role
   */
  getUsersByRole(roleId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/by-role/${roleId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtém as permissões de uma role específica
   */
  async getRolePermissions(roleId: number): Promise<Observable<any[]>> {
    try {
      return await this.gedApi.GetRolePermissions(roleId);
    } catch (error) {
      console.error('Erro ao buscar permissões da role:', error);
      throw error;
    }
  }

  /**
   * Valida se um email já está em uso
   */
  validateEmail(email: string, userId?: number): Observable<boolean> {
    const params: any = { email };
    if (userId) {
      params.excludeUserId = userId;
    }

    return this.http.get<{ available: boolean }>(`${this.apiUrl}/users/validate-email`, { params })
      .pipe(
        map(response => response.available),
        catchError(this.handleError)
      );
  }

  /**
   * Redefine a senha de um usuário
   */
  resetUserPassword(userId: number): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`${this.apiUrl}/users/${userId}/reset-password`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtém estatísticas dos usuários
   */
  getUserStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    byRole: { [roleName: string]: number };
  }> {
    return this.http.get<any>(`${this.apiUrl}/users/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Exporta lista de usuários para CSV
   */
  exportUsers(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users/export`, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv'
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Importa usuários a partir de arquivo CSV
   */
  importUsers(file: File): Observable<{
    success: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/users/import`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos fornecidos';
          break;
        case 401:
          errorMessage = 'Não autorizado para esta operação';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Usuário não encontrado';
          break;
        case 409:
          errorMessage = 'Conflito - Email já está em uso';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }

      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('UserManagementService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}