import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserPermissionsModalComponent, UserPermissionsModalData } from '../user-permissions-modal/user-permissions-modal.component';
import { User } from '../../../../types/user.types';
import { Role, Permission } from '../../../../types/base.types';
import { UserManagementService } from '../../../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  // Referência para Math (usado no template)
  Math = Math;

  // Propriedades de controle
  isLoading = false;
  searchTerm = '';
  selectedRole = '';

  // Propriedades de paginação
  currentPage = 1;
  pageSize = 6;
  totalUsers = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // Dados
  currentData: User[] = [];
  availableRoles: Role[] = [];
  availablePermissions: Permission[] = [];

  // Estatísticas
  totalActiveUsers = 0;
  totalInactiveUsers = 0;
  totalAdminUsers = 0;

  // Mensagens
  messages = {
    errorMessage: '',
    alertMessage: '',
    successMessage: ''
  };

  constructor(
    private dialog: MatDialog,
    private userService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.searchUsers();
  }

  async loadInitialData(): Promise<void> {
    try {
      // Carregar roles disponíveis
      const rolesObservable = await this.userService.getAvailableRoles();
      rolesObservable.subscribe({
        next: (roles) => {
          this.availableRoles = roles;
        },
        error: (error) => {
          console.error('Erro ao carregar roles:', error);
          this.messages.errorMessage = 'Erro ao carregar roles disponíveis';
        }
      });

      // Carregar permissões
      const permissionsObservable = await this.userService.getAvailablePermissions();
      permissionsObservable.subscribe({
        next: (permissions) => {
          this.availablePermissions = permissions;
        },
        error: (error) => {
          console.error('Erro ao carregar permissões:', error);
          this.messages.errorMessage = 'Erro ao carregar permissões disponíveis';
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  }

  async searchUsers(): Promise<void> {
    console.log('🔍 UserManagement: searchUsers iniciado');
    this.isLoading = true;
    this.clearMessages();

    try {
      const params = {
        pageNumber: this.currentPage - 1, // Converter de 1-based para 0-based
        pageSize: this.pageSize,
        searchTerm: this.searchTerm || undefined
      };

      console.log('🔍 UserManagement: Parâmetros:', params);
      const pagedUsersObservable = await this.userService.getPagedUsers(params);
      console.log('🔍 UserManagement: Observable obtido:', pagedUsersObservable);

      pagedUsersObservable.subscribe({
        next: (response) => {
          console.log('✅ UserManagement: Resposta recebida:', response);
          console.log('✅ UserManagement: Tipo da resposta:', typeof response);
          console.log('✅ UserManagement: Propriedades da resposta:', Object.keys(response || {}));

          // Verificar se a resposta tem a estrutura esperada
          if (!response) {
            console.error('❌ UserManagement: Resposta é null ou undefined');
            this.messages.errorMessage = 'Resposta da API é inválida';
            this.isLoading = false;
            return;
          }

          if (!response.users || !Array.isArray(response.users)) {
            console.error('❌ UserManagement: response.users não é um array:', response.users);
            this.messages.errorMessage = 'Formato de dados de usuários inválido';
            this.isLoading = false;
            return;
          }

          console.log('✅ UserManagement: Convertendo', response.users.length, 'usuários');

          // Converter UserInfo[] para User[] usando formato da API
          this.currentData = response.users.map((userInfo: any) => {
            console.log('👤 UserManagement: Processando usuário:', userInfo);
            return {
              id: userInfo.id,
              name: userInfo.name,
              email: userInfo.email,
              roleId: userInfo.role?.roleId,
              role: userInfo.role ? {
                id: userInfo.role.roleId,
                name: userInfo.role.roleName,
                description: `Role ${userInfo.role.roleName}`,
                permissions: [],
                isActive: true,
                createdAt: new Date().toISOString()
              } : undefined,
              permissions: userInfo.permissions || [],
              isActive: userInfo.isActive,
              createdAt: userInfo.createdAt || new Date().toISOString(),
              updatedAt: userInfo.updatedAt
            };
          });

          this.totalUsers = response.totalCount || 0;
          this.totalPages = response.totalPages || 1;
          this.hasNextPage = this.currentPage < this.totalPages;
          this.hasPreviousPage = this.currentPage > 1;

          // Calcular estatísticas dos usuários da página atual
          this.totalActiveUsers = this.currentData.filter(u => u.isActive).length;
          this.totalInactiveUsers = this.currentData.filter(u => !u.isActive).length;
          this.totalAdminUsers = this.currentData.filter(u => u.role?.name.toLowerCase().includes('admin')).length;

          console.log('✅ UserManagement: Dados processados:', {
            totalUsers: this.totalUsers,
            currentDataLength: this.currentData.length,
            totalPages: this.totalPages,
            activeUsers: this.totalActiveUsers,
            inactiveUsers: this.totalInactiveUsers,
            adminUsers: this.totalAdminUsers
          });

          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ UserManagement: Erro ao buscar usuários:', error);
          console.error('❌ UserManagement: Status do erro:', error?.status);
          console.error('❌ UserManagement: Mensagem do erro:', error?.message);
          console.error('❌ UserManagement: Erro completo:', error);

          if (error?.status === 401) {
            this.messages.errorMessage = 'Não autorizado - verifique seu login';
          } else if (error?.status === 403) {
            this.messages.errorMessage = 'Sem permissão para acessar usuários';
          } else if (error?.status === 404) {
            this.messages.errorMessage = 'Endpoint de usuários não encontrado';
          } else {
            this.messages.errorMessage = 'Erro ao carregar usuários: ' + (error?.message || 'Erro desconhecido');
          }

          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('❌ UserManagement: Erro no try/catch:', error);
      this.messages.errorMessage = 'Erro crítico ao carregar usuários: ' + (error as any)?.message;
      this.isLoading = false;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.searchUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.searchUsers();
  }

  clearMessages(): void {
    this.messages.errorMessage = '';
    this.messages.alertMessage = '';
    this.messages.successMessage = '';
  }

  createUser(): void {
    console.log('🆕 UserManagement: createUser chamado');
    console.log('🆕 UserManagement: availableRoles:', this.availableRoles);
    console.log('🆕 UserManagement: availablePermissions:', this.availablePermissions);

    const dialogRef = this.dialog.open(UserPermissionsModalComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        user: undefined,
        availableRoles: this.availableRoles,
        availablePermissions: this.availablePermissions
      } as UserPermissionsModalData
    });

    console.log('🆕 UserManagement: Modal aberto:', dialogRef);

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success === true) {
        this.messages.successMessage = 'Usuário criado com sucesso!';
        this.searchUsers();
      } else if (result?.success === false) {
        this.messages.errorMessage = result.message || 'Erro ao criar usuário';
      }
    });
  }

  editUser(user: User): void {
    console.log('✏️ UserManagement: editUser chamado para:', user.name);
    console.log('✏️ UserManagement: availableRoles:', this.availableRoles);
    console.log('✏️ UserManagement: availablePermissions:', this.availablePermissions);

    const dialogRef = this.dialog.open(UserPermissionsModalComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        user: user,
        availableRoles: this.availableRoles,
        availablePermissions: this.availablePermissions
      } as UserPermissionsModalData
    });

    console.log('✏️ UserManagement: Modal aberto:', dialogRef);

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success === true) {
        this.messages.successMessage = 'Usuário atualizado com sucesso!';
        this.searchUsers();
      } else if (result?.success === false) {
        this.messages.errorMessage = result.message || 'Erro ao atualizar usuário';
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'desativar' : 'ativar';
    const newStatus = !user.isActive;

    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.isActive = newStatus;
        this.messages.successMessage = `Usuário ${action}do com sucesso!`;
        this.searchUsers();
      },
      error: (error) => {
        console.error(`Erro ao ${action} usuário:`, error);
        this.messages.errorMessage = `Erro ao ${action} usuário`;
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.messages.successMessage = 'Usuário excluído com sucesso!';
          this.searchUsers();
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
          this.messages.errorMessage = 'Erro ao excluir usuário';
        }
      });
    }
  }

  // Métodos de paginação
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.searchUsers();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.searchUsers();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.searchUsers();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Métodos de utilidade
  getUserPermissionsText(user: User): string {
    if (user.role) {
      const count = user.permissions?.length || 0;
      return `${user.role.name} (${count} permissões)`;
    }
    if (user.permissions?.length) {
      return `Permissões específicas (${user.permissions.length})`;
    }
    return 'Nenhuma permissão';
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Ativo' : 'Inativo';
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  getActiveUsersCount(): number {
    return this.totalActiveUsers;
  }

  getInactiveUsersCount(): number {
    return this.totalInactiveUsers;
  }

  getAdminUsersCount(): number {
    return this.totalAdminUsers;
  }

}