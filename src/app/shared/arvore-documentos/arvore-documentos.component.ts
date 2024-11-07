import { Component, OnInit } from '@angular/core';
import { ToolBarComponentComponent } from '../../features/tool-bar.component/tool-bar.component.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { FormatUtils } from '../../utils/regexMask';
import { ApiService } from '../../api.service';
import { catchError, of, tap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EditorHtmlComponent } from '../../features/editor-html/editor-html.component';
import { InserirArquivosComponent } from "../inserir-arquivos/inserir-arquivos.component";
import { InserirDocumentoComponent } from '../../features/inserir-documento/inserir-documento.component';

declare var $: any;

@Component({
  selector: 'app-arvore-documentos',
  standalone: true,
  imports: [
    ToolBarComponentComponent,
    CommonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    EditorHtmlComponent,
    InserirDocumentoComponent,
    InserirArquivosComponent
],
  templateUrl: './arvore-documentos.component.html',
  styleUrls: ['./arvore-documentos.component.scss']
})
export class ArvoreDocumentosComponent implements OnInit {
  title = 'Árvore de Documentos';
  identificadorProcesso: string = '';
  documentos: any[] = [];
  docIcon: string = '';
  mensagemErro: string | null = null;
  documentoSelecionado: SafeResourceUrl | null = null;
  isLoading = false;
  subTitle: string  = '';
  mostrarEditor = false;
  modalSelecionado = ''
  

  constructor(private api: ApiService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
  }

  // Inicializa a árvore de documentos usando o jsTree
  initJsTree() {
    $('#documentTree').jstree('destroy').empty();
    $('#documentTree').jstree({
      core: {
        data: this.transformDocumentsToJsTreeData(this.documentos),
        check_callback: true,
        themes: {
          stripes: true
        }
      },
      plugins: []
    });

    // Evento de seleção de documento
    $('#documentTree').on('select_node.jstree', (e: any, data: any) => {
      const selectedDocId = parseInt(data.node.id, 10);
      const extensao = data.node.a_attr.extensao; // Corrigido para acessar a extensão
      this.selectDocument(selectedDocId, extensao); // Passa o ID do documento selecionado
    });
  }

  // Converte os dados dos documentos para o formato esperado pelo jsTree
  transformDocumentsToJsTreeData(documents: any[]): any[] {
    return documents.length > 0 ? [{
      id: "processo_raiz",
      text: `Processo ${this.identificadorProcesso}`,
      state: { opened: true },
      children: documents.map(doc => ({
        id: doc.id.toString(),
        text: doc.nome,
        icon: this.getDocumentIcon(doc.extensao),
        a_attr: { extensao: doc.extensao }
      }))
    }] : [];
  }

  getDocumentIcon(tipo: string): string {
    console.log(tipo);
    switch (tipo) {
      case '.pdf':
        return 'assets/pdf.svg';
        break;
      case '.html':
        return 'assets/html-icon.svg';
        break;
      default:
        return 'assets/default-icon.svg';
        break;
    }
  }

  // Carrega o documento selecionado com base no ID fornecido
  async selectDocument(docID: number, extensao : string) {
    this.isLoading = true; 
    this.subTitle = 'Visualizar Documento.';
    this.mostrarEditor = false;
    
    (await this.api.buscarArquivoDocumento(docID)).pipe(
      tap(result => {
        console.log('Documento carregado com sucesso.');
        // Converte o array de bytes para um Blob e depois para uma URL segura
        const blob = new Blob([result], { type: `application/${extensao.replace('.', '')}` } ); // Supondo que seja um PDF
        this.documentoSelecionado = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        this.isLoading = false; 
      }),
      catchError(error => {
        console.error("Erro ao carregar o documento:", error);
        console.log(extensao)
        this.documentoSelecionado = null;
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  InserirDocumentoHtml(){

      this.documentoSelecionado = null;
      this.subTitle = 'Documento';
      this.mostrarEditor = !this.mostrarEditor;
      

  }

  // Formata o identificador do processo
  formatar(event: any) {
    this.identificadorProcesso = FormatUtils.formatarProcesso(this.identificadorProcesso);
  }

  // Realiza a busca de documentos por processo e inicializa a árvore
  async realizarBusca() {
    this.isLoading = true; 
    (await this.api.buscarDocumentosPorProcesso(this.identificadorProcesso)).pipe(
      tap(result => {
        console.log('Busca realizada com sucesso.');

        if (result && result.length > 0) {
          this.documentos = result;
          this.mensagemErro = null;
          this.initJsTree(); 
          this.isLoading = false; 

        } else {
          this.mensagemErro = "Processo Informado não encontrado.";
          this.isLoading = false; 
          this.documentoSelecionado = null;

          setTimeout(() => {
            this.mensagemErro = null;
            this.isLoading = false; 

          }, 5000);
          this.documentos = [];
          $('#documentTree').jstree('destroy').empty(); // Limpa a árvore se não houver documentos
        }
      }),
      catchError(error => {
        console.error("Erro ao realizar a busca:", error);
        this.mensagemErro = "Erro ao realizar a busca. Por favor, tente novamente.";
        this.documentos = [];
        this.documentoSelecionado = null;
        this.isLoading = false; 
        setTimeout(() => {
          this.mensagemErro = null;
          this.isLoading = false; 
        }, 5000);
        $('#documentTree').jstree('destroy').empty(); 
        this.isLoading = false; 
        return of([]);
      })
    ).subscribe();
  }
}
