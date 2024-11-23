import { Component } from '@angular/core';
import { ToolBarComponent } from "../../features/tool-bar.component/tool-bar.component";
import { MatIconModule } from '@angular/material/icon';

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
}
