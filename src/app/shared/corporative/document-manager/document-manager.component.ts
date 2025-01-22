import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, of, tap } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { defaultViewController, defaultManagerAttributes, defaultHtmlClassAndId, defaultMessages, defaultUiControllers, defaultVisibleButtons } from './document-manager-core/document-manager.config';
import { Title } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';


import { TDocumentDefinitions } from 'pdfmake/interfaces';
import htmlToPdfmake from 'html-to-pdfmake';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { Overlay } from '@angular/cdk/overlay';
import { EditorHtmlComponent } from '../../../features/editor-html/editor-html.component';
import { InsertDocumentComponent } from '../../../features/Insert-document/insert-document.component';
import { ToolBarComponent } from '../../../features/tool-bar.component/tool-bar.component';
import { DocumentService } from '../../../services/documents/document.service';
import { FileUtils } from '../../../utils/FileUtils';
import { FormatUtils } from '../../../utils/Formater';
import { JsTreeUtil } from '../../../utils/jsTreeUtils';
import { MessageUtil } from '../../../utils/message';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    ToolBarComponent,
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    InsertDocumentComponent,
    MatSidenavModule,
    MatButtonModule,
    
  ],
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.scss'],
})
export class DocumentManagerComponent implements OnInit {

  viewController = { ...defaultViewController };
  visibleButtons = { ...defaultVisibleButtons };
  uiControllers = { ...defaultUiControllers }
  managerAttributes = { ...defaultManagerAttributes };
  messages = { ...defaultMessages };
  htmlClassAndId = { ...defaultHtmlClassAndId };
  sidenavOpened = false;
  overlayRef: any;
  isProfessional: boolean = false;
  isCorporative: boolean = true;

