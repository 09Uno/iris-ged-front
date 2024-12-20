import { SnackBarService } from '../../utils/openSnackBar';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { attachmentTypes, fileType } from '../../models/fileType';
import { JsTreeUtil } from '../../utils/jsTreeUtils';
import GedApiService from '../../gedApiService';
import { documentFetchDTO, documentItem, htmlDocumentItem } from '../../models/document/documentItemModel.config';
import { lastValueFrom } from 'rxjs';
import { DocumentService } from '../../services/documentService';

@Component({
  selector: 'app-insert-document',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './insert-document.component.html',
  styleUrl: './insert-document.component.scss',
})
export class InsertDocumentComponent {
  title = '';
  isLoading = false;
  subtitle = '';
  documentTemplate = '';
  documentTemplateText = '';
  fileTypeOptions: { value: string; text: string }[] = [];
  attachmentTypeOptions: { value: string; text: string }[] = [];
  documentItem = documentItem;
  documentItemHtml = htmlDocumentItem;
  documentFetchDTO = documentFetchDTO;
  imagePath = 'assets/brazil.png';
  @Input() modal: number = 0;

  selectedFile: string | File | Blob = '';

  @Input() processIdentifier: string = '';
  @Output() fetchDocuments = new EventEmitter<void>();
  @Output() startDocumentCallback = new EventEmitter<{ docID: number; extension: string, name : string }>();

  constructor(
    private router: Router,
    private gedApi: GedApiService,
    private snackService: SnackBarService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.attachmentTypeOptions = attachmentTypes;
    this.fileTypeOptions = fileType;
    this.documentItemHtml.ProcessIdentifier = this.processIdentifier;
    this.documentItem.ProcessIdentifier = this.processIdentifier;
    this.modal = 0;
  }

  getImageUrl(imagePath: string): string {
    return `/${imagePath}`;
  }

  startDocument(id: number, ext: string, name: string) {
    this.startDocumentCallback.emit({ docID: id, extension: ext, name });
  }

  performFetch() {
    return new Promise<void>((resolve, reject) => {
      this.fetchDocuments.emit();
      resolve();
    });
  }

  navigateToTemplates() {
    this.modal = 1;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }


  async saveDocuments() {
    if (
      this.documentTemplate === '1' &&
      (!this.documentItem.FileName ||
        !this.documentItem.DocumentType ||
        !this.documentItem.ProcessIdentifier ||
        !this.documentItem.DocumentDate ||
        !this.selectedFile)
    ) {
      this.snackService.openSnackBar('Todos os campos devem ser preenchidos!', 'Fechar');
      return;
    }

    this.isLoading = true;
    
    try {
      const response = await lastValueFrom(await this.documentService.addDocument(this.documentItem, this.selectedFile as File));
      const data = response?.body || response;
      const doc = data.savedDocument;

      this.snackService.openSnackBar('Documento Adicionado com Sucesso!', 'Fechar');
      this.clearFields();
      this.clearHtmlFields();
      this.isLoading = false;
      this.modal = 4;

      JsTreeUtil.destroyJsTree('documentTree');
      this.performFetch();
      this.startDocument(doc.id, doc.extension, doc.name);

    } catch (error) {
      console.error('Unexpected error saving document:', error);
      this.snackService.openSnackBar('Erro ao salvar o documento!', 'Fechar');
      this.clearFields();
      this.clearHtmlFields();
      this.isLoading = false;
    }
  }

  async saveHtmlDocuments() {
    if (
      !this.documentItemHtml.FileName ||
      !this.documentItemHtml.DocumentType ||
      !this.documentItemHtml.ProcessIdentifier ||
      !this.documentItemHtml.DocumentDate
    ) {
      this.snackService.openSnackBar('Todos os campos precisam ser preenchidos!', 'Fechar');
      return;
    }

    try {
      const response = await lastValueFrom(await this.documentService.addHtmlDocument(this.documentItemHtml));
      const data = response?.body || response;
      const doc = data.savedDocument;

      this.snackService.openSnackBar('Documento adicionado com sucesso!', 'Fechar');
      this.isLoading = false;
      this.modal = 4;

      this.startDocument(doc.id, doc.extension, doc.name);
      this.clearFields();
      this.clearHtmlFields();

    } catch (error) {
      console.error('Error calling addHtmlDocument:', error);
      this.snackService.openSnackBar('Erro ao salvar documento!', 'Fechar');
      this.clearFields();
      this.clearHtmlFields();
      this.isLoading = false;
      this.modal = 1;
    }
  }



  clearFields() {
    this.documentItem.FileName = '';
    this.documentItem.DocumentDate = '';
    this.documentItem.Description = '';
    this.documentItem.FileContent = '';
    this.documentItem.FileExtension = '';
    this.documentItemHtml.DocumentType = 'defaultValue';
    this.selectedFile = '';
    this.modal = 1;
    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearHtmlFields() {
    this.documentItemHtml.FileName = '';
    this.documentItemHtml.DocumentType = 'defaultValue';
    this.documentItemHtml.Description = '';
    this.selectedFile = '';
    this.modal = 1;
    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async selectTemplate() {
    if (this.documentTemplate === '1') {
      this.modal = 2;
    } else if (this.documentTemplate === '2') {
      this.modal = 3;
      this.title = this.title;
    } else {
      this.modal = 1;
    }
  }
}
