// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ToolBarComponent } from '@features/tool-bar.component/tool-bar.component';
import GedApiService from '../../../../ged.api.service';
import { AdvancedSearchRequest, AdvancedSearchResponse, SearchDocumentItem } from '../../../../types';
import { DocumentService } from '@app/services';
import { DocumentType } from '../../../../types';


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
  documentType: DocumentType[] = [];

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

  // Controles de Paginação (0-indexed no frontend)
  pagination = {
    currentPage: 0,        // Página atual (0-indexed para o frontend)
    pageSize: 20,          // Itens por página
    totalCount: 0,         // Total de documentos
    totalPages: 0,         // Total de páginas
    displayPages: [] as number[] // Páginas para exibir nos botões
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

  // UI State
  showAdvancedFilters = false;

  // Filtros de pesquisa alinhados com o backend
  searchFilters = {
    // Campos Básicos
    searchText: '',          // Busca global
    documentNumber: '',      // identificador_processo OU identificador_unico
    subject: '',             // assunto

    // Campos Específicos
    documentTypeId: '',      // tipo_documento_id
    producer: '',            // produtor
    recipient: '',           // destinatario
    currentDepartment: '',   // setor_atual

    // Datas
    startDate: '',           // data_documento >=
    endDate: '',             // data_documento <=

    // Identificadores específicos (para árvore/busca individual)
    process: '',             // identificador_processo (apenas)
    uniqueIdentifier: '',    // identificador_unico (exato)

    // Filtros de Status
    status: '',              // situacao
    onlyPublic: false,       // publico = 1
    onlyConfidential: false, // confidencial = 1

    // Campos Adicionais
    keywords: '',            // palavras_chave
    notes: ''                // observacoes
  };


  // Método para quando o tipo de pesquisa muda
  onSearchTypeChange(): void {
    this.validateSearch();
  }

  // Toggle dos filtros avançados
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  constructor(private gedApiService: GedApiService, private router: Router, private documentService: DocumentService) { }

  async ngOnInit() {
    // Inicialização do componente
    this.validateSearch();
    await this.loadDocumentTypes();
    // Carregar documentos mais recentes automaticamente
    this.loadRecentDocuments();
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
          this.documentType = types;
          console.log('Document types loaded:', this.documentType);
        },
        error: (error) => {
          console.error('Error loading document types:', error);
        }
      });
    } catch (error) {
      console.error('Error calling getDocumentsTypes:', error);
    }
  }

  // Validar se pode fazer busca (mais inclusivo)
  validateSearch(): void {
    this.uiControllers.validSearch = true;
  }

  // **ATUALIZADO: Carregar documentos mais recentes com paginação (converte para 1-indexed)**
  async loadRecentDocuments(): Promise<void> {
    this.uiControllers.isLoading = true;
    this.messages.errorMessage = '';
    this.messages.alertMessage = 'Carregando documentos mais recentes...';

    try {
      // Converter página 0-indexed (frontend) para 1-indexed (backend)
      const searchRequest: AdvancedSearchRequest = {
        searchType: 'documents',
        includeGenerated: true,
        includeExternal: true,
        page: this.pagination.currentPage + 1, // Converter para 1-indexed
        pageSize: this.pagination.pageSize,
        orderBy: 'createdAt',
        orderDirection: 'DESC'
      };

      console.log('loadRecentDocuments - Request page (1-indexed):', searchRequest.page);

      const searchObservable = await this.gedApiService.advancedSearch(searchRequest);

      searchObservable.subscribe({
        next: (response: AdvancedSearchResponse) => {
          console.log('loadRecentDocuments - Response:', response);
          
          if (response.success) {
            this.managerAttributes.searchResults = response.data;
            this.managerAttributes.documentCount = response.pagination?.totalCount || 0;
            
            // Atualizar informações de paginação
            if (response.pagination) {
              this.updatePagination(response.pagination);
            } else {
              console.warn('Response sem pagination:', response);
              this.resetPagination();
            }
            
            this.messages.alertMessage = `Exibindo ${response.data.length} de ${this.managerAttributes.documentCount} documentos.`;
          } else {
            this.messages.errorMessage = response.message || 'Erro ao carregar documentos recentes.';
            this.resetPagination();
          }
          this.uiControllers.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar documentos recentes:', error);
          this.messages.errorMessage = 'Erro ao carregar documentos recentes. Tente novamente.';
          this.resetPagination();
          this.uiControllers.isLoading = false;
        }
      });

    } catch (error) {
      console.error('Erro ao carregar documentos recentes:', error);
      this.messages.errorMessage = 'Erro ao carregar documentos recentes. Tente novamente.';
      this.resetPagination();
      this.uiControllers.isLoading = false;
    }
  }

  // **ATUALIZADO: Buscar documentos com paginação (converte para 1-indexed)**
  async searchDocuments(): Promise<void> {
    if (!this.uiControllers.validSearch) return;

    // Reset para primeira página ao fazer nova busca
    this.pagination.currentPage = 0;

    this.uiControllers.isLoading = true;
    this.messages.errorMessage = '';
    this.messages.alertMessage = '';

    try {
      // Converter página 0-indexed (frontend) para 1-indexed (backend)
      const searchRequest: AdvancedSearchRequest = {
        searchText: this.searchFilters.searchText || undefined,
        documentNumber: this.searchFilters.documentNumber || undefined,
        subject: this.searchFilters.subject || undefined,
        documentTypeId: this.searchFilters.documentTypeId ? parseInt(this.searchFilters.documentTypeId) : undefined,
        producer: this.searchFilters.producer || undefined,
        recipient: this.searchFilters.recipient || undefined,
        currentDepartment: this.searchFilters.currentDepartment || undefined,
        startDate: this.searchFilters.startDate || undefined,
        endDate: this.searchFilters.endDate || undefined,
        process: this.searchFilters.process || undefined,
        uniqueIdentifier: this.searchFilters.uniqueIdentifier || undefined,
        status: this.searchFilters.status || undefined,
        onlyPublic: this.searchFilters.onlyPublic,
        onlyConfidential: this.searchFilters.onlyConfidential,
        keywords: this.searchFilters.keywords || undefined,
        notes: this.searchFilters.notes || undefined,
        searchType: 'documents',
        includeGenerated: true,
        includeExternal: true,
        page: this.pagination.currentPage + 1, // Converter para 1-indexed
        pageSize: this.pagination.pageSize,
        orderBy: 'documentDate',
        orderDirection: 'desc'
      };

      console.log('searchDocuments - Request page (1-indexed):', searchRequest.page);

      const searchObservable = await this.gedApiService.advancedSearch(searchRequest);

      searchObservable.subscribe({
        next: (response: AdvancedSearchResponse) => {
          console.log('searchDocuments - Response:', response);
          
          if (response.success) {
            this.managerAttributes.searchResults = response.data;
            this.managerAttributes.documentCount = response.pagination?.totalCount || 0;
            
            // Atualizar informações de paginação
            if (response.pagination) {
              this.updatePagination(response.pagination);
            } else {
              console.warn('Response sem pagination:', response);
              this.resetPagination();
            }
            
            this.messages.alertMessage = response.searchSummary;
          } else {
            this.messages.errorMessage = response.message || 'Erro na busca de documentos.';
            this.resetPagination();
          }
          this.uiControllers.isLoading = false;
        },
        error: (error) => {
          console.error('Erro na busca de documentos:', error);
          this.messages.errorMessage = 'Erro ao buscar documentos. Tente novamente.';
          this.resetPagination();
          this.uiControllers.isLoading = false;
        }
      });

    } catch (error) {
      console.error('Erro na busca de documentos:', error);
      this.messages.errorMessage = 'Erro ao buscar documentos. Tente novamente.';
      this.resetPagination();
      this.uiControllers.isLoading = false;
    }
  }

  // **CORRIGIDO: Atualizar informações de paginação - Backend usa 1-indexed, Frontend usa 0-indexed**
  private updatePagination(paginationData: any): void {
    console.log('updatePagination - Raw data from backend:', paginationData);
    
    // Converter valores do backend
    this.pagination.totalCount = Number(paginationData?.totalCount) || 0;
    this.pagination.totalPages = Number(paginationData?.totalPages) || 0;
    
    // Backend retorna "page" (1-indexed), converter para "currentPage" (0-indexed)
    const backendPage = Number(paginationData?.page) || 1;
    this.pagination.currentPage = backendPage - 1; // Converter de 1-indexed para 0-indexed
    
    // Validação adicional
    if (isNaN(this.pagination.totalCount)) this.pagination.totalCount = 0;
    if (isNaN(this.pagination.totalPages)) this.pagination.totalPages = 0;
    if (isNaN(this.pagination.currentPage) || this.pagination.currentPage < 0) {
      this.pagination.currentPage = 0;
    }
    
    console.log('updatePagination - Processed (0-indexed):', {
      totalCount: this.pagination.totalCount,
      totalPages: this.pagination.totalPages,
      currentPage: this.pagination.currentPage,
      backendPage: backendPage,
      displayPage: this.pagination.currentPage + 1
    });
    
    this.calculateDisplayPages();
  }

  // Resetar paginação
  private resetPagination(): void {
    this.managerAttributes.documentCount = 0;
    this.managerAttributes.searchResults = [];
    this.pagination.totalCount = 0;
    this.pagination.totalPages = 0;
    this.pagination.currentPage = 0;
    this.pagination.displayPages = [];
  }

  // Calcular páginas a exibir (mostra até 5 botões de página)
  private calculateDisplayPages(): void {
    const maxButtons = 5;
    const pages: number[] = [];
    
    // Validar se totalPages é um número válido
    if (!this.pagination.totalPages || isNaN(this.pagination.totalPages) || this.pagination.totalPages <= 0) {
      console.warn('totalPages inválido:', this.pagination.totalPages);
      this.pagination.displayPages = [];
      return;
    }
    
    if (this.pagination.totalPages <= maxButtons) {
      // Se tiver poucas páginas, mostra todas
      for (let i = 0; i < this.pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas ao redor da página atual
      let startPage = Math.max(0, this.pagination.currentPage - 2);
      let endPage = Math.min(this.pagination.totalPages - 1, startPage + maxButtons - 1);
      
      // Ajustar se estiver no final
      if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(0, endPage - maxButtons + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    console.log('calculateDisplayPages - pages (0-indexed):', pages);
    console.log('calculateDisplayPages - display pages:', pages.map(p => p + 1));
    this.pagination.displayPages = pages;
  }

  // Navegar para página específica
  goToPage(page: number): void {
    if (page < 0 || page >= this.pagination.totalPages || page === this.pagination.currentPage) {
      return;
    }
    
    console.log('goToPage - Navegando para página (0-indexed):', page, '(display:', page + 1, ')');
    this.pagination.currentPage = page;
    
    // Determinar se está em modo de busca ou documentos recentes
    const hasActiveFilters = this.hasActiveSearchFilters();
    
    if (hasActiveFilters) {
      this.searchDocuments();
    } else {
      this.loadRecentDocuments();
    }
  }

  // Ir para página anterior
  previousPage(): void {
    if (this.pagination.currentPage > 0) {
      this.goToPage(this.pagination.currentPage - 1);
    }
  }

  // Ir para próxima página
  nextPage(): void {
    if (this.pagination.currentPage < this.pagination.totalPages - 1) {
      this.goToPage(this.pagination.currentPage + 1);
    }
  }

  // Ir para primeira página
  firstPage(): void {
    this.goToPage(0);
  }

  // Ir para última página
  lastPage(): void {
    this.goToPage(this.pagination.totalPages - 1);
  }

  // Verificar se há filtros ativos
  private hasActiveSearchFilters(): boolean {
    return !!(
      this.searchFilters.searchText ||
      this.searchFilters.documentNumber ||
      this.searchFilters.subject ||
      this.searchFilters.documentTypeId ||
      this.searchFilters.producer ||
      this.searchFilters.recipient ||
      this.searchFilters.currentDepartment ||
      this.searchFilters.startDate ||
      this.searchFilters.endDate ||
      this.searchFilters.process ||
      this.searchFilters.uniqueIdentifier ||
      this.searchFilters.status ||
      this.searchFilters.onlyPublic ||
      this.searchFilters.onlyConfidential ||
      this.searchFilters.keywords ||
      this.searchFilters.notes
    );
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
searchText: '',
documentNumber: '',
subject: '',
documentTypeId: '',
producer: '',
recipient: '',
currentDepartment: '',
startDate: '',
endDate: '',
process: '',
uniqueIdentifier: '',
status: '',
onlyPublic: false,
onlyConfidential: false,
keywords: '',
notes: ''
};
this.pagination.currentPage = 0; // Reset página ao limpar filtros
this.validateSearch();
// Após limpar filtros, mostrar documentos mais recentes novamente
this.loadRecentDocuments();
}

}

