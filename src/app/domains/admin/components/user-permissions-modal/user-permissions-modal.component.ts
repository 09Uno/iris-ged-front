import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../types/user.types';
import { Role, Permission } from '../../../../types/base.types';
import { UserManagementService } from '../../../../services/user-management.service';

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
    @Inject(MAT_DIALOG_DATA) public data: UserPermissionsModalData,
    private userManagementService: UserManagementService
  ) {
    this.isEditMode = !!data?.user;
    this.availableRoles = data?.availableRoles || [];
    this.availablePermissions = data?.availablePermissions || [];
    this.selectedPermissions = data?.user?.permissions || [];

    this.userPermissionsForm = this.fb.group({
      userId: [data?.user?.id || null],
      name: [data?.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [data?.user?.email || '', [Validators.required, Validators.email]],
      roleId: [data?.user?.role?.id || null],
      selectedPermissionToAdd: [null],
      searchTerm: [''],
      isActive: [data?.user?.isActive ?? true]
    });

    this.updateFilteredPermissions();
  }

  async ngOnInit(): Promise<void> {
    console.log('🔥 UserPermissionsModal: Iniciando...');
    await this.loadModalData();
  }

  private async loadModalData(): Promise<void> {
    try {
      console.log('📡 UserPermissionsModal: Carregando dados do modal...');

      // Se não temos dados passados, carregamos da API
      if (this.availableRoles.length === 0) {
        console.log('📡 UserPermissionsModal: Carregando roles da API...');
        const rolesObservable = await this.userManagementService.getAvailableRoles();
        rolesObservable.subscribe({
          next: (roles) => {
            console.log('✅ UserPermissionsModal: Roles carregadas:', roles);
            this.availableRoles = roles.map(role => ({
              id: role.id,
              name: role.name,
              description: role.description,
              permissions: [],
              isActive: true,
              createdAt: new Date().toISOString()
            }));
          },
          error: (error) => {
            console.error('❌ UserPermissionsModal: Erro ao carregar roles:', error);
          }
        });
      }

      if (this.availablePermissions.length === 0) {
        console.log('📡 UserPermissionsModal: Carregando permissões da API...');
        const permissionsObservable = await this.userManagementService.getAvailablePermissions();
        permissionsObservable.subscribe({
          next: (permissions) => {
            console.log('✅ UserPermissionsModal: Permissões carregadas:', permissions);
            this.availablePermissions = permissions.map(permission => ({
              id: permission.id,
              name: permission.name,
              code: permission.name,
              module: 'admin',
              action: 'access',
              resource: 'general',
              description: permission.description
            }));
            this.updateFilteredPermissions();
          },
          error: (error) => {
            console.error('❌ UserPermissionsModal: Erro ao carregar permissões:', error);
          }
        });
      } else {
        this.updateFilteredPermissions();
      }

    } catch (error) {
      console.error('❌ UserPermissionsModal: Erro ao carregar dados do modal:', error);
    }
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
    console.log('➕ addPermission: permissionId selecionado:', permissionId);
    console.log('➕ addPermission: tipo:', typeof permissionId);

    if (permissionId) {
      // Converter para number para garantir comparação correta
      const permissionIdNumber = typeof permissionId === 'string' ? parseInt(permissionId, 10) : permissionId;
      console.log('➕ addPermission: permissionIdNumber:', permissionIdNumber);
      console.log('➕ addPermission: availablePermissions:', this.availablePermissions);

      const permission = this.availablePermissions.find(p => p.id === permissionIdNumber);
      console.log('➕ addPermission: permissão encontrada:', permission);

      if (permission) {
        const alreadySelected = this.selectedPermissions.some(sp => sp.id === permission.id);
        console.log('➕ addPermission: já selecionada?', alreadySelected);

        if (!alreadySelected) {
          this.selectedPermissions.push(permission);
          console.log('✅ addPermission: permissão adicionada!', this.selectedPermissions);
          this.userPermissionsForm.get('selectedPermissionToAdd')?.setValue(null);
          this.updateFilteredPermissions();
          this.onCustomPermissionChange();
        } else {
          console.log('⚠️ addPermission: permissão já está na lista');
        }
      } else {
        console.log('❌ addPermission: permissão não encontrada no availablePermissions');
      }
    } else {
      console.log('❌ addPermission: permissionId é nulo ou vazio');
    }
  }

  removePermission(permissionId: number): void {
    this.selectedPermissions = this.selectedPermissions.filter(p => p.id !== permissionId);
    this.updateFilteredPermissions(); // Atualiza a lista filtrada
    this.onCustomPermissionChange();
  }

  getPermissionDisplayName(permission: Permission): string {
    return `${this.getModuleDisplayName(permission.description!)} - ${permission.name}`;
  }

  trackByPermissionId(index: number, permission: Permission): number {
    return permission.id;
  }

  async onRoleChange(): Promise<void> {
    console.log('🔄 UserPermissionsModal: onRoleChange chamado');
    const roleId = this.userPermissionsForm.get('roleId')?.value;
    console.log('🔄 UserPermissionsModal: roleId selecionado:', roleId);

    if (roleId) {
      // Converter roleId para number para garantir a comparação correta
      const roleIdNumber = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
      console.log('🔄 UserPermissionsModal: roleId original:', roleId, 'tipo:', typeof roleId);
      console.log('🔄 UserPermissionsModal: roleId convertido:', roleIdNumber, 'tipo:', typeof roleIdNumber);

      // Se uma role foi selecionada, carregar as permissões da role
      const selectedRole = this.availableRoles.find(role => role.id === roleIdNumber);
      console.log('🔄 UserPermissionsModal: role encontrada:', selectedRole);
      console.log('🔄 UserPermissionsModal: availableRoles:', this.availableRoles);

      if (selectedRole) {
        try {
          console.log('🔄 UserPermissionsModal: Buscando permissões para role ID:', roleIdNumber);
          // Buscar permissões da role selecionada
          const rolePermissionsObservable = await this.userManagementService.getRolePermissions(roleIdNumber);
          console.log('🔄 UserPermissionsModal: Observable obtido:', rolePermissionsObservable);

          rolePermissionsObservable.subscribe({
            next: (permissions: any[]) => {
              console.log('✅ UserPermissionsModal: Permissões da role recebidas:', permissions);
              console.log('✅ UserPermissionsModal: Tipo das permissões:', typeof permissions);
              console.log('✅ UserPermissionsModal: É array?', Array.isArray(permissions));
              console.log('✅ UserPermissionsModal: Quantidade:', permissions?.length);

              if (permissions && Array.isArray(permissions) && permissions.length > 0) {
                // Mapear do formato da API para o formato esperado pelo frontend
                this.selectedPermissions = permissions.map((p: any) => {
                  console.log('👤 UserPermissionsModal: Mapeando permissão:', p);
                  return {
                    id: p.Id || p.id,
                    name: p.Name || p.name,
                    code: p.Name || p.name,
                    module: 'general',
                    action: 'access',
                    resource: 'general',
                    description: p.Description || p.description || p.Name || p.name
                  };
                });
                console.log('✅ UserPermissionsModal: selectedPermissions atualizado:', this.selectedPermissions);
              } else {
                console.log('⚠️ UserPermissionsModal: Nenhuma permissão recebida ou array vazio');
                this.selectedPermissions = [];
              }

              this.clearSearch();
              this.updateFilteredPermissions();
            },
            error: (error: any) => {
              console.error('Erro ao carregar permissões da role:', error);
              // Se não conseguir carregar, apenas limpa as permissões
              this.selectedPermissions = [];
              this.clearSearch();
            }
          });
        } catch (error) {
          console.error('❌ UserPermissionsModal: Erro ao buscar permissões da role:', error);
          // Se não conseguir carregar, apenas limpa as permissões
          this.selectedPermissions = [];
          this.clearSearch();
        }
      } else {
        console.log('❌ UserPermissionsModal: Role não encontrada no availableRoles');
        this.selectedPermissions = [];
        this.clearSearch();
      }
    } else {
      // Se nenhuma role foi selecionada, limpar permissões
      console.log('🔄 UserPermissionsModal: Nenhuma role selecionada, limpando permissões');
      this.selectedPermissions = [];
      this.clearSearch();
    }
  }

  onCustomPermissionChange(): void {
    // Permissões customizadas são independentes da role
    // Não fazemos nada aqui - a role é mantida
  }

  onSubmit(): void {
    if (this.userPermissionsForm.valid) {
      this.isLoading = true;

      const formValue = this.userPermissionsForm.value;

      // Implementar operação real baseada no modo
      if (this.isEditMode) {
        // Editar usuário existente - formato para UpdateUserPermissionsDto
        const roleId = formValue.roleId;
        let roleIdNumber = null;

        // Converter roleId para número apenas se tiver valor válido
        if (roleId !== null && roleId !== undefined && roleId !== '') {
          roleIdNumber = typeof roleId === 'string' ? parseInt(roleId, 10) : roleId;
        }

        const updateDto: any = {
          UserId: formValue.userId,
          Name: formValue.name,
          Email: formValue.email,
          CustomPermissions: this.selectedPermissions.map(p => ({
            id: p.id,
            Code: p.code || p.name,
            Name: p.name,
            Module: p.module,
            Description: p.description || p.name
          })),
          IsActive: formValue.isActive
        };

        // Só adicionar RoleId se for um número válido
        if (roleIdNumber !== null && !isNaN(roleIdNumber) && roleIdNumber > 0) {
          updateDto.RoleId = roleIdNumber;
        }

        console.log('✏️ UserPermissionsModal: roleId original:', formValue.roleId);
        console.log('✏️ UserPermissionsModal: roleIdNumber convertido:', roleIdNumber);
        console.log('✏️ UserPermissionsModal: Payload completo sendo enviado:', JSON.stringify(updateDto, null, 2));
        this.userManagementService.updateUserPermissions(updateDto).then(observable => {
          observable.subscribe({
          next: (result) => {
            console.log('✅ UserPermissionsModal: Usuário editado com sucesso:', result);
            this.isLoading = false;
            this.dialogRef.close({
              success: true,
              data: updateDto,
              message: 'Permissões do usuário atualizadas com sucesso!'
            });
          },
          error: (error) => {
            console.error('❌ UserPermissionsModal: Erro ao editar usuário:', error);
            this.isLoading = false;
            this.dialogRef.close({
              success: false,
              message: 'Erro ao atualizar permissões do usuário: ' + (error.message || 'Erro desconhecido')
            });
          }
          });
        }).catch(error => {
          console.error('❌ UserPermissionsModal: Erro ao editar usuário:', error);
          this.isLoading = false;
          this.dialogRef.close({
            success: false,
            message: 'Erro ao atualizar permissões do usuário: ' + (error.message || 'Erro desconhecido')
          });
        });
      } else {
        // Criar novo usuário - formato para Partial<User>
        const newUser = {
          name: formValue.name,
          email: formValue.email,
          roleId: formValue.roleId,
          permissions: this.selectedPermissions,
          isActive: formValue.isActive
        };

        console.log('🆕 UserPermissionsModal: Criando usuário:', newUser);
        this.userManagementService.createUser(newUser).subscribe({
          next: (result) => {
            console.log('✅ UserPermissionsModal: Usuário criado com sucesso:', result);
            this.isLoading = false;
            this.dialogRef.close({
              success: true,
              data: newUser,
              message: 'Usuário criado com permissões definidas com sucesso!'
            });
          },
          error: (error) => {
            console.error('❌ UserPermissionsModal: Erro ao criar usuário:', error);
            this.isLoading = false;
            this.dialogRef.close({
              success: false,
              message: 'Erro ao criar usuário: ' + (error.message || 'Erro desconhecido')
            });
          }
        });
      }
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