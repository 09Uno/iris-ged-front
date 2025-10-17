import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DocumentPermissionService } from '../../../../services/Permissions/document-permission.service';
import { SectorService } from '../../../../services/sector/sector.service';
import { UserManagementService } from '../../../../services/user-management.service';

import {
  DocumentPermissionsResponse,
  DocumentPersonalPermission,
  DocumentSectoralPermission,
  CreatePersonalPermissionDto,
  CreateSectoralPermissionDto
} from '../../../../types/permission.types';
import { Sector } from '../../../../types/sector.types';

@Component({
  selector: 'app-document-permissions-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './document-permissions-modal.component.html',
  styleUrls: ['./document-permissions-modal.component.scss']
})
export class DocumentPermissionsModalComponent implements OnInit {
  documentId: number;
  documentName: string = '';

  permissions: DocumentPermissionsResponse | null = null;
  sectors: Sector[] = [];
  users: any[] = []; // Lista de usuários disponíveis

  loading = false;
  error = '';

  // Formulário de nova permissão
  showAddPersonalForm = false;
  showAddSectoralForm = false;

  newPersonalPermission: CreatePersonalPermissionDto = {
    documentId: 0,
    userId: 0,
    canView: true,
    canEdit: false,
    canSign: false,
    canDelete: false,
    canDownload: true,
    canAddAttachment: false,
    canManageVersions: false,
    justificativa: '',
    validUntil: undefined
  };

  newSectoralPermission: CreateSectoralPermissionDto = {
    documentId: 0,
    sectorId: 0,
    canView: true,
    canEdit: false,
    canSign: false,
    canDelete: false,
    canDownload: true,
    canAddAttachment: false,
    canManageVersions: false,
    justificativa: '',
    validUntil: undefined
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { documentId: number; documentName?: string },
    private dialogRef: MatDialogRef<DocumentPermissionsModalComponent>,
    private permissionService: DocumentPermissionService,
    private sectorService: SectorService,
    private userService: UserManagementService
  ) {
    this.documentId = data.documentId;
    this.documentName = data.documentName || `Documento #${data.documentId}`;
  }

  async ngOnInit() {
    await this.loadPermissions();
    await this.loadSectors();
    await this.loadUsers();
  }

  async loadPermissions() {
    this.loading = true;
    try {
      const observable = await this.permissionService.getDocumentPermissions(this.documentId);
      observable.subscribe({
        next: (response) => {
          this.permissions = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading permissions:', error);
          this.error = 'Erro ao carregar permissões';
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.error = 'Erro ao carregar permissões';
      this.loading = false;
    }
  }

  async loadSectors() {
    try {
      const observable = await this.sectorService.getActiveSectors();
      observable.subscribe({
        next: (sectors) => {
          this.sectors = sectors;
        },
        error: (error) => {
          console.error('Error loading sectors:', error);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async loadUsers() {
    try {
      const observable = await this.userService.getPagedUsers({ pageNumber: 1, pageSize: 100 });
      observable.subscribe({
        next: (response) => {
          this.users = response.users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // ========================================
  // ADICIONAR PERMISSÕES
  // ========================================

  async addPersonalPermission() {
    if (!this.newPersonalPermission.userId) {
      alert('Selecione um usuário');
      return;
    }

    // ✅ Validação SEI: Justificativa obrigatória
    if (!this.newPersonalPermission.justificativa?.trim()) {
      alert('Justificativa é obrigatória (conforme modelo SEI)');
      return;
    }

    this.loading = true;
    this.newPersonalPermission.documentId = this.documentId;

    try {
      const observable = await this.permissionService.grantPersonalPermission(this.newPersonalPermission);
      observable.subscribe({
        next: () => {
          this.showAddPersonalForm = false;
          this.resetPersonalForm();
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Error adding permission:', error);
          alert('Erro ao adicionar permissão');
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.loading = false;
    }
  }

  async addSectoralPermission() {
    if (!this.newSectoralPermission.sectorId) {
      alert('Selecione um setor');
      return;
    }

    // ✅ Validação SEI: Justificativa obrigatória
    if (!this.newSectoralPermission.justificativa?.trim()) {
      alert('Justificativa é obrigatória (conforme modelo SEI)');
      return;
    }

    this.loading = true;
    this.newSectoralPermission.documentId = this.documentId;

    try {
      const observable = await this.permissionService.grantSectoralPermission(this.newSectoralPermission);
      observable.subscribe({
        next: () => {
          this.showAddSectoralForm = false;
          this.resetSectoralForm();
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Error adding permission:', error);
          alert('Erro ao adicionar permissão setorial');
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.loading = false;
    }
  }

  // ========================================
  // REVOGAR PERMISSÕES
  // ========================================

  async revokePersonalPermission(permissionId: number) {
    if (!confirm('Deseja realmente revogar esta permissão?')) {
      return;
    }

    try {
      const observable = await this.permissionService.revokePersonalPermission(permissionId);
      observable.subscribe({
        next: () => {
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Error revoking permission:', error);
          alert('Erro ao revogar permissão');
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async revokeSectoralPermission(permissionId: number) {
    if (!confirm('Deseja realmente revogar esta permissão setorial?')) {
      return;
    }

    try {
      const observable = await this.permissionService.revokeSectoralPermission(permissionId);
      observable.subscribe({
        next: () => {
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Error revoking sectoral permission:', error);
          alert('Erro ao revogar permissão setorial');
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // ========================================
  // UTILITÁRIOS
  // ========================================

  resetPersonalForm() {
    this.newPersonalPermission = {
      documentId: this.documentId,
      userId: 0,
      canView: true,
      canEdit: false,
      canSign: false,
      canDelete: false,
      canDownload: true,
      canAddAttachment: false,
      canManageVersions: false,
      justificativa: '',
      validUntil: undefined
    };
  }

  resetSectoralForm() {
    this.newSectoralPermission = {
      documentId: this.documentId,
      sectorId: 0,
      canView: true,
      canEdit: false,
      canSign: false,
      canDelete: false,
      canDownload: true,
      canAddAttachment: false,
      canManageVersions: false,
      justificativa: '',
      validUntil: undefined
    };
  }

  close() {
    this.dialogRef.close();
  }
}
