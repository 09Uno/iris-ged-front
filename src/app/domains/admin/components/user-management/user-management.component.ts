import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserPermissionsModalComponent } from '../user-permissions-modal/user-permissions-modal.component';
import { User, Role, Permission, UserSearchRequest } from '../../../../types';
import { MessageUtil } from '../../../../utils/message';
import { UserManagementService } from '../../../../services/user-management.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

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
  ) {
    this.loadInitialData();
  }

  ngOnInit(): void {
    this.searchUsers();
  }

  loadInitialData(): void {
    // Carregar roles disponíveis
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Erro ao carregar roles:', error);
        MessageUtil.displayErrorMessage(this, 'Erro ao carregar roles disponíveis');
      }
    });

    // Carregar permissões padrão
    this.availablePermissions = this.getDefaultPermissions();
  }

  getDefaultPermissions(): Permission[] {
    return [
      // Documentos
      { id: 1, name: 'Visualizar Documentos', module: 'documents', action: 'read', resource: 'document', description: 'Pode visualizar documentos' },
      { id: 2, name: 'Criar Documentos', module: 'documents', action: 'create', resource: 'document', description: 'Pode criar novos documentos' },
      { id: 3, name: 'Editar Documentos', module: 'documents', action: 'update', resource: 'document', description: 'Pode editar documentos existentes' },
      { id: 4, name: 'Excluir Documentos', module: 'documents', action: 'delete', resource: 'document', description: 'Pode excluir documentos' },
      
      // Usuários
      { id: 5, name: 'Visualizar Usuários', module: 'users', action: 'read', resource: 'user', description: 'Pode visualizar usuários' },
      { id: 6, name: 'Criar Usuários', module: 'users', action: 'create', resource: 'user', description: 'Pode criar novos usuários' },
      { id: 7, name: 'Editar Usuários', module: 'users', action: 'update', resource: 'user', description: 'Pode editar usuários existentes' },
      { id: 8, name: 'Excluir Usuários', module: 'users', action: 'delete', resource: 'user', description: 'Pode excluir usuários' },

      // Administração
      { id: 9, name: 'Configurar Sistema', module: 'admin', action: 'configure', resource: 'system', description: 'Pode configurar o sistema' },
      { id: 10, name: 'Visualizar Logs', module: 'admin', action: 'read', resource: 'logs', description: 'Pode visualizar logs do sistema' },
      { id: 11, name: 'Gerenciar Permissões', module: 'admin', action: 'manage', resource: 'permissions', description: 'Pode gerenciar permissões' },

      // Relatórios
      { id: 12, name: 'Gerar Relatórios', module: 'reports', action: 'generate', resource: 'report', description: 'Pode gerar relatórios' },
      { id: 13, name: 'Exportar Dados', module: 'reports', action: 'export', resource: 'data', description: 'Pode exportar dados' }
    ];
  }

  searchUsers(): void {
    this.isLoading = true;

    const request: UserSearchRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      roleId: this.selectedRole || undefined
    };

    this.userService.searchUsers(request).subscribe({
      next: (response) => {
        this.currentData = response.data;
        this.totalUsers = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
        this.hasNextPage = response.pagination.hasNextPage;
        this.hasPreviousPage = response.pagination.hasPreviousPage;
        
        // Atualizar estatísticas
        this.totalActiveUsers = response.filters.totalActiveUsers;
        this.totalInactiveUsers = response.filters.totalInactiveUsers;
        this.totalAdminUsers = response.filters.totalAdminUsers;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar usuários:', error);
        MessageUtil.displayErrorMessage(this, 'Erro ao carregar usuários');
        this.isLoading = false;
      }
    });
  }

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

  getPaginationInfo(): string {
    if (this.totalUsers === 0) {
      return 'Nenhum usuário encontrado';
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.currentData.length - 1, this.totalUsers);
    
    return `${startIndex}-${endIndex} de ${this.totalUsers} usuários`;
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.searchUsers();
  }

  onRoleFilterChange(roleId: string): void {
    this.selectedRole = roleId;
    this.currentPage = 1;
    this.searchUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.currentPage = 1;
    this.searchUsers();
  }

  createUser(): void {
    const dialogRef: MatDialogRef<UserPermissionsModalComponent> = this.dialog.open(
      UserPermissionsModalComponent,
      {
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
        data: {
          user: null, // Novo usuário
          availableRoles: this.availableRoles,
          availablePermissions: this.availablePermissions
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success === true) {
        this.userService.createUser(result.data).subscribe({
          next: (response) => {
            if (response.success) {
              MessageUtil.displaySuccessMessage(this, response.message);
              this.searchUsers(); // Recarregar dados
            } else {
              MessageUtil.displayErrorMessage(this, response.message);
            }
          },
          error: (error) => {
            console.error('Erro ao criar usuário:', error);
            MessageUtil.displayErrorMessage(this, 'Erro ao criar usuário');
          }
        });
      } else if (result?.success === false) {
        MessageUtil.displayErrorMessage(this, result.message);
      }
    });
  }

  editUser(user: User): void {
    const dialogRef: MatDialogRef<UserPermissionsModalComponent> = this.dialog.open(
      UserPermissionsModalComponent,
      {
        width: '900px',
        maxHeight: '90vh',
        disableClose: true,
        data: {
          user: user, // Usuário para edição
          availableRoles: this.availableRoles,
          availablePermissions: this.availablePermissions
        }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success === true) {
        this.userService.updateUser(user.id, result.data).subscribe({
          next: (response) => {
            if (response.success) {
              MessageUtil.displaySuccessMessage(this, response.message);
              this.searchUsers(); // Recarregar dados
            } else {
              MessageUtil.displayErrorMessage(this, response.message);
            }
          },
          error: (error) => {
            console.error('Erro ao atualizar usuário:', error);
            MessageUtil.displayErrorMessage(this, 'Erro ao atualizar usuário');
          }
        });
      } else if (result?.success === false) {
        MessageUtil.displayErrorMessage(this, result.message);
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).subscribe({
      next: (response) => {
        if (response.success) {
          MessageUtil.displaySuccessMessage(this, response.message);
          this.searchUsers(); // Recarregar dados
        } else {
          MessageUtil.displayErrorMessage(this, response.message);
        }
      },
      error: (error) => {
        console.error('Erro ao alterar status do usuário:', error);
        MessageUtil.displayErrorMessage(this, 'Erro ao alterar status do usuário');
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            MessageUtil.displaySuccessMessage(this, response.message);
            // Se estamos na última página e ela ficou vazia, voltar para a anterior
            if (this.currentData.length === 1 && this.currentPage > 1) {
              this.currentPage--;
            }
            this.searchUsers(); // Recarregar dados
          } else {
            MessageUtil.displayErrorMessage(this, response.message);
          }
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
          MessageUtil.displayErrorMessage(this, 'Erro ao excluir usuário');
        }
      });
    }
  }

  getUserPermissionsCount(user: User): number {
    if (user.customPermissions) {
      return user.customPermissions.length;
    }
    if (user.role) {
      return user.role.permissions?.length || 0;
    }
    return 0;
  }

  getUserPermissionsText(user: User): string {
    const count = this.getUserPermissionsCount(user);
    if (user.role) {
      return `${user.role.name} (${count} permissões)`;
    }
    if (user.customPermissions?.length) {
      return `Permissões específicas (${count})`;
    }
    return 'Nenhuma permissão';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
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