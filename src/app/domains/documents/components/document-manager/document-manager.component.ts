// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Platform
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

// Angular CDK
import { Overlay } from '@angular/cdk/overlay';

// RxJS
import { catchError, of, tap } from 'rxjs';

// Third-party libraries
import { saveAs } from 'file-saver';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Local components
import { EditorHtmlComponent } from '@features/editor-html/editor-html.component';
import { ToolBarComponent } from '@features/tool-bar.component/tool-bar.component';
import { InsertDocumentComponent } from '../insert-document/insert-document.component';
import { DocumentPermissionsModalComponent } from '../document-permissions-modal/document-permissions-modal.component';
import { DocumentWorkflowModalComponent } from '../document-workflow-modal/document-workflow-modal.component';

// Local services
import { DocumentService } from '../../../../services/documents/document.service';
import { DocumentSearchService } from '../../../../services/documents/document-search.service';

// Local types
import { AdvancedSearchRequest, AdvancedSearchResponse, SearchDocumentItem, DocumentFetchDTO } from '../../../../types';

// Local utils
import { FileUtils } from '../../../../utils/FileUtils';
import { FormatUtils } from '../../../../utils/Formater';
import { JsTreeUtil } from '../../../../utils/jsTreeUtils';
import { MessageUtil } from '../../../../utils/message';

// Local config
import { 
  defaultViewController, 
  defaultManagerAttributes, 
  defaultHtmlClassAndId, 
  defaultMessages, 
  defaultUiControllers, 
  defaultVisibleButtons 
} from './document-manager-core/document-manager.config';

// Interfaces
interface DocumentSelection {
  docID: number;
  extension: string;
  name: string;
}

type SearchType = 'protocol' | 'document' | 'identifier';

interface SearchCallbackFunction {
  (result: any, error?: any): void;
}

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    ToolBarComponent,
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    MatSidenavModule,
    MatButtonModule,
    InsertDocumentComponent,
  ],
  templateUrl: './document-manager.component.html',
  styleUrls: ['./document-manager.component.scss'],
})
export class DocumentManagerComponent implements OnInit {
  // View controllers
  viewController = { ...defaultViewController };
  visibleButtons = { ...defaultVisibleButtons };
  uiControllers = { ...defaultUiControllers };
  managerAttributes = { ...defaultManagerAttributes };
  messages = { ...defaultMessages };
  htmlClassAndId = { ...defaultHtmlClassAndId };

  // UI state
  sidenavOpened = false;
  showFullscreenModal = false;
  showInsertModal = false;
  modalReady = false;
  
  // User type flags
  isProfessional = false;
  isCorporative = true;

  // Search properties
  searchType: SearchType = 'protocol';
  protocolSearch = '';
  documentNameSearch = '';
  documentIdentifier = '';
  searchResults: SearchDocumentItem[] = [];
  selectedProtocol: string | null = null;
  autoSelectDocumentId: number | null = null;

  // Dialog references
  private dialogRef: MatDialogRef<EditorHtmlComponent> | null = null;
  private overlayRef: any;

  constructor(
    private sanitizer: DomSanitizer,
    private documentService: DocumentService,
    private documentSearchService: DocumentSearchService,
    private titleService: Title,
    private overlay: Overlay,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
    this.initializePdfMake();
  }

  private initializePdfMake(): void {
    (window as any).pdfMake.vfs = pdfFonts.vfs;
  }
  ngOnInit(): void {
    this.initializeComponent();
    this.handleRouteParameters();
  }

  private initializeComponent(): void {
    localStorage.setItem('redirectUrl', '/documents');
    this.titleService.setTitle('Gerenciar Documentos');
    this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-filed';
    this.htmlClassAndId.cardClass = 'card card-bkg-filed';
  }

