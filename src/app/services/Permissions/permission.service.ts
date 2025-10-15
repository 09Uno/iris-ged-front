import { Injectable } from "@angular/core";
import { Permission, Role } from "../../types/base.types";
import { UserProfile } from "../../types/permissions.types";
import GedApiService from "../../ged.api.service";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private currentUser$ = new BehaviorSubject<UserProfile | null>(null);
  private userPermissions: string[] = [];
  private userRole: Role | null = null;
  private permissionsLoaded = false;

  constructor(private gedApi: GedApiService) {
    this.loadFromSession();
  }

  async GetAllPermissions(): Promise<Observable<Permission[]>> {
    return this.gedApi.GetAllPermissions();
  }

  /**
   * Define o usuário atual e suas permissões
   */
  setCurrentUser(user: UserProfile): void {
    console.log('🔐 PermissionService: setCurrentUser chamado com:', user);
    this.currentUser$.next(user);
    this.userPermissions = user.permissions?.map(p => p.name || p.code).filter((p): p is string => !!p) || [];
    this.userRole = user.role;
    this.permissionsLoaded = true;

    // Salva na sessão
    this.saveToSession(user);

    console.log('🔐 PermissionService: Permissões carregadas:', this.userPermissions);
    console.log('🔐 PermissionService: Role carregada:', this.userRole);
    console.log('🔐 PermissionService: É admin?', this.isAdmin());
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUser$.value;
  }

  /**
   * Observable do usuário atual
   */
  getCurrentUser$(): Observable<UserProfile | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(permissionCode: string): boolean {
    if (!permissionCode) return false;
    return this.userPermissions.includes(permissionCode);
  }

  /**
   * Verifica se o usuário tem uma das permissões fornecidas
   */
  hasAnyPermission(permissionCodes: string[]): boolean {
    if (!permissionCodes || permissionCodes.length === 0) return false;
    return permissionCodes.some(code => this.hasPermission(code));
  }

  /**
   * Verifica se o usuário tem todas as permissões fornecidas
   */
  hasAllPermissions(permissionCodes: string[]): boolean {
    if (!permissionCodes || permissionCodes.length === 0) return false;
    return permissionCodes.every(code => this.hasPermission(code));
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole(roleName: string): boolean {
    if (!roleName || !this.userRole) return false;
    return this.userRole.name.toLowerCase() === roleName.toLowerCase();
  }

  /**
   * Verifica se o usuário tem uma das roles fornecidas
   */
  hasAnyRole(roleNames: string[]): boolean {
    if (!roleNames || roleNames.length === 0) return false;
    return roleNames.some(role => this.hasRole(role));
  }

  /**
   * Verifica se o usuário é administrador
   */
  isAdmin(): boolean {
    if (!this.userRole) return false;
    const roleName = this.userRole.name.toLowerCase();
    const adminRoles = ['admin', 'administrador'];
    return adminRoles.includes(roleName);
  }

  /**
   * Verifica se o usuário pode acessar a área administrativa
   */
  canAccessAdmin(): boolean {
    return this.isAdmin() || this.hasPermission('ACCESS_ADMIN') || this.hasAnyPermission(['MANAGE_USERS', 'MANAGE_PERMISSIONS', 'MANAGE_ROLES']);
  }

  /**
   * Verifica se o usuário pode gerenciar usuários
   */
  canManageUsers(): boolean {
    return this.hasPermission('MANAGE_USERS') || this.isAdmin();
  }

  /**
   * Verifica se o usuário pode gerenciar documentos
   */
  canManageDocuments(): boolean {
    return this.hasPermission('MANAGE_DOCUMENTS') || this.hasAnyPermission(['CREATE_DOCUMENT', 'UPDATE_DOCUMENT', 'DELETE_DOCUMENT']) || this.isAdmin();
  }

  /**
   * Verifica se o usuário pode fazer download de documentos
   */
  canDownloadDocuments(): boolean {
    return this.hasPermission('DOWNLOAD_DOCUMENTS') || this.hasPermission('VIEW_DOCUMENTS') || this.isAdmin();
  }

  /**
   * Limpa os dados do usuário atual
   */
  clearCurrentUser(): void {
    this.currentUser$.next(null);
    this.userPermissions = [];
    this.userRole = null;
    this.permissionsLoaded = false;

    // Remove da sessão
    sessionStorage.removeItem('userPermissions');
    sessionStorage.removeItem('userProfile');
  }

  /**
   * Obtém todas as permissões do usuário atual
   */
  getUserPermissions(): string[] {
    return [...this.userPermissions];
  }

  /**
   * Obtém a role do usuário atual
   */
  getUserRole(): Role | null {
    return this.userRole;
  }

  /**
   * Verifica se as permissões foram carregadas
   */
  arePermissionsLoaded(): boolean {
    return this.permissionsLoaded;
  }

  /**
   * Salva as permissões do usuário na sessão
   */
  private saveToSession(user: UserProfile): void {
    try {
      sessionStorage.setItem('userProfile', JSON.stringify(user));
      sessionStorage.setItem('userPermissions', JSON.stringify(this.userPermissions));
    } catch (error) {
      console.warn('🔐 PermissionService: Erro ao salvar na sessão:', error);
    }
  }

  /**
   * Carrega as permissões do usuário da sessão
   */
  private loadFromSession(): void {
    try {
      const userProfile = sessionStorage.getItem('userProfile');
      const userPermissions = sessionStorage.getItem('userPermissions');

      if (userProfile && userPermissions) {
        const user = JSON.parse(userProfile);
        this.userPermissions = JSON.parse(userPermissions);
        this.userRole = user.role;
        this.permissionsLoaded = true;
        this.currentUser$.next(user);

        console.log('🔐 PermissionService: Permissões carregadas da sessão:', this.userPermissions);
        console.log('🔐 PermissionService: Role carregada da sessão:', this.userRole);
      }
    } catch (error) {
      console.warn('🔐 PermissionService: Erro ao carregar da sessão:', error);
      this.clearCurrentUser();
    }
  }

  /**
   * Aguarda as permissões serem carregadas
   */
  waitForPermissions(): Promise<UserProfile | null> {
    return new Promise((resolve) => {
      if (this.permissionsLoaded) {
        resolve(this.getCurrentUser());
        return;
      }

      const subscription = this.currentUser$.subscribe((user) => {
        if (user && this.permissionsLoaded) {
          subscription.unsubscribe();
          resolve(user);
        }
      });

      // Timeout após 5 segundos
      setTimeout(() => {
        subscription.unsubscribe();
        resolve(null);
      }, 5000);
    });
  }
}