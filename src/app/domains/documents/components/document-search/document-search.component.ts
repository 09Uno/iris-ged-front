import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToolBarComponent } from "@features/tool-bar.component/tool-bar.component";
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import GedApiService from '../../../../ged.api.service';
import { AdvancedSearchRequest, AdvancedSearchResponse, SearchDocumentItem } from '../../../../types';

interface DocumentResult {
  id: string;
  contractNumber: string;
  description: string;
  user: string;
  date: Date;
  status: string;
}

@Component({
  standalone: true,
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.scss'],
  imports: [
    ToolBarComponent,
    ReactiveFormsModule,
    DatePipe,
    CommonModule

  ]
})

export class DocumentSearchComponent implements OnInit {
  searchForm: FormGroup;
  documentResults: SearchDocumentItem[] = [];
  isCorporative: boolean = true; // Definido como corporativo por padrão
  isProfessional: boolean = false; // Definido como profissional por padrão
  isLoading: boolean = false;


  searchScopes = [
    { label: 'Processos', value: 'process' },
    { label: 'Documentos Gerados', value: 'generated' },
    { label: 'Documentos Externos', value: 'external' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private gedApiService: GedApiService
  ) {
    this.searchForm = this.fb.group({
      searchScopes: [['process', 'generated', 'external']],
      searchText: [''],
      orgaoGerador: [''],
      unidadeGerada: [''],
      assunto: [''],
      interessado: [false],
      remetente: [false],
      destinatario: [false],
      descricao: [''],
      tipoProcesso: [''],
      tipoDocumento: [''],
      dataDocumento: [''],
      usuarioGerador: [''],
      periodoInicial: [''],
      periodoFinal: ['']
    });
  }

  ngOnInit() {
    // Inicialização opcional
  }

  async search(): Promise<void> {
    const searchParams = this.searchForm.value;
    this.isLoading = true;

    try {
      console.log('🔍 DocumentSearch: Iniciando busca com parâmetros:', searchParams);

      // Mapear parâmetros do formulário para AdvancedSearchRequest
      const searchRequest: AdvancedSearchRequest = {
        searchText: searchParams.searchText || undefined,
        subject: searchParams.assunto || undefined,
        generatingAgency: searchParams.orgaoGerador || undefined,
        unitGenerated: searchParams.unidadeGerada || undefined,
        documentTypeId: searchParams.tipoDocumento || undefined,
        author: searchParams.usuarioGerador || undefined,
        startDate: searchParams.periodoInicial || undefined,
        endDate: searchParams.periodoFinal || undefined,
        searchType: 'documents',
        includeGenerated: searchParams.searchScopes.includes('generated'),
        includeExternal: searchParams.searchScopes.includes('external'),
        page: 0,
        pageSize: 50,
        orderBy: 'documentDate',
        orderDirection: 'desc'
      };

      const searchObservable = await this.gedApiService.advancedSearch(searchRequest);

      searchObservable.subscribe({
        next: (response: AdvancedSearchResponse) => {
          console.log('✅ DocumentSearch: Resultados recebidos:', response);

          if (response.success) {
            this.documentResults = response.data;
          } else {
            console.error('❌ DocumentSearch: Erro na busca:', response.message);
            this.documentResults = [];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ DocumentSearch: Erro na busca:', error);
          this.documentResults = [];
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('❌ DocumentSearch: Erro na busca:', error);
      this.documentResults = [];
      this.isLoading = false;
    }
  }

  clearSearch() {
    this.searchForm.reset();
    this.documentResults = [];
  }

  viewDocumentDetails(document: SearchDocumentItem) {
    console.log('🔍 DocumentSearch: Visualizando detalhes do documento:', document);

    // Navegar para a página de gerenciamento de documentos com parâmetros
    const protocol = document.processIdentifier || document.generatedProtocol;

    if (protocol) {
      console.log('🔍 DocumentSearch: Navegando com protocolo:', protocol);
      this.router.navigate(['/documentos'], {
        queryParams: {
          protocol: protocol,
          documentId: document.id
        }
      });
    } else {
      console.log('🔍 DocumentSearch: Navegando apenas com documentId:', document.id);
      this.router.navigate(['/documentos'], {
        queryParams: {
          documentId: document.id
        }
      });
    }
  }
}