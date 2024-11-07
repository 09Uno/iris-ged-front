import { SnackBarService } from './../../utils/openSnackBar';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToolBarComponentComponent } from '../../features/tool-bar.component/tool-bar.component.component';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ItemDocumentos } from '../../models/ItemDocumentos';
import { FileUtils } from '../../utils/FileUtils';
import { FormatUtils } from '../../utils/regexMask';

 

@Component({
  selector: 'app-inserir-documento',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    ToolBarComponentComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule
],
  templateUrl: './inserir-documento.component.html',
  styleUrl: './inserir-documento.component.scss',
})
export class InserirDocumentoComponent {

  title = '';
  isLoading = false;
  subtitle = ''
  modal = 1
  modeloDocumento  = ''
  modeloDocumentoTexto  = ''

  selectedFile: string | File | Blob  = '';


  itemDocumento : ItemDocumentos= {
    Id : null,
    Nome: '',
    Tipo_documento: '',
    Identificador: '',
    Data_documento: '',
    Documento: '', 
    Descricao: '',
    Extensao : ''

}


tiposProcesso: { valor: string, texto: string }[] = [
  { valor: '1', texto: 'Externo' },
  { valor: '2', texto: 'Nota Fiscal' },
  { valor: '3', texto: 'Alvará' },
  { valor: '4', texto: 'Anotação' },
  { valor: '5', texto: 'Alegações' },
  { valor: '6', texto: 'Termo Técnico' },   
];

  constructor(private router: Router, private api: ApiService, private snackService: SnackBarService){}

  onFileSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
          this.selectedFile = input.files[0]; 
      }
  }

  async salvarDocumentos(){
    if(!this.itemDocumento.Nome ||!this.itemDocumento.Tipo_documento ||!this.itemDocumento.Identificador ||!this.itemDocumento.Data_documento ||!this.selectedFile){
      this.snackService.openSnackBar("Todos os campos devem ser preenchidos!", "Fechar");
      return;
    }

    this.isLoading = true; 
    this.itemDocumento.Extensao = FileUtils.pegarExtArquivo(this.selectedFile as File)
    console.log(this.itemDocumento.Extensao + 'extensao_documento ');

    console.log(this.itemDocumento);
    this.itemDocumento.Documento = this.selectedFile;
    if(this.modeloDocumento == '1'){
      (await this.api.salvarDocumentos(this.itemDocumento)).subscribe(
        (data) => {
          this.snackService.openSnackBar("Documento Salvo com sucesso!", "Fechar");
          this.cleanFields();
          this.isLoading = false;
        },
        (error) => {
          console.error('Erro ao salvar documento:', error);
          this.snackService.openSnackBar("Erro ao tentar salvar o documento!", "Fechar");
          this.cleanFields();
          this.isLoading = false;
        }
      );
    }else{
      
      //salvar nova versão do documento
      //salvar documento novo e pegar resposta do novo documento
      //esperar volta do backend com o template
      this.modal = 3;
      this.title = this.title
      //inserir documento na árvore e salvar

    }
    
    
  }



  cleanFields(){
    this.itemDocumento.Nome = '';
    this.itemDocumento.Tipo_documento = '';
    this.itemDocumento.Identificador = '';
    this.itemDocumento.Data_documento = '';
    this.itemDocumento.Documento = '';
    this.itemDocumento.Descricao = '';
    this.selectedFile = '';
  } 
  formatar(event: any) {
    this.itemDocumento.Identificador = FormatUtils.formatarProcesso(this.itemDocumento.Identificador);
  }
  
  selecionarTemplate()  {
    //seleção para adicionar documentos externos
    if(this.modeloDocumento == '1'){
      this.modal = 2;
    }else{
      //fazer busca de template no backend

      //salvar o documento novo e pegar resposta do novo documento
      //esperar volta do backend com o template
      this.modal = 3;
      this.title = this.title
      //inserir documento na árvore e salvar 
    }
  }

  //preencher arquivo 
  


  voltarParaTemplates(){
    this.modal = 1;
  }

}