  private dialogRef: MatDialogRef<EditorHtmlComponent> | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private documentService: DocumentService,
    private titleService: Title,
    private overlay: Overlay,
    private dialog: MatDialog
  ) {
    (window as any).pdfMake.vfs = pdfFonts.vfs;
  }
  ngOnInit() {
    localStorage.setItem('redirectUrl', '/documents');
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
      (docID: number, extension: string, name: string) => {
        this.selectDocument({ docID, extension, name }, () => { });
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

    if (this.managerAttributes.source !== 'children') {
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

  async selectDocument(event: { docID: number; extension: string; name: string }, callback: () => void) {
    const { docID, extension, name } = event;

    this.viewController.selectedModalNumber = 0;
    this.uiControllers.isLoading = true;
    this.viewController.subtitle = 'Ver Documento.';
    this.uiControllers.showEditor = false;
    this.managerAttributes.documentId = docID;
    this.managerAttributes.name = name;

    (await this.documentService.fetchDocumentFile(docID))
      .pipe(
        tap(async (result) => {
          const mimeType = FileUtils.getMimeType(extension);
          const blob = new Blob([result as BlobPart], { type: mimeType });
          this.managerAttributes.documentBlob = blob;

          if (extension === '.html') {
            // Ler o conteúdo do blob como texto
            const content = await blob.text();

            // Adicionar <header> ao HTML carregado no iframe
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const existingHeader = doc.querySelector('header');
            if (existingHeader) {
              existingHeader.replaceWith(FileUtils.createNewHeader());
            } else {
              const body = doc.querySelector('body');
              if (body) {
                body.insertBefore(FileUtils.createNewHeader(), body.firstChild);
              }
            }

            // Criar um blob atualizado para o iframe
            const updatedBlob = new Blob([doc.documentElement.outerHTML], { type: mimeType });
            this.managerAttributes.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(
              URL.createObjectURL(updatedBlob)
            );

            // O conteúdo original será usado no Quill Editor
            this.uiControllers.editableDocument = true;
          } else {
            this.managerAttributes.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(
              URL.createObjectURL(blob)
            );
          }

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

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }


  async downloadDocumentAsPdf() {
    this.uiControllers.isLoading = true;

    try {
      const blob: Blob = this.managerAttributes.documentBlob;

      if (blob) {
        const fileName =
          'IRIS GED - ' +
          this.managerAttributes.documentId.toString() +
          ' - ' +
          this.managerAttributes.name;

        if (blob.type === 'application/pdf') {
          // Caso seja um PDF, apenas ofereça para baixar.
          saveAs(blob, fileName + '.pdf');
        } else if (blob.type === 'text/html') {
          // Caso seja um HTML, converta para um PDF formatado.
          const htmlContent = await this.documentService.getHtmlContent(blob);

          if (htmlContent) {
            // Adicionar o <header> dinamicamente ao HTML
            const sanitizedHtml = FileUtils.sanitizeHtmlContent(htmlContent);
            const updatedHtmlWithHeader = FileUtils.addHeaderToHtml(sanitizedHtml);

            // Converte as imagens no HTML para base64, se necessário
            const updatedHtml = await FileUtils.convertImagesInHtmlToBase64(
              updatedHtmlWithHeader
            );

            // Converte HTML para formato compatível com pdfMake
            const converted = htmlToPdfmake(updatedHtml);

            const documentDefinition: TDocumentDefinitions = {
              content: converted,
            };

            // Gera e baixa o PDF
            pdfMake.createPdf(documentDefinition).download(fileName + '.pdf');
          } else {
            console.error('Erro: O conteúdo HTML está vazio.');
          }
        }
      } else {
        console.error(
          'Erro ao baixar o documento: O conteúdo do arquivo não é válido.'
        );
      }
    } catch (error) {
      console.error('Erro ao baixar o documento:', error);
    } finally {
      this.uiControllers.isLoading = false;
    }
  }



  // Edita um documento HTML
  editHtmlDocument() {
    this.viewController.subtitle = 'Editar Documento.';
    // this.managerAttributes.selectedDocument = null;
    this.uiControllers.isLoading = true;
    this.uiControllers.showEditor = true;
    this.viewController.selectedModalNumber = 0;
    this.visibleButtons.showInsertDocumentButton = true;
    this.uiControllers.validProcess = true;

    if (!this.managerAttributes.documentBlob) {
      console.error('No document loaded for editing.');
      this.uiControllers.isLoading = false;  // Garantir que o loading seja desativado
      return;
    }

    this.documentService.getHtmlContent(this.managerAttributes.documentBlob).then((content: any) => {
      if (content) {
        this.managerAttributes.selectedDocumentString = content;

        // Chama o modal para editar o conteúdo

        this.uiControllers.showEditor = true;
        this.visibleButtons.showInsertDocumentButton = true;
        this.uiControllers.validProcess = true;
        this.uiControllers.isLoading = false;

        this.openEditor()
      } else {
        this.uiControllers.isLoading = false;
        console.error('Failed to load document content.');
      }
    }).catch((error: any) => {
      this.uiControllers.isLoading = false;
      console.error('Error while fetching document content:', error);
    });
  }

  openEditor() {

    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
      
    }

    this.dialogRef = this.dialog.open(EditorHtmlComponent, {
      width: '80%',
      height: '90%',
      maxWidth: '100vw',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        processIdentifier: this.managerAttributes.processIdentifier,
        documentId: this.managerAttributes.documentId,
        content: this.managerAttributes.selectedDocumentString,
      },

    });

    this.dialogRef.componentInstance.startDocumentCallback.subscribe((result: { docID: number; extension: string; name: string }) => {
      this.startDocument(result);
    });
  }

  closeEditor() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  // Inicia o processo de seleção e edição de documento
  startDocument(event: { docID: number; extension: string; name: string }) {
    this.searchDocuments((result) => {
      this.selectDocument(event, () => {
        event.extension === '.html' ? this.editHtmlDocument() : null;
      });
      this.managerAttributes.source = 'children'
    });
  }

  searchDocumentsFromParent(callback: (result: any) => void) {
    this.managerAttributes.source = 'parent';
    this.searchDocuments(callback);
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
