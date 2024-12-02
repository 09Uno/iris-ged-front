import { VisibleButtons, UiControllerElements } from './document-manager-core/document-manager.models';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, of, tap } from 'rxjs';
import { JsTreeUtil } from '../../utils/jsTreeUtils';
import { FileUtils } from '../../utils/FileUtils';
import { MessageUtil } from '../../utils/message';
import { DocumentService } from '../../services/documentService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { EditorHtmlComponent } from '../../features/editor-html/editor-html.component';
import { InsertDocumentComponent } from '../../features/Insert-document/insert-document.component';
import { ToolBarComponent } from '../../features/tool-bar.component/tool-bar.component';
import { FormatUtils } from '../../utils/Formater';
import { defaultViewController, defaultManagerAttributes, defaultHtmlClassAndId, defaultMessages, defaultUiControllers, defaultVisibleButtons } from './document-manager-core/document-manager.config';
import { Title } from '@angular/platform-browser';



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
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.scss'],
})
export class DocumentManagerComponent implements OnInit {

  viewController = { ...defaultViewController };
  visibleButtons = { ...defaultVisibleButtons };
  uiControllers = { ...defaultUiControllers}
  managerAttributes = { ...defaultManagerAttributes };
  messages = { ...defaultMessages };
  htmlClassAndId = { ...defaultHtmlClassAndId };

  constructor(
    private sanitizer: DomSanitizer,
    private documentService: DocumentService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.titleService.setTitle('Gerenciar Documentos');
    this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-filed';
    this.htmlClassAndId.cardClass = 'card card-bkg-filed';
  }

  // Inicializa a árvore de documentos (JsTree)
  initJsTree() {
    this.viewController.selectedModalNumber = 0;
    JsTreeUtil.initializeJsTree(
      this.htmlClassAndId.elementId,
      this.managerAttributes.documents,
      this.managerAttributes.processIdentifier,
      (docID: number, extension: string) => {
        this.selectDocument({ docID, extension }, () => { });
      }
    );
  }

  // Formata o identificador do processo
  format(event: any) {
    this.managerAttributes.processIdentifierInput = FormatUtils.formatProcessIdentifier(this.managerAttributes.processIdentifierInput)
  }

  // Limpa as configurações dos botões
  clearRoles() {
    this.visibleButtons = { ...this.visibleButtons };
  }

  // Insere um novo documento HTML
  insertHtmlDocument() {
    this.managerAttributes.selectedDocument = null;
    this.viewController.subtitle = 'Inserir Documento';
    this.viewController.selectedModalNumber = 1;
    this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';
    this.visibleButtons.showInsertDocumentButton = true;
    this.uiControllers.showEditor = false;
  }

