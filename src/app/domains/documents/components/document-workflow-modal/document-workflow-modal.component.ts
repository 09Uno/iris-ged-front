import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { WorkflowService } from '../../../../services/workflow/workflow.service';
import { SectorService } from '../../../../services/sector/sector.service';
import { Workflow, CreateWorkflowDto } from '../../../../types/workflow.types';
import { Sector } from '../../../../types/sector.types';

@Component({
  selector: 'app-document-workflow-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './document-workflow-modal.component.html',
  styleUrls: ['./document-workflow-modal.component.scss']
})
export class DocumentWorkflowModalComponent implements OnInit {
  documentId: number;
  documentName: string = '';
  currentUserId: number = 0;

  sectors: Sector[] = [];
  workflows: Workflow[] = [];
  pendingWorkflows: Workflow[] = [];

  loading = false;
  error = '';
  activeTab: 'new' | 'history' = 'new';

  // Formulário de nova tramitação
  newWorkflow: CreateWorkflowDto = {
    documentId: 0,
    originDepartment: '',
    destinationDepartment: '',
    originSectorId: undefined,
    destinationSectorId: 0,
    sendingUserId: 0,
    memo: ''
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      documentId: number;
      documentName?: string;
      currentUserId?: number;
    },
    private dialogRef: MatDialogRef<DocumentWorkflowModalComponent>,
    private workflowService: WorkflowService,
    private sectorService: SectorService,
    private cdr: ChangeDetectorRef
  ) {
    this.documentId = data.documentId;
    this.documentName = data.documentName || `Documento #${data.documentId}`;
    this.currentUserId = data.currentUserId || 0;

    this.newWorkflow.documentId = this.documentId;
    this.newWorkflow.sendingUserId = this.currentUserId;
  }

  async ngOnInit() {
    await this.loadSectors();
    await this.loadWorkflows();
  }

  async loadSectors() {
    try {
      const observable = await this.sectorService.getActiveSectors();
      observable.subscribe({
        next: (sectors: Sector[]) => {
          console.log('✅ Setores recebidos:', sectors);
          console.log('📊 Tipo dos setores:', typeof sectors);
          console.log('🔢 É array?', Array.isArray(sectors));
          console.log('📏 Quantidade:', sectors?.length);
          this.sectors = sectors;
          console.log('💾 this.sectors após atribuição:', this.sectors);
          console.log('📦 Primeiro setor:', this.sectors[0]);

          // Forçar detecção de mudanças
          this.cdr.detectChanges();
          console.log('🔄 detectChanges() chamado');
        },
        error: (error: any) => {
          console.error('❌ Error loading sectors:', error);
        }
      });
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  async loadWorkflows() {
    this.loading = true;
    try {
      const observable = await this.workflowService.getDocumentHistory(this.documentId);
      observable.subscribe({
        next: (workflows: Workflow[]) => {
          this.workflows = workflows;
          this.pendingWorkflows = workflows.filter((w: Workflow) => !w.completed);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading workflows:', error);
          this.error = 'Erro ao carregar histórico de tramitação';
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.error = 'Erro ao carregar histórico de tramitação';
      this.loading = false;
    }
  }

  async submitWorkflow() {
    if (!this.newWorkflow.destinationSectorId) {
      alert('Selecione o setor de destino');
      return;
    }

    // Pegar nome do setor de destino
    const destSector = this.sectors.find(s => s.id === this.newWorkflow.destinationSectorId);
    if (destSector) {
      this.newWorkflow.destinationDepartment = destSector.name;
    }

    // Se tiver setor de origem selecionado, pegar o nome
    if (this.newWorkflow.originSectorId) {
      const originSector = this.sectors.find(s => s.id === this.newWorkflow.originSectorId);
      if (originSector) {
        this.newWorkflow.originDepartment = originSector.name;
      }
    } else {
      this.newWorkflow.originDepartment = 'Não especificado';
    }

    this.loading = true;

    try {
      const observable = await this.workflowService.forwardDocument(this.newWorkflow);
      observable.subscribe({
        next: () => {
          alert('Documento tramitado com sucesso!');
          this.resetForm();
          this.loadWorkflows();
          this.activeTab = 'history';
        },
        error: (error: any) => {
          console.error('Error forwarding document:', error);
          alert('Erro ao tramitar documento');
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.loading = false;
    }
  }

  async completeWorkflow(workflowId: number) {
    if (!confirm('Deseja finalizar esta tramitação?')) {
      return;
    }

    try {
      const observable = await this.workflowService.completeWorkflow(
        workflowId,
        {
          workflowId: workflowId,
          receivingUserId: this.currentUserId,
          notes: 'Tramitação finalizada'
        }
      );
      observable.subscribe({
        next: () => {
          this.loadWorkflows();
        },
        error: (error: any) => {
          console.error('Error completing workflow:', error);
          alert('Erro ao finalizar tramitação');
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  resetForm() {
    this.newWorkflow = {
      documentId: this.documentId,
      originDepartment: '',
      destinationDepartment: '',
      originSectorId: undefined,
      destinationSectorId: 0,
      sendingUserId: this.currentUserId,
      memo: ''
    };
  }

  close() {
    this.dialogRef.close();
  }
}
