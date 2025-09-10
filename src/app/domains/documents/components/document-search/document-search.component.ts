import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToolBarComponent } from "@features/tool-bar.component/tool-bar.component";
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

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
  documentResults: DocumentResult[] = [];
  isCorporative: boolean = true; // Definido como corporativo por padrão
  isProfessional: boolean = false; // Definido como profissional por padrão


  searchScopes = [
    { label: 'Processos', value: 'process' },
    { label: 'Documentos Gerados', value: 'generated' },
    { label: 'Documentos Externos', value: 'external' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
    // private documentService: DocumentService
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

  search() {
    const searchParams = this.searchForm.value;
    // this.documentService.searchDocuments(searchParams).subscribe(
    //   results => {
    //     this.documentResults = results;
    //   },
    //   error => {
    //     console.error('Erro na busca', error);
    //   }
    // );
  }

  clearSearch() {
    this.searchForm.reset();
    this.documentResults = [];
  }

  viewDocumentDetails(document: DocumentResult) {
    // Navegar para a página de gerenciamento de documentos com parâmetros
    // Assumindo que o document tem protocol e que pode passar o documento ID
    this.router.navigate(['/documentos'], {
      queryParams: {
        protocol: document.contractNumber, // ou outro campo que represente o processo
        documentId: document.id
      }
    });
  }
}