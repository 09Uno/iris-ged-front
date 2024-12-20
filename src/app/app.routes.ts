import { Routes } from '@angular/router';
import { DocumentManagerComponent } from './shared/document-manager/document-manager.component';
import { InserirArquivosComponent } from './shared/inserir-arquivos/inserir-arquivos.component';
import { MsalGuard } from '@azure/msal-angular';
import { HomeComponent } from './shared/home/home.component';
import path from 'path';
import { Component } from '@angular/core';
import { EditorHtmlComponent } from './features/editor-html/editor-html.component';

export const routes: Routes = [
    { path: 'inserir-arquivos', component: InserirArquivosComponent, canActivate: [MsalGuard] },
    { path: 'documentos', component: DocumentManagerComponent, canActivate: [MsalGuard]  },
    { path: '', component: HomeComponent },
    { path: 'edit-document', component: EditorHtmlComponent }

];
