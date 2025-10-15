import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DocumentService } from '@services/index';
import { CreateDocumentTypeDto, DocumentClass } from '../../../../types';
import { DocumentClassService } from '../../../../services/documents/document-class.service';

@Component({
  selector: 'app-add-document-type-modal',
  templateUrl: './add-document-type-modal.component.html',
  styleUrls: ['./add-document-type-modal.component.scss']
})
export class AddDocumentTypeModalComponent implements OnInit {

  documentTypeForm: FormGroup;
  isLoading = false;
  documentClasses: DocumentClass[] = [];
  isLoadingClasses = false;

  // Configuração do Quill Editor
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  };

  categories = [
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'juridico', label: 'Jurídico' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'recursos-humanos', label: 'Recursos Humanos' },
    { value: 'outros', label: 'Outros' }
  ];

  documentFormats = [
    { value: 'file', label: 'Arquivo (PDF, Word, Excel, etc.)', icon: 'description' },
    { value: 'html', label: 'HTML (Input para inserir código HTML)', icon: 'code' }
  ];


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDocumentTypeModalComponent>,
    private documentService: DocumentService,
    private documentClassService: DocumentClassService
  ) {
    this.documentTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      category: ['', [Validators.required]],
      format: ['file'], // Default para arquivo, não obrigatório
      isActive: [true],
      prefix: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(10)]],
      htmlContent: [''], // Campo para conteúdo HTML
      classeDocumentalId: [null], // Classe documental (opcional)
      description: [''] // Descrição opcional
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadDocumentClasses();
  }

  async loadDocumentClasses(): Promise<void> {
    this.isLoadingClasses = true;
    try {
      (await this.documentClassService.getActiveClasses()).subscribe({
        next: (classes) => {
          this.documentClasses = classes;
          console.log('Document classes loaded:', classes);
          this.isLoadingClasses = false;
        },
        error: (error) => {
          console.error('Error loading document classes:', error);
          this.isLoadingClasses = false;
        }
      });
    } catch (error) {
      console.error('Error in loadDocumentClasses:', error);
      this.isLoadingClasses = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.documentTypeForm.valid) {
      this.isLoading = true;

      const formValue = this.documentTypeForm.value;
      const isHtmlType = formValue.format === 'html';

      const newDocumentType: CreateDocumentTypeDto = {
        name: formValue.name,
        code: formValue.code,
        category: formValue.category,
        description: formValue.description || undefined,
        prefix: formValue.prefix,
        isActive: formValue.isActive ?? true,
        classeDocumentalId: formValue.classeDocumentalId || undefined,
        htmlTemplateContent: isHtmlType ? formValue.htmlContent : undefined,
        templateFileName: isHtmlType ? `${formValue.code}_template.html` : undefined,
        supportsHtmlEditing: isHtmlType
      };

      try {
        (await this.documentService.addType(newDocumentType))
          .subscribe({
            next: (response) => {
              console.log('Document type added successfully:', response);
              this.isLoading = false;
              this.dialogRef.close({
                success: true,
                data: response,
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

  isHtmlFormat(): boolean {
    return this.documentTypeForm.get('format')?.value === 'html';
  }
}