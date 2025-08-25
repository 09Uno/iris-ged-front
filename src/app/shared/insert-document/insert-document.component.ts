import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToolBarComponent } from '../../features/tool-bar.component/tool-bar.component';
import GedApiService from '../../ged.api.service';
import { NewDocumentDTO, DocumentType } from '../../types';
import { DocumentService } from '../../services/documents/document.service';

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
  @Input() modal: number = 0; // 0 = página independente, 1 = modal
  @Input() processIdentifier: string = ''; // Protocolo passado pelo parent
  @Output() fazerBuscaDocumentos = new EventEmitter<void>(); // Callback após inserir documento
  @Output() startDocumentCallback = new EventEmitter<any>(); // Callback de início de documento
  @Output() documentSaved = new EventEmitter<void>(); // Para fechar modal quando concluído
  
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
    palavrasChave: ''
  };
  
  // Protocol received from navigation (automatic)
  existingProtocol: string = '';

  selectedFile: File | null = null;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;
  showSuccessModal = false;

  // Opções para os selects
  tiposDocumento : DocumentType[] = [];


  orgaosOrigem = [
    'Plenária',
    'Câmara de Civil',
    'Secretaria',
    'Presidência'
  ];

  constructor(
    private titleService: Title,
    private gedApiService: GedApiService,
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) { }

  async ngOnInit() {
    this.titleService.setTitle('Registrar Documentos');
    // Set default date to today
    this.formData.dataDocumento = new Date().toISOString().split('T')[0];

    // Load document types
    await this.loadDocumentTypes();
    
    console.log('InsertDocumentComponent ngOnInit:', {
      modal: this.modal,
      processIdentifier: this.processIdentifier
    });
    
    // If modal mode and processIdentifier is provided, use it
    if (this.modal === 1 && this.processIdentifier) {
      this.existingProtocol = this.processIdentifier;
      console.log('Modal mode: Using processIdentifier as protocol:', this.existingProtocol);
      return;
    }
    
    // Check for existing protocol from route parameters/query (for standalone page)
    this.route.queryParams.subscribe(params => {
      if (params['protocol']) {
        this.existingProtocol = params['protocol'];
        console.log('Route mode: Received existing protocol:', this.existingProtocol);
      }
    });
    
    // Also check route data in case protocol is passed via data
    this.route.data.subscribe(data => {
      if (data['protocol']) {
        this.existingProtocol = data['protocol'];
        console.log('Route mode: Received existing protocol via data:', this.existingProtocol);
      }
    });

    

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
        event.target.value = ''; // Clear the input
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
        creatorUserId: 1, // TODO: Get from auth service
        // Automatic protocol from navigation (backend will generate identifier: prefix + random number)
        existingProtocol: this.existingProtocol || undefined
      };

      const response = await this.gedApiService.saveNewDocument(documento);
      
      response.subscribe({
        next: (result) => {
          console.log('Document saved successfully:', result);
          this.submitMessage = result.body?.message || 'Documento salvo com sucesso!';
          this.submitSuccess = true;
          this.showSuccessModal = true;
          this.resetForm();
          
          // If in modal mode, emit event to parent component
          if (this.modal === 1) {
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
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      this.submitMessage = 'Erro ao processar solicitação. Tente novamente.';
      this.submitSuccess = false;
      this.isSubmitting = false;
    }
  }

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

    if (!this.selectedFile) {
      this.submitMessage = 'Selecione um arquivo.';
      this.submitSuccess = false;
      return false;
    }

    return true;
  }

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
      palavrasChave: ''
    };
    // Don't reset existingProtocol as it comes from navigation
    this.selectedFile = null;
    
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
}