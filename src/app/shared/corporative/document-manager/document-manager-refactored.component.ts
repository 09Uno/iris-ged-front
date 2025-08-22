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
import { EditorHtmlComponent } from '../../../features/editor-html/editor-html.component';
import { ToolBarComponent } from '../../../features/tool-bar.component/tool-bar.component';
import { InsertDocumentComponent } from '../../insert-document/insert-document.component';

// Local services
import { DocumentService } from '../../../services/documents/document.service';
import { DocumentSearchService } from '../../../services/documents/document-search.service';

// Local models
import { AdvancedSearchRequest, AdvancedSearchResponse, SearchDocumentItem, DocumentFetchDTO } from '../../../types';

// Local utils
import { FileUtils } from '../../../utils/FileUtils';
import { FormatUtils } from '../../../utils/Formater';
import { JsTreeUtil } from '../../../utils/jsTreeUtils';
import { MessageUtil } from '../../../utils/message';

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
  // #region Properties

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

  // #endregion

  // #region Constructor and Initialization

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

  ngOnInit(): void {
    this.initializeComponent();
    this.handleRouteParameters();
  }

  private initializePdfMake(): void {
    (window as any).pdfMake.vfs = pdfFonts.vfs;
  }

  private initializeComponent(): void {
    localStorage.setItem('redirectUrl', '/documents');
    this.titleService.setTitle('Gerenciar Documentos');
    this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-filed';
    this.htmlClassAndId.cardClass = 'card card-bkg-filed';
  }

  // #endregion

  // #region Route Parameter Handling

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
      console.log('Protocolo recebido via query parameter:', protocol);
      this.setupProtocolSearch(protocol);
      this.executeAutoSearch();
    } else {
      console.log('Nenhum protocolo encontrado nos query params');
    }
  }

  private setupProtocolSearch(protocol: string): void {
    this.selectedProtocol = protocol;
    this.protocolSearch = protocol;
    this.searchType = 'protocol';
  }

  private executeAutoSearch(): void {
    setTimeout(() => {
      console.log('Disparando performSearch...');
      this.performSearch(this.defaultCallback);
    }, 500);
  }

  // #endregion

  // #region Search Methods

  async performSearch(callback: SearchCallbackFunction): Promise<void> {
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

  private async searchByProtocol(callback: SearchCallbackFunction): Promise<void> {
    console.log('searchByProtocol iniciado com protocolo:', this.protocolSearch);
    
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
            this.handleNoResults('protocolo', this.protocolSearch);
          }
        }),
        catchError((error) => {
          this.handleSearchError('protocolo');
          return of(null);
        })
      ).subscribe(() => {
        this.stopLoading();
      });
    } catch (error) {
      this.handleSearchError('protocolo');
      this.stopLoading();
    }
  }

  private async searchByIdentifier(callback: SearchCallbackFunction): Promise<void> {
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

  private async searchByDocumentName(callback: SearchCallbackFunction): Promise<void> {
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

  private async searchByProtocolTree(protocol: string, callback: SearchCallbackFunction): Promise<void> {
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
      console.error('Erro ao buscar árvore por protocolo:', error);
    }
  }

  // #endregion

  // #region Search Validation and Helpers

  private validateProtocolInput(): boolean {
    if (!this.protocolSearch.trim()) {
      console.error('Protocolo vazio!');
      MessageUtil.displayErrorMessage(this, 'Digite um protocolo para buscar.');
      return false;
    }
    return true;
  }

  private validateIdentifierInput(): boolean {
    if (!this.documentIdentifier.trim()) {
      MessageUtil.displayErrorMessage(this, 'Digite um identificador para buscar.');
      return false;
    }
    return true;
  }

  private validateDocumentNameInput(): boolean {
    if (!this.documentNameSearch.trim()) {
      MessageUtil.displayErrorMessage(this, 'Digite um nome de documento para buscar.');
      return false;
    }
    return true;
  }

  private handleIdentifierSearchSuccess(data: SearchDocumentItem[], callback: SearchCallbackFunction): void {
    const protocol = this.documentSearchService.extractProtocolFromSearchResults(data);
    this.selectedProtocol = protocol;

    if (protocol) {
      console.log('Documento encontrado, buscando árvore completa do protocolo:', protocol);
      this.searchByProtocolTree(protocol, callback);
    } else {
      this.processSearchResults(data, callback);
    }
  }

  private handleDocumentNameSearchSuccess(data: SearchDocumentItem[], callback: SearchCallbackFunction): void {
    const protocol = this.documentSearchService.extractProtocolFromSearchResults(data);
    this.selectedProtocol = protocol;

    if (protocol) {
      this.searchByProtocolTree(protocol, callback);
    } else {
      this.processSearchResults(data, callback);
    }
  }

  // #endregion

  // #region Search Result Processing

  private processSearchResults(results: SearchDocumentItem[], callback: SearchCallbackFunction): void {
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
      this.managerAttributes.processIdentifier = results[0].protocolNumber || results[0].generatedProtocol || '';
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

  // #endregion

  // #region Error and No Results Handling

  private handleNoResults(searchType: string, searchTerm: string): void {
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

  private handleSearchError(searchType: string): void {
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

  // #endregion

  // #region UI State Management

  private startLoading(): void {
    this.uiControllers.isLoading = true;
    this.messages.errorMessage = null;
    this.messages.alertMessage = null;
  }

  private stopLoading(): void {
    this.uiControllers.isLoading = false;
  }

  // #endregion

  // #region Search UI Controls

  format(event: any): void {
    if (this.searchType === 'protocol') {
      this.protocolSearch = FormatUtils.formatProcessIdentifier(this.protocolSearch);
    }
  }

  toggleSearchType(): void {
    const searchTypeOrder: SearchType[] = ['protocol', 'identifier', 'document'];
    const currentIndex = searchTypeOrder.indexOf(this.searchType);
    this.searchType = searchTypeOrder[(currentIndex + 1) % searchTypeOrder.length];
    this.clearSearchResults();
  }

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

  // #endregion

  // #region Tree Management

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

  // #endregion

  // #region Document Management

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

          if (result instanceof Blob && result.size === 0) {
            console.warn('Blob recebido está vazio (size = 0)');
            throw new Error('Documento vazio recebido do servidor');
          }

          const mimeType = FileUtils.getMimeType(extension);
          const blob = new Blob([result as BlobPart], { type: mimeType });

          this.managerAttributes.documentBlob = blob;

          if (extension === '.html') {
            await this.processHtmlDocument(blob, mimeType);
          } else {
            this.processNonHtmlDocument(blob);
          }

          this.uiControllers.isLoading = false;
          this.htmlClassAndId.cardClass = 'card card-bkg-empty';
          this.htmlClassAndId.cardJsTreeClass = 'card card-bkg-empty';

          callback();
        }),
        catchError((error) => {
          this.handleDocumentLoadError(error, name);
          return of(null);
        })
      )
      .subscribe();
  }

  private async processHtmlDocument(blob: Blob, mimeType: string): Promise<void> {
    console.log('Processando documento HTML...');
    const content = await blob.text();

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

    const updatedBlob = new Blob([doc.documentElement.outerHTML], { type: mimeType });
    this.managerAttributes.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(updatedBlob)
    );

    this.uiControllers.editableDocument = true;
  }

  private processNonHtmlDocument(blob: Blob): void {
    console.log('Processando documento não-HTML...');
    this.managerAttributes.selectedDocument = this.sanitizer.bypassSecurityTrustResourceUrl(
      URL.createObjectURL(blob)
    );
  }

  private handleDocumentLoadError(error: any, name: string): void {
    console.error('Erro ao buscar documento:', error);
    this.managerAttributes.selectedDocument = null;
    this.uiControllers.isLoading = false;
    this.htmlClassAndId.cardClass = 'card card-bkg-filed';

    let errorMessage = `Erro ao carregar o documento "${name}": ${error.message || 'Erro desconhecido'}`;

    if (error.status === 500) {
      errorMessage = `Erro interno do servidor ao carregar o documento "${name}".<br>
        Verifique se o arquivo existe no servidor ou contacte o suporte.`;
    } else if (error.status === 404) {
      errorMessage = `Documento "${name}" não encontrado no servidor.`;
    }

    MessageUtil.displayErrorMessage(this, errorMessage);
  }

  // #endregion

  // #region PDF and Download Functions

  async downloadDocumentAsPdf(): Promise<void> {
    this.uiControllers.isLoading = true;

    try {
      const blob: Blob = this.managerAttributes.documentBlob;

      if (blob) {
        const fileName = `IRIS GED - ${this.managerAttributes.documentId} - ${this.managerAttributes.name}`;

        if (blob.type === 'application/pdf') {
          saveAs(blob, fileName + '.pdf');
        } else if (blob.type === 'text/html') {
          await this.convertHtmlToPdf(blob, fileName);
        }
      } else {
        console.error('Erro ao baixar o documento: O conteúdo do arquivo não é válido.');
      }
    } catch (error) {
      console.error('Erro ao baixar o documento:', error);
    } finally {
      this.uiControllers.isLoading = false;
    }
  }

  private async convertHtmlToPdf(blob: Blob, fileName: string): Promise<void> {
    const htmlContent = await this.documentService.getHtmlContent(blob);

    if (htmlContent) {
      const sanitizedHtml = FileUtils.sanitizeHtmlContent(htmlContent);
      const updatedHtmlWithHeader = FileUtils.addHeaderToHtml(sanitizedHtml);
      const updatedHtml = await FileUtils.convertImagesInHtmlToBase64(updatedHtmlWithHeader);
      const converted = htmlToPdfmake(updatedHtml);

      const documentDefinition: TDocumentDefinitions = {
        content: converted,
      };

      pdfMake.createPdf(documentDefinition).download(fileName + '.pdf');
    } else {
      console.error('Erro: O conteúdo HTML está vazio.');
    }
  }

  // #endregion

  // #region Editor Functions

  editHtmlDocument(): void {
    this.viewController.subtitle = 'Ver Documento.';
    this.uiControllers.isLoading = true;
    this.uiControllers.showEditor = true;
    this.viewController.selectedModalNumber = 0;
    this.visibleButtons.showInsertDocumentButton = true;
    this.uiControllers.validProcess = true;

    if (!this.managerAttributes.documentBlob) {
      console.error('No document loaded for editing.');
      this.uiControllers.isLoading = false;
      return;
    }

    this.documentService.getHtmlContent(this.managerAttributes.documentBlob).then((content: any) => {
      if (content) {
        this.managerAttributes.selectedDocumentString = content;
        this.uiControllers.showEditor = true;
        this.visibleButtons.showInsertDocumentButton = true;
        this.uiControllers.validProcess = true;
        this.uiControllers.isLoading = false;
        this.openEditor();
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

    this.dialogRef.componentInstance.startDocumentCallback.subscribe((result: DocumentSelection) => {
      this.startDocument(result);
    });
  }

  closeEditor(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  // #endregion

  // #region UI Controls

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
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

  // #endregion

  // #region Modal Functions

  openInsertModal(): void {
    console.log('Abrindo modal de inserção...');
    this.showInsertModal = true;
  }

  closeInsertModal(): void {
    console.log('Fechando modal de inserção...');
    this.showInsertModal = false;
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
      console.warn('Nenhum protocolo disponível para inserir documento');
    }
  }

  async onDocumentInserted(): Promise<void> {
    console.log('Documento inserido - atualizando lista...');

    const protocolToUse = this.selectedProtocol || this.managerAttributes.processIdentifier;
    if (protocolToUse) {
      console.log('Atualizando árvore para protocolo:', protocolToUse);

      const originalProcessIdentifier = this.managerAttributes.processIdentifier;
      if (this.selectedProtocol) {
        this.managerAttributes.processIdentifier = this.selectedProtocol;
      }

      await this.searchDocuments((result) => {
        console.log('Árvore atualizada com sucesso:', result);

        if (this.selectedProtocol && originalProcessIdentifier) {
          this.managerAttributes.processIdentifier = originalProcessIdentifier;
        }
      });
    } else {
      console.warn('Nenhum protocolo disponível para atualizar árvore');
    }
  }

  // #endregion

  // #region Legacy Methods

  searchDocumentsFromParent(callback: (result: any) => void): void {
    this.managerAttributes.source = 'parent';
    this.searchDocuments(callback);
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
      const searchObservable = await this.documentService.fetchDocumentsByProcess(this.managerAttributes.processIdentifier);
      
      searchObservable.pipe(
        tap((result: any[]) => {
          if (result && result.length > 0) {
            this.handleLegacySearchSuccess(result, callback);
          } else if (!result) {
            this.handleLegacySearchError();
          } else {
            this.handleLegacyNoResults();
          }
        }),
        catchError(() => {
          this.handleLegacySearchError();
          return of([]);
        })
      ).subscribe(() => {
        this.stopLoading();
      });
    } catch (error) {
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

  startDocument(event: DocumentSelection): void {
    console.log('Iniciando documento:', event);
    // Logic to start/open document
  }

  // #endregion

  // #region Callbacks

  defaultCallback: SearchCallbackFunction = (result: any, error?: any): void => {
    console.log('Callback chamado:', { result, error });
    if (error) {
      console.error('Search error:', error);
    } else {
      console.log('Search result:', result);
      console.log('Busca automática concluída com sucesso!');
    }
  }

  // #endregion
}