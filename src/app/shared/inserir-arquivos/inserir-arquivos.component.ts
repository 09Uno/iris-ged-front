import { Component } from '@angular/core';
import { ToolBarComponentComponent } from "../../features/tool-bar.component/tool-bar.component.component";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inserir-arquivos',
  standalone: true,
  imports: [
    ToolBarComponentComponent,
    MatIconModule
   
  ],
  templateUrl: './inserir-arquivos.component.html',
  styleUrl: './inserir-arquivos.component.scss'
})
export class InserirArquivosComponent {
  title = 'Iniciar Processo';
  tiposProcesso: string[] = ['Eleições: Procedimentos Gerais', 'Outro Processo'];
}
