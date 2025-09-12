import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, Role, Permission } from '../../../../types';

export interface UserPermissionsModalData {
  user?: User;
  availableRoles: Role[];
  availablePermissions: Permission[];
}

@Component({
  selector: 'app-user-permissions-modal',
  templateUrl: './user-permissions-modal.component.html',
  styleUrls: ['./user-permissions-modal.component.scss']
})
export class UserPermissionsModalComponent implements OnInit {

  userPermissionsForm: FormGroup;
  isLoading = false;
  isEditMode = false;

  availableRoles: Role[] = [];
  availablePermissions: Permission[] = [];
  selectedPermissions: Permission[] = [];
  selectedPermissionToAdd: Permission | null = null;
  searchTerm: string = '';
  filteredPermissions: Permission[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserPermissionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserPermissionsModalData
  ) {
    this.isEditMode = !!data?.user;
    this.availableRoles = data?.availableRoles || this.getDefaultRoles();
    this.availablePermissions = data?.availablePermissions || this.getDefaultPermissions();
    this.selectedPermissions = data?.user?.customPermissions || [];

    this.userPermissionsForm = this.fb.group({
      userId: [data?.user?.id || null],
      name: [data?.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [data?.user?.email || '', [Validators.required, Validators.email]],
      roleId: [data?.user?.roleId || null],
      selectedPermissionToAdd: [null],
      searchTerm: [''],
      isActive: [data?.user?.isActive ?? true]
    });

    this.updateFilteredPermissions();
  }

  ngOnInit(): void {
  }

  getDefaultRoles(): Role[] {

    




    return [
      { id: 1, name: 'Administrador', description: 'Acesso total ao sistema', permissions: [], isActive: true, createdAt: new Date().toISOString() },
      { id: 2, name: 'Editor', description: 'Pode editar documentos', permissions: [], isActive: true, createdAt: new Date().toISOString() },
      { id: 3, name: 'Visualizador', description: 'Somente visualização', permissions: [], isActive: true, createdAt: new Date().toISOString() },
      { id: 4, name: 'Operador', description: 'Operações básicas', permissions: [], isActive: true, createdAt: new Date().toISOString() }
    ];
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

  get availablePermissionsToAdd(): Permission[] {
    return this.filteredPermissions.filter(permission => 
      !this.selectedPermissions.some(selected => selected.id === permission.id)
    );
  }

  updateFilteredPermissions(): void {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredPermissions = [...this.availablePermissions];
    } else {
      this.filteredPermissions = this.availablePermissions.filter(permission => {
        const permissionName = permission.name.toLowerCase();
        const permissionDescription = permission.description?.toLowerCase() || '';
        const moduleName = this.getModuleDisplayName(permission.module).toLowerCase();
        const actionName = permission.action.toLowerCase();
        const resourceName = permission.resource.toLowerCase();
        
        return permissionName.includes(searchTerm) ||
               permissionDescription.includes(searchTerm) ||
               moduleName.includes(searchTerm) ||
               actionName.includes(searchTerm) ||
               resourceName.includes(searchTerm);
      });
    }
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.updateFilteredPermissions();
    
    // Só reseta a seleção se a permissão selecionada não estiver mais disponível
    const currentSelection = this.userPermissionsForm.get('selectedPermissionToAdd')?.value;
    if (currentSelection) {
      const isStillAvailable = this.availablePermissionsToAdd.some(p => p.id == currentSelection);
      if (!isStillAvailable) {
        this.userPermissionsForm.get('selectedPermissionToAdd')?.setValue(null);
      }
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.userPermissionsForm.get('searchTerm')?.setValue('');
    this.updateFilteredPermissions();
    this.userPermissionsForm.get('selectedPermissionToAdd')?.setValue(null);
  }

  highlightSearchTerm(text: string): string {
    if (!this.searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${this.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  getModuleDisplayName(module: string): string {
    const displayNames: { [key: string]: string } = {
      'documents': 'Documentos',
      'users': 'Usuários',
      'admin': 'Administração',
      'reports': 'Relatórios'
    };
    return displayNames[module] || module;
  }

  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'documents': 'description',
      'users': 'people',
      'admin': 'settings',
      'reports': 'assessment'
    };
    return icons[module] || 'circle';
  }

  addPermission(): void {
    const permissionId = this.userPermissionsForm.get('selectedPermissionToAdd')?.value;
    if (permissionId) {
      const permission = this.availablePermissions.find(p => p.id === permissionId);
      if (permission && !this.selectedPermissions.some(sp => sp.id === permission.id)) {
        this.selectedPermissions.push(permission);
        this.userPermissionsForm.get('selectedPermissionToAdd')?.setValue(null);
        this.updateFilteredPermissions(); // Atualiza a lista filtrada
        this.onCustomPermissionChange();
      }
    }
  }

  removePermission(permissionId: number): void {
    this.selectedPermissions = this.selectedPermissions.filter(p => p.id !== permissionId);
    this.updateFilteredPermissions(); // Atualiza a lista filtrada
    this.onCustomPermissionChange();
  }

  getPermissionDisplayName(permission: Permission): string {
    return `${this.getModuleDisplayName(permission.module)} - ${permission.name}`;
  }

  trackByPermissionId(index: number, permission: Permission): number {
    return permission.id;
  }

  onRoleChange(): void {
    const roleId = this.userPermissionsForm.get('roleId')?.value;
    if (roleId) {
      // Se uma role foi selecionada, limpar permissões customizadas e pesquisa
      this.selectedPermissions = [];
      this.clearSearch();
    }
  }

  onCustomPermissionChange(): void {
    const hasCustomPermissions = this.selectedPermissions.length > 0;
    if (hasCustomPermissions) {
      // Se permissões customizadas foram selecionadas, limpar role
      this.userPermissionsForm.get('roleId')?.setValue(null);
    }
  }

  onSubmit(): void {
    if (this.userPermissionsForm.valid) {
      this.isLoading = true;

      const formValue = this.userPermissionsForm.value;

      const userPermissions = {
        userId: formValue.userId,
        name: formValue.name,
        email: formValue.email,
        roleId: formValue.roleId,
        customPermissions: this.selectedPermissions.length > 0 ? this.selectedPermissions : undefined,
        isActive: formValue.isActive
      };

      // Simular operação assíncrona
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close({ 
          success: true, 
          data: userPermissions,
          message: this.isEditMode ? 
            'Permissões do usuário atualizadas com sucesso!' : 
            'Usuário criado com permissões definidas com sucesso!'
        });
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userPermissionsForm.controls).forEach(key => {
      const control = this.userPermissionsForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userPermissionsForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['email']) {
        return 'Digite um email válido';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.userPermissionsForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}