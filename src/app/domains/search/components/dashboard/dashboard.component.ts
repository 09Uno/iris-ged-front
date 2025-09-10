// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ToolBarComponent } from '@features/tool-bar.component/tool-bar.component';
import GedApiService from '../../../../ged.api.service';
import { AdvancedSearchRequest, AdvancedSearchResponse, SearchDocumentItem } from '../../../../types';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule, ToolBarComponent] 
})
export class DashboardComponent implements OnInit {
  
  // Propriedades do controlador de visualização
  viewController = {
    title: 'Sistema de Gestão Eletrônica de Documentos',
    subtitle: 'Documentos Recentes'
  };

  // Atributos do gerenciador
  managerAttributes = {
    searchInput: '',
    selectedDocument: null as SearchDocumentItem | null,
    documentCount: 0,
    searchResults: [] as SearchDocumentItem[]
  };

  // Controladores de UI
  uiControllers = {
    isLoading: false,
    validSearch: false
  };

  // Botões visíveis
  visibleButtons = {
    showInsertDocumentButton: false
  };

  // Mensagens
  messages = {
    errorMessage: '',
    alertMessage: ''
  };

  // Classes HTML
  htmlClassAndId = {
    cardClass: 'card',
    cardJsTreeClass: 'card'
  };

  // Flags de perfil
  isProfessional = false;
  isCorporative = true;

  // Filtros de pesquisa inclusivos
  searchFilters = {
    searchType: 'documentos',
    gerados: false,
    externos: false,
    textoPesquisa: '',
    numeroDocumento: '',
    assunto: '',
    orgaoGerador: '',
    tipoDocumento: '',
    autor: '',
    interessado: false,
    remetente: false,
    destinatario: false,
    periodoExplicito: false,
    periodo30dias: false,
    periodo60dias: false,
    dataInicio: '',
    dataFim: ''
  };


  // Método para quando o tipo de pesquisa muda
  onSearchTypeChange(): void {
    this.validateSearch();
  }

  constructor(private gedApiService: GedApiService, private router: Router) { }

  ngOnInit(): void {
    // Inicialização do componente
    this.validateSearch();
    
    // Carregar documentos mais recentes automaticamente
    this.loadRecentDocuments();
  }


  // Validar se pode fazer busca (mais inclusivo)
  validateSearch(): void {
    this.uiControllers.validSearch = true;
  }

  // Carregar documentos mais recentes automaticamente
  async loadRecentDocuments(): Promise<void> {
    this.uiControllers.isLoading = true;
    this.messages.errorMessage = '';
    this.messages.alertMessage = 'Carregando documentos mais recentes...';
    
    try {
      // Buscar documentos mais recentes ordenados por data de criação
      const searchRequest: AdvancedSearchRequest = {
        searchType: 'documents',
        includeGenerated: true,
        includeExternal: true,
        page: 0,
        pageSize: 20, // Carregar os 20 mais recentes
        orderBy: 'createdAt', // Ordenar por data de criação
        orderDirection: 'DESC'
      };

      const searchObservable = await this.gedApiService.advancedSearch(searchRequest);
      
      searchObservable.subscribe({
        next: (response: AdvancedSearchResponse) => {
          if (response.success) {
            this.managerAttributes.searchResults = response.data;
            this.managerAttributes.documentCount = response.pagination.totalCount;
            this.messages.alertMessage = `Ultimos documentos carregados. `;
          } else {
            this.messages.errorMessage = response.message || 'Erro ao carregar documentos recentes.';
            this.managerAttributes.documentCount = 0;
            this.managerAttributes.searchResults = [];
            this.messages.alertMessage = '';
          }
          this.uiControllers.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar documentos recentes:', error);
          this.messages.errorMessage = 'Erro ao carregar documentos recentes. Tente novamente.';
          this.managerAttributes.documentCount = 0;
          this.managerAttributes.searchResults = [];
          this.messages.alertMessage = '';
          this.uiControllers.isLoading = false;
        }
      });
      
    } catch (error) {
      console.error('Erro ao carregar documentos recentes:', error);
      this.messages.errorMessage = 'Erro ao carregar documentos recentes. Tente novamente.';
      this.managerAttributes.documentCount = 0;
      this.managerAttributes.searchResults = [];
      this.messages.alertMessage = '';
      this.uiControllers.isLoading = false;
    }
  }

