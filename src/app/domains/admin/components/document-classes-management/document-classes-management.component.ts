import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentClass } from '../../../../types/document.types';
import { DocumentClassService } from '../../../../services/documents/document-class.service';
import { AddDocumentClassModalComponent } from '../add-document-class-modal/add-document-class-modal.component';
import { EditDocumentClassModalComponent } from '../edit-document-class-modal/edit-document-class-modal.component';

@Component({
  selector: 'app-document-classes-management',
  templateUrl: './document-classes-management.component.html',
  styleUrls: ['./document-classes-management.component.scss']
})
export class DocumentClassesManagementComponent implements OnInit {
  documentClasses: DocumentClass[] = [];
  filteredClasses: DocumentClass[] = [];
  isLoading = false;
  searchTerm = '';

  // Table configuration
  displayedColumns: string[] = ['code', 'fullTerm', 'description', 'retention', 'finalDisposition', 'active', 'actions'];

  constructor(
    private documentClassService: DocumentClassService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DocumentClassesManagementComponent>
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadDocumentClasses();
  }

  async loadDocumentClasses(): Promise<void> {
    this.isLoading = true;
    try {
      (await this.documentClassService.getAll()).subscribe({
        next: (classes) => {
          this.documentClasses = classes;
          this.filteredClasses = classes;
          this.isLoading = false;
          console.log('Document classes loaded:', classes);
        },
        error: (error) => {
          console.error('Error loading document classes:', error);
          this.showSnackBar('Erro ao carregar classes documentais', 'error');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error in loadDocumentClasses:', error);
      this.showSnackBar('Erro ao carregar classes documentais', 'error');
      this.isLoading = false;
    }
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredClasses = this.documentClasses;
      return;
    }

    this.filteredClasses = this.documentClasses.filter(dc =>
      dc.code.toLowerCase().includes(term) ||
      dc.fullTerm.toLowerCase().includes(term) ||
      (dc.description && dc.description.toLowerCase().includes(term))
    );
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddDocumentClassModalComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.showSnackBar(result.message || 'Classe documental criada com sucesso!', 'success');
        this.loadDocumentClasses();
      } else if (result && !result.success) {
        this.showSnackBar(result.message || 'Erro ao criar classe documental', 'error');
      }
    });
  }

  openEditModal(documentClass: DocumentClass): void {
    const dialogRef = this.dialog.open(EditDocumentClassModalComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: { documentClass }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.showSnackBar(result.message || 'Classe documental atualizada com sucesso!', 'success');
        this.loadDocumentClasses();
      } else if (result && !result.success) {
        this.showSnackBar(result.message || 'Erro ao atualizar classe documental', 'error');
      }
    });
  }

  async deleteDocumentClass(documentClass: DocumentClass): Promise<void> {
    const confirmed = confirm(
      `Tem certeza que deseja excluir a classe "${documentClass.code} - ${documentClass.fullTerm}"?\n\n` +
      `Esta ação não pode ser desfeita e pode afetar tipos de documento associados.`
    );

    if (!confirmed) return;

    this.isLoading = true;
    try {
      (await this.documentClassService.delete(documentClass.id)).subscribe({
        next: () => {
          this.showSnackBar('Classe documental excluída com sucesso!', 'success');
          this.loadDocumentClasses();
        },
        error: (error) => {
          console.error('Error deleting document class:', error);
          this.showSnackBar('Erro ao excluir classe documental', 'error');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error in deleteDocumentClass:', error);
      this.showSnackBar('Erro ao excluir classe documental', 'error');
      this.isLoading = false;
    }
  }

  getFinalDispositionLabel(disposition: number): string {
    const labels: { [key: number]: string } = {
      0: 'Eliminação Imediata',
      1: 'Guarda Permanente',
      2: 'Eliminação Após Guarda'
    };
    return labels[disposition] || 'Não definida';
  }

  getFinalDispositionColor(disposition: number): string {
    const colors: { [key: number]: string } = {
      0: 'warn',
      1: 'primary',
      2: 'accent'
    };
    return colors[disposition] || '';
  }

  getStatusColor(active: boolean): string {
    return active ? 'primary' : 'warn';
  }

  getStatusLabel(active: boolean): string {
    return active ? 'Ativa' : 'Inativa';
  }

  showSnackBar(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  onClose(): void {
    this.dialogRef.close({ success: true });
  }
}
