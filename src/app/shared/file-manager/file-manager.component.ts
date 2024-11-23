import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToolBarComponent } from '../../features/tool-bar.component/tool-bar.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FormatUtils } from '../../utils/Formater';
import { catchError, of, tap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EditorHtmlComponent } from '../../features/editor-html/editor-html.component';
import { InserirArquivosComponent } from "../inserir-arquivos/inserir-arquivos.component";
import { FileUtils } from '../../utils/FileUtils';
import { JsTreeUtil } from '../../utils/jsTreeUtils';
import { MessageUtil } from '../../utils/message';
import GedApiService from '../../gedApiService';
import { DocumentService } from '../../services/documentService';
import { InsertDocumentComponent } from '../../features/Insert-document/insert-document.component';
import { DocumentFetchDTO } from '../../models/documentItem';

declare var $: any;

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    ToolBarComponent,
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    EditorHtmlComponent,
    InsertDocumentComponent

  ],
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
  title = 'File Manager';
  processIdentifier: string = '';
  documents: DocumentFetchDTO | any;
  docIcon: string = '';
  errorMessage: string | null = null;
  alertMessage: string | null = null;
  selectedDocument: SafeResourceUrl | null = null;
  subTitle: string = '';
  selectedModal = '';
  selectedDocumentString: any = '';
  documentBlob: any;
  elementId = 'documentTree';
  documentCount = 0;
  docIdEvent = 0;
  docExtEvent = '';
  modal = 0;

  buttonRoles = {
    editableDocument: false,
    showEditor: false,
    showInsertDocument: false,
    validProcess: false,
    isLoading: false,
  };

  constructor(private gedAPI: GedApiService, private sanitizer: DomSanitizer, private documentService: DocumentService) { }

  ngOnInit() { }

  initJsTree() {
    this.modal = 0;
    JsTreeUtil.initializeJsTree(this.elementId, this.documents, this.processIdentifier, (docID: number, extension: string) => {
      this.selectDocument({ docID, extension }, () => { });
    });
  }

  format(event: any) {
    this.processIdentifier = FormatUtils.formatProcessIdentifier(this.processIdentifier);
  }

  clearRoles() {
    this.buttonRoles = {
      editableDocument: false,
      showEditor: false,
      showInsertDocument: false,
      validProcess: false,
      isLoading: false,
    };
  }

  insertHtmlDocument() {
    this.selectedDocument = null;
    this.subTitle = 'Inserir Documento';
    this.modal = 1;
    this.buttonRoles = {
      editableDocument: false,
      showEditor: false,
      showInsertDocument: true,
      validProcess: false,
      isLoading: false,
    };
    this.processIdentifier;
  }

  async searchDocuments(callback: (result: any) => void) {
    this.buttonRoles.isLoading = true;
    this.buttonRoles.showInsertDocument = true;
    this.buttonRoles.validProcess = true;
    this.errorMessage = null;
    this.alertMessage = null;

    (await this.documentService.fetchDocumentsByProcess(this.processIdentifier))
      .pipe(
        tap((result: any[]) => {
          if (result && result.length > 0) {
            this.documents = result;
            this.documentCount = result.length;
            this.buttonRoles.validProcess = true;
            this.selectedDocument = null;
            this.initJsTree();
            callback(result);
          } else if (!result) {
            JsTreeUtil.destroyJsTree(this.elementId);
            this.buttonRoles.showInsertDocument = false;
            this.documents = [];
            this.selectedDocument = null;
            this.buttonRoles.validProcess = false;

            MessageUtil.displayErrorMessage(
              this,
              `Houve um erro ao tentar buscar os documentos para o processo.<br>
              O processo não está registrado no sistema. <br>
              <a href="#" target="_blank" rel="noopener noreferrer">
                  Adicionar novo processo.
              </a>
              `
            );
          } else {
            this.selectedDocument = null;
            MessageUtil.displayAlertMessage(
              this,
              `Nenhum documento foi encontrado para o processo fornecido.<br>
              Use a opção no menu para adicionar novos documentos.
              `
            );
            this.documents = [];
            JsTreeUtil.destroyJsTree(this.elementId);
            this.modal = 0;
            this.buttonRoles.validProcess = true;
            this.buttonRoles.showInsertDocument = true;
          }
        }),
        catchError((error) => {
          this.documents = [];
          this.selectedDocument = null;
          this.buttonRoles.validProcess = false;
          this.buttonRoles.showInsertDocument = false;
          JsTreeUtil.destroyJsTree(this.elementId);
          this.modal = 0;
          MessageUtil.displayErrorMessage(
            this,
            `Houve um erro ao tentar buscar os documentos para o processo.<br>
              O processo não está registrado no sistema. <br>
              <a href="#" target="_blank" rel="noopener noreferrer">
                  Adicionar novo processo.
              </a>
            `
          );
          return of([]);
        })
      )
      .subscribe(() => {
        this.buttonRoles.isLoading = false;
      });
  }

  async selectDocument(event: { docID: number, extension: string }, callback: () => void) {
    const { docID, extension } = event;
    this.modal = 0;
    this.buttonRoles.isLoading = true;
    this.subTitle = 'View Document';
    this.buttonRoles.showEditor = false;

    (await this.documentService.fetchDocumentFile(docID))
      .pipe(
        tap((result) => {
          const mimeType = FileUtils.getMimeType(extension);
          this.buttonRoles.editableDocument = extension === '.html';
          this.buttonRoles.showInsertDocument = true;
          this.buttonRoles.validProcess = true;
          this.documentBlob = new Blob([result], { type: mimeType });
          this.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.documentBlob));

          this.buttonRoles.isLoading = false;
          callback();
        }),
        catchError((error) => {
          console.error('Error loading document:', error);
          this.selectedDocument = null;
          this.buttonRoles.isLoading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  editHtmlDocument() {
    this.subTitle = 'Edit Document';
    this.selectedDocument = null;
    this.buttonRoles.isLoading = true;
    this.buttonRoles.showEditor = true;
    this.modal = 0;
    this.buttonRoles.showInsertDocument = true;
    this.buttonRoles.validProcess = true;

    if (!this.documentBlob) {
      console.error('No document loaded for editing.');
      return;
    }

    this.documentService.getHtmlContent(this.documentBlob).then((content) => {
      if (content) {
        this.selectedDocumentString = content;
        this.buttonRoles.showEditor = true;
        this.buttonRoles.showInsertDocument = true;
        this.buttonRoles.validProcess = true;

        this.buttonRoles.isLoading = false;
      } else {
        this.buttonRoles.isLoading = false;
      }
    });
  }

  startDocument(event: { docID: number; extension: string }) {
    this.searchDocuments((result) => {
      this.selectDocument(event, () => {
        event.extension === '.html' ? this.editHtmlDocument() : null;
      });
    });
  }


  callback(result: any, error?: any) {
    if (error) {
      console.log('Search error:', error);
    } else {
      console.log('Search result:', result);
    }
  }
}
