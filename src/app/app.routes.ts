import { Routes } from '@angular/router';
import { InserirArquivosComponent } from './shared/corporative/inserir-arquivos/inserir-arquivos.component';
import { InsertDocumentComponent } from './shared/insert-document/insert-document.component';
import { MsalGuard } from '@azure/msal-angular';
import { HomeComponent } from './shared/corporative/home/home.component';
import { EditorHtmlComponent } from './features/editor-html/editor-html.component';
import { DocumentManagerComponent } from './shared/corporative/document-manager/document-manager.component';
import { ProfessionalHomeComponent } from './shared/professional/professional-home/professional-home.component';
import { DocumentSearchComponent } from './shared/document-search/document-search.component';
import { DashboardComponent } from './shared/dashboard/dashboard.component';

export const routes: Routes = [
    
    //Rotas ambiente corporativo
    //Session Guard verifica se a sessão está ativa pelo azure ou pelo gov.br
    {path: '', redirectTo: 'home-corporative', pathMatch: 'full'},
    { path: 'inserir-documento', component: InsertDocumentComponent, canActivate: [MsalGuard] },
    { path: 'documentos', component: DocumentManagerComponent, canActivate: [MsalGuard]  },
    {path: 'pesquisar-documentos', component: DashboardComponent, canActivate: [MsalGuard] },
    

    {path: 'listar-documentos', component: DocumentSearchComponent, canActivate: [MsalGuard] },
    { path: 'inserir-arquivos', component: InserirArquivosComponent, canActivate: [MsalGuard] },
    { path: 'home-corporative', component: HomeComponent },
    { path: 'edit-document', component: EditorHtmlComponent },

    //Rotas ambiente profissional
  
    {path: 'home-professional', component: ProfessionalHomeComponent},




];
