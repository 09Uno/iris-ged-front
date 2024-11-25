import { Routes } from '@angular/router';
import { DocumentManagerComponent } from './shared/document-manager/document-manager.component';
import { InserirArquivosComponent } from './shared/inserir-arquivos/inserir-arquivos.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'inserir-arquivos', component: InserirArquivosComponent },
    { path: 'documentos', component: DocumentManagerComponent }

];
