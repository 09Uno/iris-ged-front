import { Component } from '@angular/core';
import { ToolBarComponent } from "../../features/tool-bar.component/tool-bar.component";
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-inserir-arquivos',
  standalone: true,
  imports: [
    ToolBarComponent,
    MatIconModule
   
  ],
  templateUrl: './inserir-arquivos.component.html',
  styleUrl: './inserir-arquivos.component.scss'
})
export class InserirArquivosComponent {
  title = 'Iniciar Processo';
  tiposProcesso: string[] = ['Eleições: Procedimentos Gerais', 'Outro Processo'];

  constructor(
    private titleService: Title
  ) { }
  

  ngOnInit() {
    this.titleService.setTitle('Gerenciar Arquivos');
  }
 
}