  private handleRouteParameters(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Query params recebidos:', params);

      this.handleDocumentIdParam(params);
      this.handleProtocolParam(params);
    });
  }

  private handleDocumentIdParam(params: any): void {
    if (params['documentId']) {
      this.autoSelectDocumentId = parseInt(params['documentId']);
      console.log('Documento para auto-seleção:', this.autoSelectDocumentId);
    }
  }

  private handleProtocolParam(params: any): void {
    if (params['protocol']) {
      const protocol = params['protocol'];
      console.log('Processo recebido via query parameter:', protocol);

      this.setupProtocolSearch(protocol);
      this.executeAutoSearch();
    } else {
      console.log('Nenhum processo encontrado nos query params');
    }
  }

  private setupProtocolSearch(protocol: string): void {
    this.selectedProtocol = protocol;
    this.protocolSearch = protocol;
    this.searchType = 'protocol';

    console.log('Configurações antes da busca:', {
      selectedProtocol: this.selectedProtocol,
      protocolSearch: this.protocolSearch,
      searchType: this.searchType,
      autoSelectDocumentId: this.autoSelectDocumentId
    });
  }

  private executeAutoSearch(): void {
    setTimeout(() => {
      console.log('Disparando performSearch...');
      this.performSearch(this.defaultCallback);
    }, 500);
  }


  private initJsTree(): void {
    this.viewController.selectedModalNumber = 0;
    const protocolToDisplay = this.selectedProtocol || this.managerAttributes.processIdentifier;

    console.log('Inicializando árvore com:', {
      elementId: this.htmlClassAndId.elementId,
      documents: this.managerAttributes.documents,
      protocol: protocolToDisplay,
      documentsCount: this.managerAttributes.documents.length
    });

    JsTreeUtil.initializeJsTree(
      this.htmlClassAndId.elementId,
      this.managerAttributes.documents,
      protocolToDisplay,
      this.onDocumentSelected.bind(this)
    );
  }

  private onDocumentSelected(docID: number, extension: string, name: string): void {
    console.log('Documento selecionado:', { docID, extension, name });
    this.selectDocument({ docID, extension, name }, () => {});
  }

  format(event: any): void {
    if (this.searchType === 'protocol') {
      this.protocolSearch = FormatUtils.formatProcessIdentifier(this.protocolSearch);
    }
  }

  toggleSearchType(): void {
    const searchTypeOrder: SearchType[] = ['protocol', 'identifier', 'document'];
    const currentIndex = searchTypeOrder.indexOf(this.searchType);
    this.searchType = searchTypeOrder[(currentIndex + 1) % searchTypeOrder.length];
    this.clearSearchFields();
  }

  // Limpa apenas os campos de busca sem destruir a árvore
  clearSearchFields(): void {
    this.searchResults = [];
    this.protocolSearch = '';
    this.documentNameSearch = '';
    this.documentIdentifier = '';
  }

  // Limpa completamente os resultados incluindo a árvore
  clearSearchResults(): void {
    this.searchResults = [];
    this.selectedProtocol = null;
    this.protocolSearch = '';
    this.documentNameSearch = '';
    this.documentIdentifier = '';
    this.managerAttributes.documents = [];
    JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);
  }

  clearRoles(): void {
    this.visibleButtons = { ...this.visibleButtons };
  }


  async performSearch(callback: (result: any) => void): Promise<void> {
    console.log('performSearch chamado com searchType:', this.searchType);

    switch (this.searchType) {
      case 'protocol':
        await this.searchByProtocol(callback);
        break;
      case 'document':
        await this.searchByDocumentName(callback);
        break;
      case 'identifier':
        await this.searchByIdentifier(callback);
        break;
    }
  }


  private async searchByProtocol(callback: (result: any) => void): Promise<void> {
    console.log('searchByProtocol iniciado com processo:', this.protocolSearch);
    
    if (!this.validateProtocolInput()) return;
    
    this.startLoading();
    
    try {
      const searchObservable = await this.documentSearchService.searchByProtocol(this.protocolSearch);
      
      searchObservable.pipe(
        tap((response: AdvancedSearchResponse) => {
          if (response.success && response.data.length > 0) {
            this.processSearchResults(response.data, callback);
            this.selectedProtocol = this.protocolSearch;
          } else {
            this.handleNoResults('processo', this.protocolSearch);
          }
        }),
        catchError((error) => {
          this.handleSearchError('processo');
          return of(null);
        })
      ).subscribe(() => {
        this.stopLoading();
      });
    } catch (error) {
      this.handleSearchError('processo');
      this.stopLoading();
    }
  }

  private validateProtocolInput(): boolean {
    if (!this.protocolSearch.trim()) {
      console.error('Processo vazio!');
      MessageUtil.displayErrorMessage(this, 'Digite um processo para buscar.');
      return false;
    }
    return true;
  }
  private async searchByIdentifier(callback: (result: any) => void): Promise<void> {
    console.log('searchByIdentifier iniciado com identificador:', this.documentIdentifier);
    
    if (!this.validateIdentifierInput()) return;
    
    this.startLoading();
    
    try {
      const searchObservable = await this.documentSearchService.searchByIdentifier(this.documentIdentifier);
      
      searchObservable.pipe(
        tap((response: AdvancedSearchResponse) => {
          if (response.success && response.data.length > 0) {
            this.handleIdentifierSearchSuccess(response.data, callback);
          } else {
            this.handleNoResults('identificador', this.documentIdentifier);
          }
        }),
        catchError((error) => {
          this.handleSearchError('identificador');
          return of(null);
        })
      ).subscribe(() => {
        this.stopLoading();
      });
    } catch (error) {
      this.handleSearchError('identificador');
      this.stopLoading();
    }
  }

  private validateIdentifierInput(): boolean {
    if (!this.documentIdentifier.trim()) {
      MessageUtil.displayErrorMessage(this, 'Digite um identificador para buscar.');
      return false;
    }
    return true;
  }

  private handleIdentifierSearchSuccess(data: SearchDocumentItem[], callback: (result: any) => void): void {
    const protocol = this.documentSearchService.extractProtocolFromSearchResults(data);
    this.selectedProtocol = protocol;

    if (protocol) {
      console.log('Documento encontrado, buscando árvore completa do processo:', protocol);
      this.searchByProtocolTree(protocol, callback);
    } else {
      this.processSearchResults(data, callback);
    }
  }

  private async searchByDocumentName(callback: (result: any) => void): Promise<void> {
    if (!this.validateDocumentNameInput()) return;
    
    this.startLoading();
    
    try {
      const searchObservable = await this.documentSearchService.searchByDocumentName(this.documentNameSearch);
      
      searchObservable.pipe(
        tap((response: AdvancedSearchResponse) => {
          if (response.success && response.data.length > 0) {
            this.handleDocumentNameSearchSuccess(response.data, callback);
          } else {
            this.handleNoResults('documento', this.documentNameSearch);
          }
        }),
        catchError((error) => {
          this.handleSearchError('documento');
          return of(null);
        })
      ).subscribe(() => {
        this.stopLoading();
      });
    } catch (error) {
      this.handleSearchError('documento');
      this.stopLoading();
    }
  }

  private validateDocumentNameInput(): boolean {
    if (!this.documentNameSearch.trim()) {
      MessageUtil.displayErrorMessage(this, 'Digite um nome de documento para buscar.');
      return false;
    }
    return true;
  }

  private handleDocumentNameSearchSuccess(data: SearchDocumentItem[], callback: (result: any) => void): void {
    const protocol = this.documentSearchService.extractProtocolFromSearchResults(data);
    this.selectedProtocol = protocol;

    if (protocol) {
      this.searchByProtocolTree(protocol, callback);
    } else {
      this.processSearchResults(data, callback);
    }
  }

  private async searchByProtocolTree(protocol: string, callback: (result: any) => void): Promise<void> {
    try {
      const searchObservable = await this.documentSearchService.searchByProtocol(protocol);
      
      searchObservable.pipe(
        tap((response: AdvancedSearchResponse) => {
          if (response.success && response.data.length > 0) {
            this.processSearchResults(response.data, callback);
          }
        }),
        catchError(() => of(null))
      ).subscribe();
    } catch (error) {
      console.error('Erro ao buscar árvore por processo:', error);
    }
  }

  private startLoading(): void {
    this.uiControllers.isLoading = true;
    this.messages.errorMessage = null;
    this.messages.alertMessage = null;
  }

  private stopLoading(): void {
    this.uiControllers.isLoading = false;
  }

  private processSearchResults(results: SearchDocumentItem[], callback: (result: any) => void): void {
    const treeData = this.documentSearchService.convertSearchResultsToTreeData(results);
    
    this.updateComponentState(treeData, results);
    this.initJsTree();
    this.updateUIClasses();
    this.handleAutoDocumentSelection(treeData);
    
    callback(treeData);
  }

  private updateComponentState(treeData: DocumentFetchDTO[], results: SearchDocumentItem[]): void {
    this.managerAttributes.documents = treeData;
    this.managerAttributes.documentCount = treeData.length;
    this.uiControllers.validProcess = true;
    this.visibleButtons.showInsertDocumentButton = true;
    this.managerAttributes.selectedDocument = null;

    if (results.length > 0) {
      this.managerAttributes.processIdentifier = results[0].processIdentifier || '';
    }
  }

  private updateUIClasses(): void {
    this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';
    this.htmlClassAndId.cardClass = 'card card-bkg-filed';
  }

  private handleAutoDocumentSelection(treeData: DocumentFetchDTO[]): void {
    if (!this.autoSelectDocumentId) return;
    
    console.log('Tentando auto-selecionar documento:', this.autoSelectDocumentId);
    const documentToSelect = treeData.find(doc => doc.id === this.autoSelectDocumentId);
    
    if (documentToSelect) {
      console.log('Documento encontrado para auto-seleção:', documentToSelect);
      this.scheduleAutoDocumentSelection(documentToSelect);
    } else {
      console.warn('Documento para auto-seleção não encontrado na árvore:', this.autoSelectDocumentId);
      this.autoSelectDocumentId = null;
    }
  }

  private scheduleAutoDocumentSelection(document: DocumentFetchDTO): void {
    setTimeout(() => {
      const selection: DocumentSelection = {
        docID: document.id,
        extension: document.fileExtension,
        name: document.fileName
      };
      
      this.selectDocument(selection, () => {
        console.log('Documento auto-selecionado com sucesso');
        this.autoSelectDocumentId = null;
      });
    }, 1000);
  }

  // Trata casos sem resultados
  handleNoResults(searchType: string, searchTerm: string) {
    this.managerAttributes.selectedDocument = null;
    this.managerAttributes.documents = [];
    this.uiControllers.validProcess = true;
    this.visibleButtons.showInsertDocumentButton = true;

    JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);

    MessageUtil.displayAlertMessage(
      this,
      `Nenhum documento foi encontrado para o ${searchType} "${searchTerm}".<br>
      Use a opção no menu para adicionar novos documentos.`
    );
  }

  // Trata erros de busca
  handleSearchError(searchType: string) {
    this.managerAttributes.documents = [];
    this.managerAttributes.selectedDocument = null;
    this.uiControllers.validProcess = false;
    this.visibleButtons.showInsertDocumentButton = false;

    JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);

    MessageUtil.displayErrorMessage(
      this,
      `Houve um erro ao tentar buscar documentos por ${searchType}.<br>
      Tente novamente ou contacte o suporte.`
    );
  }

  // Legacy method - maintained for compatibility
  async searchDocuments(callback: (result: any) => void): Promise<void> {
    this.startLoading();
    this.visibleButtons.showInsertDocumentButton = true;
    this.uiControllers.validProcess = true;

    if (this.managerAttributes.source !== 'children') {
      this.managerAttributes.processIdentifier = this.managerAttributes.processIdentifierInput;
    }

    try {
      console.log('DEBUG searchDocuments: Buscando documentos para processo:', this.managerAttributes.processIdentifier);
      const searchObservable = await this.documentService.fetchDocumentsByProcess(this.managerAttributes.processIdentifier);
      
      searchObservable.pipe(
        tap((result: any[]) => {
          console.log('DEBUG searchDocuments: Resultado da busca:', result);
          if (result && result.length > 0) {
            this.handleLegacySearchSuccess(result, callback);
          } else if (!result) {
            console.log('DEBUG searchDocuments: Resultado nulo');
            this.handleLegacySearchError();
          } else {
            console.log('DEBUG searchDocuments: Nenhum resultado encontrado');
            this.handleLegacyNoResults();
          }
        }),
        catchError((error) => {
          console.error('DEBUG searchDocuments: Erro no pipe:', error);
          this.handleLegacySearchError();
          return of([]);
        })
      ).subscribe({
        next: (result) => {
          console.log('DEBUG searchDocuments: Subscribe next:', result);
          this.stopLoading();
        },
        error: (error) => {
          console.error('DEBUG searchDocuments: Subscribe error:', error);
          this.stopLoading();
        },
        complete: () => {
          console.log('DEBUG searchDocuments: Subscribe complete');
        }
      });
    } catch (error) {
      console.error('DEBUG searchDocuments: Erro no try-catch:', error);
      this.handleLegacySearchError();
      this.stopLoading();
    }
  }

  private handleLegacySearchSuccess(result: any[], callback: (result: any) => void): void {
    this.managerAttributes.documents = result;
    this.managerAttributes.documentCount = result.length;
    this.uiControllers.validProcess = true;
    this.managerAttributes.selectedDocument = null;
    this.initJsTree();
    this.updateUIClasses();
    callback(result);
  }

  private handleLegacyNoResults(): void {
    this.managerAttributes.selectedDocument = null;
    this.managerAttributes.documents = [];
    JsTreeUtil.destroyJsTree(this.htmlClassAndId.elementId);
    this.viewController.selectedModalNumber = 0;
    this.uiControllers.validProcess = true;
    this.visibleButtons.showInsertDocumentButton = true;
    
    MessageUtil.displayAlertMessage(
      this,
      'Nenhum documento foi encontrado para o processo fornecido.<br>Use a opção no menu para adicionar novos documentos.'
    );
  }

  private handleLegacySearchError(): void {
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
       <a href="https://iris.creaba.org.br/admin/processos/create" target="_blank" rel="noopener noreferrer">
           Adicionar novo processo.
       </a>`
    );
  }

  async selectDocument(event: DocumentSelection, callback: () => void): Promise<void> {
    console.log('selectDocument chamado com:', event);
    const { docID, extension, name } = event;

    this.viewController.selectedModalNumber = 0;
    this.uiControllers.isLoading = true;
    this.viewController.subtitle = 'Ver Documento.';
    this.uiControllers.showEditor = false;
    this.managerAttributes.documentId = docID;
    this.managerAttributes.name = name;

    console.log('Buscando arquivo do documento ID:', docID);
    (await this.documentService.fetchDocumentFile(docID))
      .pipe(
        tap(async (result) => {
          console.log('Resposta do fetchDocumentFile:', result);
          console.log('Tipo do resultado:', typeof result);
          console.log('É blob?', result instanceof Blob);

          // Verificar se o blob tem conteúdo
          if (result instanceof Blob && result.size === 0) {
            console.warn('Blob recebido está vazio (size = 0)');
            throw new Error('Documento vazio recebido do servidor');
          }

          const mimeType = FileUtils.getMimeType(extension);
          console.log('MimeType determinado:', mimeType);

          const blob = new Blob([result as BlobPart], { type: mimeType });
          console.log('Blob criado:', blob, 'Size:', blob.size);

          this.managerAttributes.documentBlob = blob;

          if (extension === '.html') {
            console.log('Processando documento HTML...');
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
            console.log('Processando documento não-HTML...');
            this.managerAttributes.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(
              URL.createObjectURL(blob)
            );
          }

          console.log('selectedDocument criado:', this.managerAttributes.selectedDocument);

          this.uiControllers.isLoading = false;
          this.htmlClassAndId.cardClass = 'card card-bkg-empty';
          this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';

          console.log('Chamando callback...');
          callback();
        }),
        catchError((error) => {
          console.error('Erro ao buscar documento:', error);
          this.managerAttributes.selectedDocument = null;
          this.uiControllers.isLoading = false;
          this.htmlClassAndId.cardClass = 'card card-bkg-filed';

          // Mostrar mensagem de erro específica
          if (error.status === 500) {
            MessageUtil.displayErrorMessage(
              this,
              `Erro interno do servidor ao carregar o documento "${name}".<br>
              Verifique se o arquivo existe no servidor ou contacte o suporte.`
            );
          } else if (error.status === 404) {
            MessageUtil.displayErrorMessage(
              this,
              `Documento "${name}" não encontrado no servidor.`
            );
          } else {
            MessageUtil.displayErrorMessage(
              this,
              `Erro ao carregar o documento "${name}": ${error.message || 'Erro desconhecido'}`
            );
          }

          return of(null);
        })
      )
      .subscribe();
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }


  async downloadDocumentAsPdf(): Promise<void> {
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



  editHtmlDocument(): void {
    this.viewController.subtitle = 'Ver Documento.';
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

  openEditor(): void {

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

  closeEditor(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  // ========================================
  // 🔐 PERMISSÕES E WORKFLOW
  // ========================================

  openPermissionsModal(): void {
    if (!this.managerAttributes.documentId) {
      alert('Nenhum documento selecionado');
      return;
    }

    this.dialog.open(DocumentPermissionsModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        documentId: this.managerAttributes.documentId,
        documentName: this.managerAttributes.name
      }
    });
  }

  openWorkflowModal(): void {
    if (!this.managerAttributes.documentId) {
      alert('Nenhum documento selecionado');
      return;
    }

    this.dialog.open(DocumentWorkflowModalComponent, {
      width: '900px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        documentId: this.managerAttributes.documentId,
        documentName: this.managerAttributes.name,
        protocol: this.selectedProtocol || this.managerAttributes.processIdentifier
      }
    });
  }

  async cancelDocument(): Promise<void> {
    if (!this.managerAttributes.documentId) {
      MessageUtil.displayErrorMessage(this, 'Nenhum documento selecionado');
      return;
    }

    const reason = prompt(
      `Deseja realmente cancelar o documento "${this.managerAttributes.name}"?\n\n` +
      'Por favor, informe o motivo do cancelamento:'
    );

    if (!reason || reason.trim() === '') {
      return;
    }

    this.uiControllers.isLoading = true;

    try {
      // Pegar userId do AuthService ou usar valor padrão
      const userId = 1; // TODO: Implementar método para pegar userId do usuário logado

      const cancelObservable = await this.documentService.cancelDocument(
        this.managerAttributes.documentId,
        userId,
        reason.trim()
      );

      cancelObservable.pipe(
        tap(() => {
          MessageUtil.displayAlertMessage(
            this,
            `Documento "${this.managerAttributes.name}" cancelado com sucesso.`
          );
          this.managerAttributes.documentCancelled = true;
        }),
        catchError((error) => {
          MessageUtil.displayErrorMessage(
            this,
            `Erro ao cancelar documento: ${error.message || 'Erro desconhecido'}`
          );
          return of(null);
        })
      ).subscribe(() => {
        this.uiControllers.isLoading = false;
      });
    } catch (error) {
      console.error('Erro ao cancelar documento:', error);
      MessageUtil.displayErrorMessage(this, 'Erro ao cancelar documento');
      this.uiControllers.isLoading = false;
    }
  }

  async reactivateDocument(): Promise<void> {
    if (!this.managerAttributes.documentId) {
      MessageUtil.displayErrorMessage(this, 'Nenhum documento selecionado');
      return;
    }

    const reason = prompt(
      `Deseja realmente reativar o documento "${this.managerAttributes.name}"?\n\n` +
      'Por favor, informe o motivo da reativação:'
    );

    if (!reason || reason.trim() === '') {
      return;
    }

    this.uiControllers.isLoading = true;

    try {
      // Pegar userId do AuthService ou usar valor padrão
      const userId = 1; // TODO: Implementar método para pegar userId do usuário logado

      const reactivateObservable = await this.documentService.reactivateDocument(
        this.managerAttributes.documentId,
        userId,
        reason.trim()
      );

      reactivateObservable.pipe(
        tap(() => {
          MessageUtil.displayAlertMessage(
            this,
            `Documento "${this.managerAttributes.name}" reativado com sucesso.`
          );
          this.managerAttributes.documentCancelled = false;
        }),
        catchError((error) => {
          MessageUtil.displayErrorMessage(
            this,
            `Erro ao reativar documento: ${error.message || 'Erro desconhecido'}`
          );
          return of(null);
        })
      ).subscribe(() => {
        this.uiControllers.isLoading = false;
      });
    } catch (error) {
      console.error('Erro ao reativar documento:', error);
      MessageUtil.displayErrorMessage(this, 'Erro ao reativar documento');
      this.uiControllers.isLoading = false;
    }
  }

  searchDocumentsFromParent(callback: (result: any) => void): void {
    this.managerAttributes.source = 'parent';
    this.searchDocuments(callback);
  }


  // Modal functions for document insertion
  openInsertModal(): void {
    console.log('Abrindo modal de inserção...');
    this.showInsertModal = true;
  }

  closeInsertModal(): void {
    console.log('Fechando modal de inserção...');
    this.showInsertModal = false;
  }

  private documentToOpen: {id: number, name: string} | null = null;

  onDocumentInsertedAndOpen(documentData: {id: number, name: string}): void {
    console.log('DEBUG: onDocumentInsertedAndOpen chamado com:', documentData);
    this.documentToOpen = documentData;
    console.log('DEBUG: documentToOpen definido como:', this.documentToOpen);
  }

  async onDocumentInserted(): Promise<void> {
    console.log('Documento inserido - atualizando lista...');

    try {
      const protocolToUse = this.selectedProtocol || this.managerAttributes.processIdentifier;
      console.log('DEBUG: protocolToUse:', protocolToUse);
      
      if (protocolToUse) {
        console.log('Atualizando árvore para processo usando advancedSearch:', protocolToUse);

        // Usar searchByProtocol que utiliza advancedSearch
        this.protocolSearch = protocolToUse;
        this.searchType = 'protocol';
        
        await this.searchByProtocol((result) => {
          console.log('Árvore atualizada com sucesso via advancedSearch:', result);
          console.log('DEBUG: documentToOpen após atualização:', this.documentToOpen);
          console.log('DEBUG: documentos na árvore:', this.managerAttributes.documents?.length);
          
          // Após atualizar a árvore, abrir o documento se foi solicitado
          if (this.documentToOpen) {
            console.log('DEBUG: Tentando abrir documento recém-inserido:', this.documentToOpen);
            setTimeout(() => {
              this.openDocumentById(this.documentToOpen!.id);
              this.documentToOpen = null;
            }, 1000); // Dar um tempo para a árvore ser montada
          } else {
            console.log('DEBUG: Nenhum documento para abrir automaticamente');
          }
        });
      } else {
        console.warn('Nenhum processo disponível para atualizar árvore');
      }
    } catch (error: unknown) {
      console.error('ERRO em onDocumentInserted:', error);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
    }
  }

  private openDocumentById(documentId: number): void {
    console.log('DEBUG: openDocumentById - Tentando abrir documento com ID:', documentId);
    console.log('DEBUG: openDocumentById - Total documentos disponíveis:', this.managerAttributes.documents?.length);
    console.log('DEBUG: openDocumentById - Primeiros 3 documentos:', this.managerAttributes.documents?.slice(0, 3));
    
    // Encontrar o documento na árvore atual
    const document = this.managerAttributes.documents?.find((doc: any) => {
      console.log('DEBUG: Comparando doc.id:', doc.id, 'com documentId:', documentId, 'tipos:', typeof doc.id, typeof documentId);
      return doc.id === documentId || doc.id === documentId.toString() || doc.id.toString() === documentId.toString();
    });
    
    if (document) {
      console.log('DEBUG: Documento encontrado na árvore, abrindo:', document);
      
      // Simular o evento de seleção do documento
      const documentSelection: DocumentSelection = {
        docID: document.id,
        extension: document.extension || 'pdf',
        name: document.name
      };
      
      console.log('DEBUG: Chamando startDocument com:', documentSelection);
      this.startDocument(documentSelection);
    } else {
      console.warn('DEBUG: Documento não encontrado na árvore atualizada. ID procurado:', documentId);
      console.warn('DEBUG: IDs disponíveis:', this.managerAttributes.documents?.map((doc: any) => doc.id));
    }
  }

  startDocument(event: DocumentSelection): void {
    console.log('Iniciando documento:', event);
    // Logic to start/open document
  }

  openFullscreen(): void {
    if (this.managerAttributes.selectedDocument) {
      this.showFullscreenModal = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeFullscreen(): void {
    this.showFullscreenModal = false;
    document.body.style.overflow = 'auto';
  }

  openInsertDocumentModal(): void {
    const protocolToUse = this.selectedProtocol || this.managerAttributes.processIdentifier;
    console.log('openInsertDocumentModal:', {
      selectedProtocol: this.selectedProtocol,
      processIdentifier: this.managerAttributes.processIdentifier,
      protocolToUse: protocolToUse
    });

    if (protocolToUse) {
      this.showInsertModal = true;
      this.modalReady = false;

      setTimeout(() => {
        this.modalReady = true;
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      console.warn('Nenhum processo disponível para inserir documento');
    }
  }




  defaultCallback: SearchCallbackFunction = (result: any, error?: any): void => {
    console.log('Callback chamado:', { result, error });
    if (error) {
      console.error('Search error:', error);
    } else {
      console.log('Search result:', result);
      console.log('Busca automática concluída com sucesso!');
    }
  }


}
