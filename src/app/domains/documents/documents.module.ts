import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { DocumentManagerComponent } from './components/document-manager/document-manager.component';
import { DocumentSearchComponent } from './components/document-search/document-search.component';
import { InserirArquivosComponent } from './components/inserir-arquivos/inserir-arquivos.component';
import { InsertDocumentComponent } from './components/insert-document/insert-document.component';
import { DashboardComponent } from '@domains/search';

const routes: Routes = [
  { path: 'inserir-documento', component: InsertDocumentComponent, canActivate: [MsalGuard] },
  { path: 'documentos', component: DocumentManagerComponent, canActivate: [MsalGuard] },
  { path: 'inserir-arquivos', component: InserirArquivosComponent, canActivate: [MsalGuard] },
  { path: 'listar-documentos', component: DocumentSearchComponent, canActivate: [MsalGuard] },
  { path: 'pesquisar-documentos', component: DashboardComponent, canActivate: [MsalGuard] }

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [],
  exports: [RouterModule]
})
export class DocumentsModule { }