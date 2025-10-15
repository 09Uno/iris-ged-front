import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DocumentClassService } from '../../../../services/documents/document-class.service';
import { CreateDocumentClassDto, DocumentClass, DestinacaoFinal } from '../../../../types/document.types';

@Component({
  selector: 'app-add-document-class-modal',
  templateUrl: './add-document-class-modal.component.html',
  styleUrls: ['./add-document-class-modal.component.scss']
})
export class AddDocumentClassModalComponent implements OnInit {
  documentClassForm: FormGroup;
  isLoading = false;
  isLoadingParents = false;
  parentClasses: DocumentClass[] = [];

  finalDispositionOptions = [
    { value: DestinacaoFinal.EliminacaoImediata, label: 'Eliminação Imediata', icon: 'delete_forever', color: 'warn' },
    { value: DestinacaoFinal.GuardaPermanente, label: 'Guarda Permanente', icon: 'archive', color: 'primary' },
    { value: DestinacaoFinal.EliminacaoAposGuarda, label: 'Eliminação Após Guarda', icon: 'event_available', color: 'accent' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDocumentClassModalComponent>,
    private documentClassService: DocumentClassService
  ) {
    this.documentClassForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{3}(\.\d{2})*$/)]],
      fullTerm: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: [''],
      parentClassId: [null],
      currentRetentionPeriod: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      intermediateRetentionPeriod: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      finalDisposition: [DestinacaoFinal.GuardaPermanente, [Validators.required]],
      notes: [''],
      createdByUserId: [1] // TODO: Get from auth service
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
          this.parentClasses = classes;
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
    const dto: CreateDocumentClassDto = {
      code: formValue.code,
      fullTerm: formValue.fullTerm,
      description: formValue.description || undefined,
      parentClassId: formValue.parentClassId || undefined,
      currentRetentionPeriod: formValue.currentRetentionPeriod,
      intermediateRetentionPeriod: formValue.intermediateRetentionPeriod,
      finalDisposition: formValue.finalDisposition,
      notes: formValue.notes || undefined,
      createdByUserId: 1 // TODO: Get from auth service
    };

    try {
      (await this.documentClassService.create(dto)).subscribe({
        next: (response) => {
          console.log('Document class created successfully:', response);
          this.isLoading = false;
          this.dialogRef.close({
            success: true,
            data: response,
            message: 'Classe documental criada com sucesso!'
          });
        },
        error: (error) => {
          console.error('Error creating document class:', error);
          this.isLoading = false;
          this.dialogRef.close({
            success: false,
            error: error,
            message: error.error?.error || 'Erro ao criar classe documental. Tente novamente.'
          });
        }
      });
    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.isLoading = false;
      this.dialogRef.close({
        success: false,
        error: error,
        message: 'Erro ao criar classe documental. Tente novamente.'
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

  getDispositionIcon(option: any): string {
    return option.icon;
  }

  getDispositionColor(option: any): string {
    return option.color;
  }
}