  // Buscar documentos
  async searchDocuments(): Promise<void> {
    if (!this.uiControllers.validSearch) return;
    
    this.uiControllers.isLoading = true;
    this.messages.errorMessage = '';
    this.messages.alertMessage = '';
    
    try {
      // Mapear filtros para o formato da API
      const searchRequest: AdvancedSearchRequest = {
        searchText: this.searchFilters.textoPesquisa || undefined,
        documentNumber: this.searchFilters.numeroDocumento || undefined,
        subject: this.searchFilters.assunto || undefined,
        generatingAgency: this.searchFilters.orgaoGerador || undefined,
        documentTypeId: this.searchFilters.tipoDocumento ? this.getDocumentTypeId(this.searchFilters.tipoDocumento) : undefined,
        author: this.searchFilters.autor || undefined,
        startDate: this.searchFilters.dataInicio || undefined,
        endDate: this.searchFilters.dataFim || undefined,
        searchType: this.searchFilters.searchType || 'documentos',
        includeGenerated: this.searchFilters.gerados,
        includeExternal: this.searchFilters.externos,
        onlyPublic: false,
        onlyConfidential: false,
        page: 0,
        pageSize: 50,
        orderBy: 'documentDate',
        orderDirection: 'desc'
      };

      const searchObservable = await this.gedApiService.advancedSearch(searchRequest);
      
      searchObservable.subscribe({
        next: (response: AdvancedSearchResponse) => {
          if (response.success) {
            this.managerAttributes.searchResults = response.data;
            this.managerAttributes.documentCount = response.pagination.totalCount;
            this.messages.alertMessage = response.searchSummary;
          } else {
            this.messages.errorMessage = response.message || 'Erro na busca de documentos.';
            this.managerAttributes.documentCount = 0;
            this.managerAttributes.searchResults = [];
          }
          this.uiControllers.isLoading = false;
        },
        error: (error) => {
          console.error('Erro na busca de documentos:', error);
          this.messages.errorMessage = 'Erro ao buscar documentos. Tente novamente.';
          this.managerAttributes.documentCount = 0;
          this.managerAttributes.searchResults = [];
          this.uiControllers.isLoading = false;
        }
      });
      
    } catch (error) {
      console.error('Erro na busca de documentos:', error);
      this.messages.errorMessage = 'Erro ao buscar documentos. Tente novamente.';
      this.managerAttributes.documentCount = 0;
      this.managerAttributes.searchResults = [];
      this.uiControllers.isLoading = false;
    }
  }

  // Mapear tipo de documento para ID
  private getDocumentTypeId(tipoDocumento: string): number {
    const mapping: { [key: string]: number } = {
      'oficio': 1,
      'memorando': 2,
      'relatorio': 3,
      'parecer': 4
    };
    return mapping[tipoDocumento] || 0;
  }

  // Buscar documentos (método do parent)
  searchDocumentsFromParent(): void {
    this.searchDocuments();
  }

  // Inserir novo documento
  insertDocument(): void {
    this.visibleButtons.showInsertDocumentButton = true;
  }

  // Editar documento
  editDocument(): void {
    if (this.managerAttributes.selectedDocument) {
      console.log('Editando documento:', this.managerAttributes.selectedDocument);
    }
  }

  // Download do documento
  downloadDocument(): void {
    if (this.managerAttributes.selectedDocument) {
      console.log('Baixando documento:', this.managerAttributes.selectedDocument);
    }
  }

  // Deletar documento
  deleteDocument(): void {
    if (this.managerAttributes.selectedDocument) {
      console.log('Deletando documento:', this.managerAttributes.selectedDocument);
    }
  }

  // Visualizar documento
  viewDocument(document?: SearchDocumentItem): void {
    if (document) {
      console.log('Visualizando documento:', document);
      this.managerAttributes.selectedDocument = document;
      
      // Navegar para o document-manager com o processo do documento
      const protocol = document.processIdentifier || document.generatedProtocol;
      if (protocol) {
        console.log('Navegando para document-manager com processo e documento:', protocol, document.id);
        // Navegar com query parameters para processo e documento
        this.router.navigate(['/documentos'], { 
          queryParams: { 
            protocol: protocol,
            documentId: document.id
          }
        });
      } else {
        console.warn('Documento não possui processo para navegação');
        // Navegar sem processo mas com documento
        this.router.navigate(['/documentos'], {
          queryParams: { documentId: document.id }
        });
      }
    } else if (this.managerAttributes.selectedDocument) {
      console.log('Visualizando documento:', this.managerAttributes.selectedDocument);
      this.viewDocument(this.managerAttributes.selectedDocument);
    }
  }

  // Assinar documento
  signDocument(): void {
    if (this.managerAttributes.selectedDocument) {
      console.log('Assinando documento:', this.managerAttributes.selectedDocument);
    }
  }

  // Tramitar documento
  forwardDocument(): void {
    if (this.managerAttributes.selectedDocument) {
      console.log('Tramitando documento:', this.managerAttributes.selectedDocument);
    }
  }

  // Callback genérico
  callback = () => {
    console.log('Callback executado');
  };

  // Limpar filtros
  clearFilters(): void {
    this.searchFilters = {
      searchType: 'documentos',
      gerados: false,
      externos: false,
      textoPesquisa: '',
      numeroDocumento: '',
      assunto: '',
      orgaoGerador: '',
      tipoDocumento: '',
      autor: '',
      interessado: false,
      remetente: false,
      destinatario: false,
      periodoExplicito: false,
      periodo30dias: false,
      periodo60dias: false,
      dataInicio: '',
      dataFim: ''
    };
    this.validateSearch();
    
    // Após limpar filtros, mostrar documentos mais recentes novamente
    this.loadRecentDocuments();
  }

}