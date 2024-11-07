import { Routes } from '@angular/router';
import { InserirArquivosProcessosComponent } from './shared/inserir-arquivos-processos/inserir-arquivos-processos.component';
import { ArvoreDocumentosComponent } from './shared/arvore-documentos/arvore-documentos.component';
import { InserirArquivosComponent } from './shared/inserir-arquivos/inserir-arquivos.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'inserir-arquivos-processos', component: InserirArquivosProcessosComponent },
    { path: 'inserir-arquivos', component: InserirArquivosComponent },
    { path: 'arvore-documentos', component: ArvoreDocumentosComponent }

];
