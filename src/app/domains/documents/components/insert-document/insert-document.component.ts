// #region Imports
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolBarComponent } from '@features/tool-bar.component/tool-bar.component';
import GedApiService from '../../../../ged.api.service';
import { NewDocumentDTO, DocumentType } from '../../../../types';
import { DocumentService } from '../../../../services/documents/document.service';
import { SectorService } from '../../../../services/sector/sector.service';
import { Sector } from '../../../../types/sector.types';
// #endregion

// #region Component Declaration
@Component({
  selector: 'app-insert-document',
  standalone: true,
  imports: [
    ToolBarComponent,
    MatIconModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './insert-document.component.html',
  styleUrl: './insert-document.component.scss'
})
export class InsertDocumentComponent implements OnInit {
  // #region Properties
  @Input() modal: number = 0; // 0 = página independente, 1 = modal
  @Input() processIdentifier: string = ''; // Processo passado pelo parent
  @Output() fazerBuscaDocumentos = new EventEmitter<void>(); // Callback após inserir documento
  @Output() startDocumentCallback = new EventEmitter<any>(); // Callback de início de documento
  @Output() documentSaved = new EventEmitter<void>(); // Para fechar modal quando concluído
  @Output() documentInserted = new EventEmitter<{id: number, name: string}>(); // Para abrir documento após inserir

  title = 'Registrar Documentos';
  isProfessional: boolean = false;
  isCorporative: boolean = true;

  // Form data
  formData = {
    nome: '',
    dataDocumento: '',
    tipoDocumentoId: 0,
    assunto: '',
    interessadoNome: '',
    remetenteNome: '',
    destinatarioNome: '',
    orgaoOrigem: '',
    unidadeOrigem: '',
    publico: false,
    confidencial: false,
    observacoes: '',
    palavrasChave: '',
    useManualProtocol: 'false',
    manualProtocolNumber: '',
    setorId: undefined as number | undefined,
    // Campos SEI
    nivelAcesso: 'Publico' as 'Publico' | 'Restrito' | 'Sigiloso',
    nivelRestricao: undefined as 'None' | 'Usuario' | 'Unidade' | undefined,
    hipoteseLegal: ''
  };

  // Process received from navigation (automatic)
  existingProcess: string = '';

  selectedFile: File | null = null;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;
  showSuccessModal = false;
  lastInsertedDocumentId: number | null = null;
  lastInsertedDocumentProtocol: string | null = null;

  // Opções para os selects
  tiposDocumento: DocumentType[] = [];
  setores: Sector[] = [];

  orgaosOrigem = [
    'Plenária',
    'Câmara de Civil',
    'Secretaria',
    'Presidência'
  ];

  // Permissões
  showPermissionsSection = false;
  restrictedAccess = false;
  // #endregion

  // #region Constructor
  constructor(
    private titleService: Title,
    private gedApiService: GedApiService,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private router: Router,
    private sectorService: SectorService
  ) { }
  // #endregion

  // #region Lifecycle Methods
  async ngOnInit() {
    this.titleService.setTitle('Registrar Documentos');
    // Set default date to today
    this.formData.dataDocumento = new Date().toISOString().split('T')[0];

    // Load document types and sectors
    await this.loadDocumentTypes();
    await this.loadSectors();

    console.log('InsertDocumentComponent ngOnInit:', {
      modal: this.modal,
      processIdentifier: this.processIdentifier
    });

    // If modal mode and processIdentifier is provided, use it
    if (this.modal === 1 && this.processIdentifier) {
      this.existingProcess = this.processIdentifier;
      console.log('Modal mode: Using processIdentifier as process:', this.existingProcess);
      console.log('DEBUG: processIdentifier definido para existingProcess:', this.existingProcess);
      return;
    }

    // Check for existing process from route parameters/query (for standalone page)
    this.route.queryParams.subscribe(params => {
      if (params['protocol']) {
        this.existingProcess = params['protocol'];
        console.log('Route mode: Received existing process:', this.existingProcess);
      }
    });

    // Also check route data in case process is passed via data
    this.route.data.subscribe(data => {
      if (data['protocol']) {
        this.existingProcess = data['protocol'];
        console.log('Route mode: Received existing process via data:', this.existingProcess);
      }
    });



  }
  // #endregion

  // #region Event Handlers
  onPublicoChange(value: boolean): void {
    this.formData.publico = value;
    if (value) {
      this.formData.confidencial = false;
    }
  }

  onConfidencialChange(value: boolean): void {
    this.formData.confidencial = value;
    if (value) {
      this.formData.publico = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validação de tipo de arquivo se necessário
      const allowedTypes = ['application/pdf', 'audio/mp3', 'video/mp4',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (allowedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.mp3')) {
        this.selectedFile = file;
        this.submitMessage = '';
      } else {
        this.submitMessage = 'Tipo de arquivo não permitido. Selecione PDF, DOC, DOCX, MP3 ou MP4.';
        this.submitSuccess = false;
        event.target.value = '';
      }
    }
  }

  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';

    try {
      console.log('DEBUG: Preparando DTO com existingProcess:', this.existingProcess);
      console.log('DEBUG: Modal mode:', this.modal);
      console.log('DEBUG: processIdentifier recebido:', this.processIdentifier);
      
      // Prepare the DTO
      const documento: NewDocumentDTO = {
        name: this.formData.nome,
        documentDate: this.formData.dataDocumento,
        file: this.selectedFile!,
        documentTypeId: this.formData.tipoDocumentoId,
        subject: this.formData.assunto || undefined,
        interestedPartyName: this.formData.interessadoNome || undefined,
        senderName: this.formData.remetenteNome || undefined,
        recipientName: this.formData.destinatarioNome || undefined,
        originAgency: this.formData.orgaoOrigem || undefined,
        originUnit: this.formData.unidadeOrigem || undefined,
        status: 'ACTIVE',
        isPublic: this.formData.publico,
        isConfidential: this.formData.confidencial,
        observations: this.formData.observacoes || undefined,
        keywords: this.formData.palavrasChave || undefined,
        creatorUserId: 0,
        DocumentNumber: this.getDocumentNumber(),
        useManualProtocol: this.shouldUseManualProtocol(),
        manualProtocolNumber: this.formData.useManualProtocol === 'true' ? this.formData.manualProtocolNumber || undefined : undefined,

        // 🔐 Permissões e Workflow
        sectorId: this.formData.setorId || undefined,
        restrictedAccess: this.restrictedAccess,

        // 📋 Modelo SEI
        nivelAcesso: this.formData.nivelAcesso,
        nivelRestricao: this.formData.nivelRestricao,
        hipoteseLegal: this.formData.hipoteseLegal || undefined
      };

      console.log('DEBUG: formData.useManualProtocol ANTES da conversão:', this.formData.useManualProtocol);
      console.log('DEBUG: typeof formData.useManualProtocol:', typeof this.formData.useManualProtocol);
      console.log('DEBUG: existingProcess:', this.existingProcess);
      console.log('DEBUG: DocumentNumber no DTO:', documento.DocumentNumber);
      console.log('DEBUG: useManualProtocol no DTO:', documento.useManualProtocol);
      console.log('DEBUG: manualProtocolNumber no DTO:', documento.manualProtocolNumber);
      console.log('DEBUG: DTO completo:', documento);

      const response = await this.gedApiService.saveNewDocument(documento);

      response.subscribe({
        next: (result) => {
          console.log('Document saved successfully:', result);
          this.submitMessage = result.body?.message || 'Documento salvo com sucesso!';
          this.submitSuccess = true;
          this.showSuccessModal = true;
          
          // Capturar ID e protocolo do documento inserido
          console.log('DEBUG: Full response:', result);
          console.log('DEBUG: result.body:', result.body);
          const documentId = result.body?.data?.id || result.body?.id || result.body?.documentId;
          
          // Se o protocolo não vier na resposta, usar o DocumentNumber do DTO que foi enviado
          let protocol = result.body?.data?.protocol || result.body?.protocol || result.body?.documentNumber;
          if (!protocol) {
            protocol = documento.DocumentNumber;
            console.log('DEBUG: Usando DocumentNumber do DTO como protocol:', protocol);
          }
          
          console.log('DEBUG: Document ID from response:', documentId);
          console.log('DEBUG: Document Protocol from response:', protocol);
          
          // Armazenar o ID e protocolo do documento para redirecionamento
          this.lastInsertedDocumentId = documentId;
          this.lastInsertedDocumentProtocol = protocol;
          
          this.resetForm();

          // If in modal mode, emit event to parent component
          if (this.modal === 1) {
            // Emit document data for auto-opening
            if (documentId) {
              console.log('DEBUG: Emitindo documentInserted:', { id: documentId, name: documento.name });
              this.documentInserted.emit({
                id: documentId,
                name: documento.name
              });
            } else {
              console.warn('DEBUG: DocumentId não encontrado na resposta, não emitindo evento');
            }
            
            setTimeout(() => {
              this.fazerBuscaDocumentos.emit();
              setTimeout(() => {
                this.documentSaved.emit(); // Close modal after tree update
              }, 500);
            }, 2000); // Wait longer for user to see success message
          }
        },
        error: (error) => {
          console.error('Error saving document:', error);
          this.submitMessage = error.error?.message || 'Erro ao salvar documento. Tente novamente.';
          this.submitSuccess = false;
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
          // Redirect to document viewer if not in modal mode
          if (this.modal === 0) {
            const documentId = this.getLastDocumentId();
            console.log('DEBUG: Tentando redirecionar com documentId:', documentId);
            if (documentId) {
              // Buscar o documento completo pela API para pegar o protocolo
              this.fetchDocumentAndRedirect(documentId);
            } else {
              console.log('DEBUG: Faltando documentId para redirecionamento, indo para pesquisar-documentos');
              this.router.navigate(['/pesquisar-documentos']);
            }
          }
        }
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      this.submitMessage = 'Erro ao processar solicitação. Tente novamente.';
      this.submitSuccess = false;
      this.isSubmitting = false;
    }
  }
  // #endregion

  // #region Validation Methods
  validateForm(): boolean {
    if (!this.formData.nome.trim()) {
      this.submitMessage = 'Nome do documento é obrigatório.';
      this.submitSuccess = false;
      return false;
    }

    if (!this.formData.dataDocumento) {
      this.submitMessage = 'Data do documento é obrigatória.';
      this.submitSuccess = false;
      return false;
    }

    if (this.formData.tipoDocumentoId === 0) {
      this.submitMessage = 'Tipo de documento é obrigatório.';
      this.submitSuccess = false;
      return false;
    }

    // Validar numeração manual quando for o caso
    if (!this.existingProcess && this.formData.useManualProtocol === 'true') {
      if (!this.formData.manualProtocolNumber || !this.formData.manualProtocolNumber.trim()) {
        this.submitMessage = 'Número do processo é obrigatório quando escolhida a numeração manual.';
        this.submitSuccess = false;
        return false;
      }

      if (this.formData.manualProtocolNumber.trim().length < 3) {
        this.submitMessage = 'Número do processo deve ter pelo menos 3 caracteres.';
        this.submitSuccess = false;
        return false;
      }
    }

    // ✅ Validações SEI
    if (!this.validateSEIRules()) {
      return false;
    }

    if (!this.selectedFile) {
      this.submitMessage = 'Selecione um arquivo.';
      this.submitSuccess = false;
      return false;
    }

    return true;
  }

  // ✅ Validação do Modelo SEI
  validateSEIRules(): boolean {
    // REGRA SEI: Documentos restritos/sigilosos exigem hipótese legal
    if (this.formData.nivelAcesso === 'Restrito' || this.formData.nivelAcesso === 'Sigiloso') {
      if (!this.formData.hipoteseLegal?.trim()) {
        this.submitMessage = 'Hipótese legal é obrigatória para documentos restritos/sigilosos (Lei 12.527/2011)';
        this.submitSuccess = false;
        return false;
      }

      if (!this.formData.nivelRestricao) {
        this.submitMessage = 'Defina o nível de restrição (Usuário ou Unidade)';
        this.submitSuccess = false;
        return false;
      }
    }

    return true;
  }

  // Getter para usar no template e evitar erro de tipo do Angular
  get isDocumentoRestrito(): boolean {
    return this.formData.nivelAcesso !== 'Publico';
  }
  // #endregion

  // #region Utility Methods
  resetForm() {
    this.formData = {
      nome: '',
      dataDocumento: new Date().toISOString().split('T')[0],
      tipoDocumentoId: 0,
      assunto: '',
      interessadoNome: '',
      remetenteNome: '',
      destinatarioNome: '',
      orgaoOrigem: '',
      unidadeOrigem: '',
      publico: false,
      confidencial: false,
      observacoes: '',
      palavrasChave: '',
      useManualProtocol: 'false',
      manualProtocolNumber: '',
      setorId: undefined,
      // Campos SEI
      nivelAcesso: 'Publico' as 'Publico' | 'Restrito' | 'Sigiloso',
      nivelRestricao: undefined as 'None' | 'Usuario' | 'Unidade' | undefined,
      hipoteseLegal: ''
    };
    // Don't reset existingProcess as it comes from navigation
    this.selectedFile = null;
    this.restrictedAccess = false;
    this.showPermissionsSection = false;

    // Clear file input
    const fileInput = document.getElementById('arquivo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onCancel() {
    this.resetForm();
    this.submitMessage = '';
  }

  getTipoNome(tipoId: number): string {
    const tipo = this.tiposDocumento.find(t => t.id === tipoId);
    return tipo ? tipo.name : '';
  }

  shouldUseManualProtocol(): boolean {
    // Se existe processo existente (modal mode), nunca usar manual protocol
    if (this.existingProcess) {
      console.log('DEBUG: existingProcess existe, forçando useManualProtocol = false');
      return false;
    }
    
    // Senão, usar o valor do formulário
    const result = this.formData.useManualProtocol === 'true';
    console.log('DEBUG: shouldUseManualProtocol resultado:', result);
    return result;
  }

  getDocumentNumber(): string | undefined {
    // Se existe processo existente (modal mode), usar ele
    if (this.existingProcess) {
      console.log('DEBUG: Usando existingProcess:', this.existingProcess);
      return this.existingProcess;
    }
    
    // Se está usando numeração manual, usar o número manual
    if (this.formData.useManualProtocol === 'true' && this.formData.manualProtocolNumber?.trim()) {
      console.log('DEBUG: Usando número manual como processIdentifier:', this.formData.manualProtocolNumber.trim());
      return this.formData.manualProtocolNumber.trim();
    }
    
    // Caso contrário, deixar undefined para gerar automaticamente
    console.log('DEBUG: Deixando undefined para gerar automaticamente');
    return undefined;
  }

  getLastDocumentId(): number | null {
    return this.lastInsertedDocumentId;
  }

  getDocumentProtocol(): string | null {
    return this.lastInsertedDocumentProtocol;
  }

  async fetchDocumentAndRedirect(documentId: number): Promise<void> {
    try {
      console.log('DEBUG: Buscando documento completo para pegar protocolo, documentId:', documentId);
      
      // Fazer busca simples pelo ID do documento
      const searchRequest = {
        searchText: '',
        documentId: documentId,
        page: 0,
        pageSize: 1
      };
      
      const searchObservable = await this.gedApiService.advancedSearch(searchRequest);
      
      searchObservable.subscribe({
        next: (response: any) => {
          console.log('DEBUG: Resposta da busca do documento:', response);
          
          if (response.success && response.data && response.data.length > 0) {
            const document = response.data[0];
            const protocol = document.processIdentifier || document.generatedProtocol;
            
            console.log('DEBUG: Documento encontrado:', document);
            console.log('DEBUG: Protocol encontrado:', protocol);
            
            if (protocol) {
              // Navegar com protocolo e documentId (igual ao dashboard)
              this.router.navigate(['/documentos'], {
                queryParams: {
                  protocol: protocol,
                  documentId: documentId
                }
              });
            } else {
              // Navegar apenas com documentId
              this.router.navigate(['/documentos'], {
                queryParams: { documentId: documentId }
              });
            }
          } else {
            console.log('DEBUG: Documento não encontrado na busca, navegando só com ID');
            this.router.navigate(['/documentos'], {
              queryParams: { documentId: documentId }
            });
          }
        },
        error: (error) => {
          console.error('DEBUG: Erro ao buscar documento:', error);
          // Em caso de erro, navegar mesmo assim só com o ID
          this.router.navigate(['/documentos'], {
            queryParams: { documentId: documentId }
          });
        }
      });
      
    } catch (error) {
      console.error('DEBUG: Erro ao buscar documento completo:', error);
      // Em caso de erro, navegar mesmo assim só com o ID
      this.router.navigate(['/documentos'], {
        queryParams: { documentId: documentId }
      });
    }
  }

  async loadDocumentTypes() {
    console.log('loadDocumentTypes called');
    try {
      console.log('Calling documentService.getDocumentsTypes()...');
      const observable = await this.documentService.getDocumentsTypes();
      console.log('Observable received, subscribing...');
      observable.subscribe({
        next: (types: DocumentType[]) => {
          console.log('Document types received:', types);
          this.tiposDocumento = types;
          console.log('Document types loaded:', this.tiposDocumento);
        },
        error: (error) => {
          console.error('Error loading document types:', error);
        }
      });
    } catch (error) {
      console.error('Error calling getDocumentsTypes:', error);
    }
  }

  async loadSectors() {
    console.log('loadSectors called');
    try {
      const observable = await this.sectorService.getActiveSectors();
      observable.subscribe({
        next: (sectors: Sector[]) => {
          this.setores = sectors;
          console.log('Sectors loaded:', this.setores);
        },
        error: (error) => {
          console.error('Error loading sectors:', error);
        }
      });
    } catch (error) {
      console.error('Error calling getActiveSectors:', error);
    }
  }
  // #endregion
}