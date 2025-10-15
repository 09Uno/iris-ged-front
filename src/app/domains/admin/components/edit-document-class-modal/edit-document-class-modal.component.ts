import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentClassService } from '../../../../services/documents/document-class.service';
import { UpdateDocumentClassDto, DocumentClass, DestinacaoFinal } from '../../../../types/document.types';

@Component({
  selector: 'app-edit-document-class-modal',
  templateUrl: './edit-document-class-modal.component.html',
  styleUrls: ['./edit-document-class-modal.component.scss']
})
export class EditDocumentClassModalComponent implements OnInit {
  documentClassForm: FormGroup;
  isLoading = false;
  isLoadingParents = false;
  parentClasses: DocumentClass[] = [];
  currentClass: DocumentClass;

  finalDispositionOptions = [
    { value: DestinacaoFinal.EliminacaoImediata, label: 'Eliminação Imediata', icon: 'delete_forever', color: 'warn' },
    { value: DestinacaoFinal.GuardaPermanente, label: 'Guarda Permanente', icon: 'archive', color: 'primary' },
    { value: DestinacaoFinal.EliminacaoAposGuarda, label: 'Eliminação Após Guarda', icon: 'event_available', color: 'accent' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditDocumentClassModalComponent>,
    private documentClassService: DocumentClassService,
    @Inject(MAT_DIALOG_DATA) public data: { documentClass: DocumentClass }
  ) {
    this.currentClass = data.documentClass;

    this.documentClassForm = this.fb.group({
      code: [this.currentClass.code, [Validators.required, Validators.pattern(/^\d{3}(\.\d{2})*$/)]],
      description: [this.currentClass.description || ''],
      parentClassId: [this.currentClass.parentClassId || null],
      currentRetentionPeriod: [this.currentClass.currentRetentionPeriod, [Validators.required, Validators.min(0), Validators.max(100)]],
      intermediateRetentionPeriod: [this.currentClass.intermediateRetentionPeriod, [Validators.required, Validators.min(0), Validators.max(100)]],
      finalDisposition: [this.currentClass.finalDisposition, [Validators.required]],
      notes: [this.currentClass.notes || '']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadParentClasses();
  }

  async loadParentClasses(): Promise<void> {
    this.isLoadingParents = true;
    try {
      (await this.documentClassService.getActiveClasses()).subscribe({
        next: (classes) => {
          // Filtrar a classe atual para não permitir que seja pai de si mesma
          this.parentClasses = classes.filter(c => c.id !== this.currentClass.id);
          this.isLoadingParents = false;
        },
        error: (error) => {
          console.error('Error loading parent classes:', error);
          this.isLoadingParents = false;
        }
      });
    } catch (error) {
      console.error('Error in loadParentClasses:', error);
      this.isLoadingParents = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.documentClassForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;

    const formValue = this.documentClassForm.value;
    const dto: UpdateDocumentClassDto = {
      code: formValue.code,
      description: formValue.description || undefined,
      parentClassId: formValue.parentClassId || undefined,
      currentRetentionPeriod: formValue.currentRetentionPeriod,
      intermediateRetentionPeriod: formValue.intermediateRetentionPeriod,
      finalDisposition: formValue.finalDisposition,
      notes: formValue.notes || undefined
    };

    try {
      (await this.documentClassService.update(this.currentClass.id, dto)).subscribe({
        next: (response) => {
          console.log('Document class updated successfully:', response);
          this.isLoading = false;
          this.dialogRef.close({
            success: true,
            data: response,
            message: 'Classe documental atualizada com sucesso!'
          });
        },
        error: (error) => {
          console.error('Error updating document class:', error);
          this.isLoading = false;
          this.dialogRef.close({
            success: false,
            error: error,
            message: error.error?.error || 'Erro ao atualizar classe documental. Tente novamente.'
          });
        }
      });
    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.isLoading = false;
      this.dialogRef.close({
        success: false,
        error: error,
        message: 'Erro ao atualizar classe documental. Tente novamente.'
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.documentClassForm.controls).forEach(key => {
      const control = this.documentClassForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.documentClassForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido. Use o padrão: XXX.XX (ex: 010.01)';
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.documentClassForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}
