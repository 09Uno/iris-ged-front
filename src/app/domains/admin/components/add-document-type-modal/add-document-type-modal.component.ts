import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DocumentService } from '@services/index';
import { DocumentType } from '../../../../types';

@Component({
  selector: 'app-add-document-type-modal',
  templateUrl: './add-document-type-modal.component.html',
  styleUrls: ['./add-document-type-modal.component.scss']
})
export class AddDocumentTypeModalComponent implements OnInit {

  documentTypeForm: FormGroup;
  isLoading = false;

  categories = [
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'recursos-humanos', label: 'Recursos Humanos' },
    { value: 'outros', label: 'Outros' }
  ];


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDocumentTypeModalComponent>,
    private documentService: DocumentService
  ) {
    this.documentTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      category: ['', [Validators.required]],
      isActive: [true],
      prefix: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]]
    });
  }

  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    if (this.documentTypeForm.valid) {
      this.isLoading = true;

      const newDocumentType = {
        ...this.documentTypeForm.value,
        id: 0, 
        isActive: this.documentTypeForm.value.isActive ?? true,
        code: this.documentTypeForm.value.code,
        category: this.documentTypeForm.value.category,
        createdAt: new Date()
      } as DocumentType;

      try {
        (await this.documentService.addType(newDocumentType))
          .subscribe({
            next: (response) => {
              console.log('Document type added successfully:', response);
              this.isLoading = false;
              this.dialogRef.close({ 
                success: true, 
                data: newDocumentType,
                message: 'Tipo de documento criado com sucesso!'
              });
            },
            error: (error) => {
              console.error('Error adding document type:', error);
              this.isLoading = false;
              this.dialogRef.close({ 
                success: false, 
                error: error,
                message: 'Erro ao criar tipo de documento. Tente novamente.'
              });
            }
          });
      } catch (error) {
        console.error('Error adding document type:', error);
        this.isLoading = false;
        this.dialogRef.close({ 
          success: false, 
          error: error,
          message: 'Erro ao criar tipo de documento. Tente novamente.'
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
    Object.keys(this.documentTypeForm.controls).forEach(key => {
      const control = this.documentTypeForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.documentTypeForm.get(fieldName);
    
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
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.documentTypeForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}