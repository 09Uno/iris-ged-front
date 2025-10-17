import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserManagementService } from '../../../../services/user-management.service';
import { SectorService } from '../../../../services/sector/sector.service';
import { CreateUserManagementDto, UpdateUserManagementDto, UserManagementDto } from '../../../../types/user.types';
import { Sector } from '../../../../types/sector.types';
import { Role } from '../../../../types/base.types';

export interface UserFormModalData {
  user?: UserManagementDto; // Se fornecido, é edição
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-form-modal.component.html',
  styleUrls: ['./user-form-modal.component.scss']
})
export class UserFormModalComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  isLoadingSectors = false;
  isLoadingRoles = false;

  sectors: Sector[] = [];
  roles: Role[] = [];

  mode: 'create' | 'edit' = 'create';
  userId?: number;

  profiles = [
    { value: 'USUARIO', label: 'Usuário' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'GESTOR', label: 'Gestor' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormModalData,
    private userService: UserManagementService,
    private sectorService: SectorService
  ) {
    this.mode = data.mode;
    this.userId = data.user?.id;

    // Criar formulário
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: [''],
      position: [''],
      profile: ['USUARIO', [Validators.required]],
      sectorId: [null, [Validators.required]], // Setor é obrigatório
      roleId: [null],
      active: [true]
    });

    // Se for edição, preencher formulário
    if (this.mode === 'edit' && data.user) {
      this.populateForm(data.user);
      // Desabilitar email na edição
      this.userForm.get('email')?.disable();
    }
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadSectors(),
      this.loadRoles()
    ]);
  }

  private populateForm(user: UserManagementDto): void {
    this.userForm.patchValue({
      email: user.email,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      profile: user.profile,
      sectorId: user.sectorId,
      roleId: user.roles && user.roles.length > 0 ? user.roles[0].roleId : null,
      active: user.active
    });
  }

  async loadSectors(): Promise<void> {
    this.isLoadingSectors = true;
    try {
      const observable = await this.sectorService.getActiveSectors();
      observable.subscribe({
        next: (sectors: Sector[]) => {
          this.sectors = sectors;
          this.isLoadingSectors = false;
        },
        error: (error: any) => {
          console.error('Erro ao carregar setores:', error);
          this.isLoadingSectors = false;
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      this.isLoadingSectors = false;
    }
  }

  async loadRoles(): Promise<void> {
    this.isLoadingRoles = true;
    try {
      const observable = await this.userService.getAvailableRoles();
      observable.subscribe({
        next: (roles: Role[]) => {
          this.roles = roles;
          this.isLoadingRoles = false;
        },
        error: (error: any) => {
          console.error('Erro ao carregar roles:', error);
          this.isLoadingRoles = false;
        }
      });
    } catch (error) {
      console.error('Erro:', error);
      this.isLoadingRoles = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      if (this.mode === 'create') {
        await this.createUser();
      } else {
        await this.updateUser();
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      this.isLoading = false;
    }
  }

  private async createUser(): Promise<void> {
    const formValue = this.userForm.getRawValue();

    // Buscar nome do setor selecionado para usar como department
    const selectedSector = this.sectors.find(s => s.id === formValue.sectorId);
    const department = selectedSector ? selectedSector.name : '';

    const dto: CreateUserManagementDto = {
      objectId: crypto.randomUUID(), // GUID do Azure AD/sistema externo
      email: formValue.email,
      fullName: formValue.fullName,
      firstName: formValue.firstName,
      lastName: formValue.lastName || '',
      position: formValue.position || '',
      department: department, // Nome do setor como department
      profile: formValue.profile,
      sectorId: formValue.sectorId,
      roleId: formValue.roleId || 0
    };

    console.log('📤 Enviando DTO de criação:', JSON.stringify(dto, null, 2));

    const observable = await this.userService.createUserManagement(dto);
    observable.subscribe({
      next: (result) => {
        console.log('✅ Usuário criado com sucesso:', result);
        this.dialogRef.close({ success: true, data: result, message: 'Usuário criado com sucesso!' });
      },
      error: (error) => {
        console.error('❌ Erro ao criar usuário:', error);
        console.error('❌ Status:', error?.status);
        console.error('❌ Response:', error?.error);

        let errorMessage = 'Erro ao criar usuário';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.errors) {
          errorMessage = JSON.stringify(error.error.errors);
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.dialogRef.close({ success: false, message: errorMessage });
      }
    });
  }

  private async updateUser(): Promise<void> {
    if (!this.userId) {
      this.dialogRef.close({ success: false, message: 'ID do usuário não encontrado' });
      return;
    }

    const formValue = this.userForm.getRawValue();

    // Buscar nome do setor selecionado para usar como department
    const selectedSector = this.sectors.find(s => s.id === formValue.sectorId);
    const department = selectedSector ? selectedSector.name : '';

    const dto: UpdateUserManagementDto = {
      id: this.userId,
      fullName: formValue.fullName,
      firstName: formValue.firstName,
      lastName: formValue.lastName || '',
      position: formValue.position || '',
      department: department, // Nome do setor como department
      profile: formValue.profile,
      sectorId: formValue.sectorId,
      active: formValue.active
    };

    console.log('📤 Enviando DTO de atualização:', JSON.stringify(dto, null, 2));

    const observable = await this.userService.updateUserManagement(dto);
    observable.subscribe({
      next: (result) => {
        console.log('✅ Usuário atualizado com sucesso:', result);
        this.dialogRef.close({ success: true, data: result, message: 'Usuário atualizado com sucesso!' });
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar usuário:', error);
        console.error('❌ Status:', error?.status);
        console.error('❌ Response:', error?.error);

        let errorMessage = 'Erro ao atualizar usuário';
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.errors) {
          errorMessage = JSON.stringify(error.error.errors);
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.dialogRef.close({ success: false, message: errorMessage });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  get isFormValid(): boolean {
    return this.userForm.valid;
  }

  getTitle(): string {
    return this.mode === 'create' ? 'Criar Novo Usuário' : 'Editar Usuário';
  }

  getSubmitButtonText(): string {
    return this.mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações';
  }
}
