import { Routes } from '@angular/router';
import { InserirArquivosComponent } from './shared/corporative/inserir-arquivos/inserir-arquivos.component';
import { MsalGuard } from '@azure/msal-angular';
import { HomeComponent } from './shared/corporative/home/home.component';
import path from 'path';
import { Component } from '@angular/core';
import { EditorHtmlComponent } from './features/editor-html/editor-html.component';
import { DocumentManagerComponent } from './shared/corporative/document-manager/document-manager.component';
import { ProfessionalHomeComponent } from './shared/professional/professional-home/professional-home.component';
import { AuthGuard } from './services/authentication/auth.guard';
import { SessionGuard } from './services/authentication/session.guard';
import { CatComponent } from './shared/professional/cat/cat.component';
import { VideoGalleryComponent } from './shared/corporative/video-gallery/video-gallery.component';

export const routes: Routes = [
    
    //Rotas ambiente corporativo
    //Session Guard verifica se a sessão está ativa pelo azure ou pelo gov.br
    { path: 'inserir-arquivos', component: InserirArquivosComponent, canActivate: [MsalGuard] },
    { path: 'documentos', component: DocumentManagerComponent, canActivate: [MsalGuard]  },
    { path: 'home-corporative', component: HomeComponent },
    { path: 'edit-document', component: EditorHtmlComponent },
    { path: 'video-gallery', component: VideoGalleryComponent },


    //Rotas ambiente profissional
  
    {path: 'home-professional', component: ProfessionalHomeComponent},
    {path: 'cat', component: CatComponent, canActivate: [AuthGuard] }




];