  // Busca documentos para o processo
  async searchDocuments(callback: (result: any) => void) {
    this.uiControllers.isLoading = true;
    this.visibleButtons.showInsertDocumentButton = true;
    this.uiControllers.validProcess = true;
    this.messages.errorMessage = null;
    this.messages.alertMessage = null;

    if(this.managerAttributes.source !== 'children'){
      this.managerAttributes.processIdentifier = this.managerAttributes.processIdentifierInput;
    }
    
    (await this.documentService.fetchDocumentsByProcess(this.managerAttributes.processIdentifier))
      .pipe(
        tap((result: any[]) => {
          if (result && result.length > 0) {
            this.managerAttributes.documents = result;
            this.managerAttributes.documentCount = result.length;
            this.uiControllers.validProcess = true;
            this.managerAttributes.selectedDocument = null;
            // this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';
            this.initJsTree();
            this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';
            this.htmlClassAndId.cardClass = 'card card-bkg-filed';

            callback(result);
          } else if (!result) {
            JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);
            this.visibleButtons.showInsertDocumentButton = false;
            this.managerAttributes.documents = [];
            this.managerAttributes.selectedDocument = null;
            this.uiControllers.validProcess = false;
            this.htmlClassAndId.cardClass = 'card card-bkg-filed';
            this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-filed';
            MessageUtil.displayErrorMessage(
              this,
              `Houve um erro ao tentar buscar os documentos para o processo.<br>
              O processo não está registrado no sistema. <br>
              <a href="https://iris.creaba.org.br/admin/processos/create" target="_blank" rel="noopener noreferrer">
                  Adicionar novo processo.
              </a>
              `
            );
          } else {
            this.managerAttributes.selectedDocument = null;
            MessageUtil.displayAlertMessage(
              this,
              `Nenhum documento foi encontrado para o processo fornecido.<br>
              Use a opção no menu para adicionar novos documentos.
              `
            );
            this.managerAttributes.documents = [];
            JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);
            this.viewController.selectedModalNumber = 0;
            this.uiControllers.validProcess = true;
            this.visibleButtons.showInsertDocumentButton = true;
          }
        }),
        catchError(() => {
          this.managerAttributes.documents = [];
          this.managerAttributes.selectedDocument = null;
          this.uiControllers.validProcess = false;
          this.visibleButtons.showInsertDocumentButton = false;
          JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);
          this.htmlClassAndId.cardClass = 'card card-bkg-filed';
          this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-filed';

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
        this.uiControllers.isLoading = false;
      });
  }

  // Seleciona um documento para visualização ou edição
  async selectDocument(event: { docID: number; extension: string;   }, callback: () => void) {
    
    
    const { docID, extension } = event;
    this.viewController.selectedModalNumber = 0
    this.uiControllers.isLoading = true;
    this.viewController.subtitle = 'Ver Documento.';
    this.uiControllers.showEditor = false;
    this.managerAttributes.documentId = docID;


    (await this.documentService.fetchDocumentFile(docID))
      .pipe(
        tap((result) => {
          const mimeType = FileUtils.getMimeType(extension);
          this.uiControllers.editableDocument = extension === '.html';
          this.visibleButtons.showInsertDocumentButton = true;
          this.uiControllers.validProcess = true;
          this.managerAttributes.documentBlob = new Blob([result], { type: mimeType });
          this.managerAttributes.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(this.managerAttributes.documentBlob)
          );

          this.uiControllers.isLoading = false;
          this.htmlClassAndId.cardClass = 'card card-bkg-empty';
          this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';

          callback();
        }),
        catchError(() => {
          this.managerAttributes.selectedDocument = null;
          this.uiControllers.isLoading = false;
          this.htmlClassAndId.cardClass = 'card card-bkg-filed';

          return of(null);
        })
      )
      .subscribe();
  }

  // Edita um documento HTML
  editHtmlDocument() {
    this.viewController.subtitle = 'Editar Documento.';
    this.managerAttributes.selectedDocument = null;
    this.uiControllers.isLoading = true;
    this.uiControllers.showEditor = true;
    this.viewController.selectedModalNumber = 0;
    this.visibleButtons.showInsertDocumentButton = true;
    this.uiControllers.validProcess = true;

    if (!this.managerAttributes.documentBlob) {
      console.error('No document loaded for editing.');
      return;
    }

    this.documentService.getHtmlContent(this.managerAttributes.documentBlob).then((content) => {
      if (content) {
        this.managerAttributes.selectedDocumentString = content;
        this.uiControllers.showEditor = true;
        this.visibleButtons.showInsertDocumentButton = true;
        this.uiControllers.validProcess = true;
        this.uiControllers.isLoading = false;
      } else {
        this.uiControllers.isLoading = false;
      }
    });
  }
  
  searchDocumentsFromParent(callback: (result: any) => void) {
    this.managerAttributes.source = 'parent';
    this.searchDocuments(callback);
  }
  // Inicia o processo de seleção e edição de documento
  startDocument(event: { docID: number; extension: string }) {
    this.searchDocuments((result) => {
      this.selectDocument(event, () => {
        event.extension === '.html' ? this.editHtmlDocument() : null;
      });
      this.managerAttributes.source = 'children'
    });
  }

  // Função de callback para manipulação de resultados ou erros
  callback(result: any, error?: any) {
    if (error) {
      console.log('Search error:', error);
    } else {
      console.log('Search result:', result);
    }
  }
}
