import { Routes } from '@angular/router';
import { FileManagerComponent } from './shared/file-manager/file-manager.component';
import { InserirArquivosComponent } from './shared/inserir-arquivos/inserir-arquivos.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'inserir-arquivos', component: InserirArquivosComponent },
    { path: 'documentos', component: FileManagerComponent }

];
