import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { EditorHtmlComponent } from './features/editor-html/editor-html.component';
import { ForbiddenComponent } from './domains/shared/components/forbidden/forbidden.component';
import { PermissionGuard } from './services/authentication/permission.guard';

export const routes: Routes = [
  // Redirecionamento inicial
  { path: '', redirectTo: 'pesquisar-documentos', pathMatch: 'full' },

  // Documents Domain - lazy loading
  {
    path: '',
    loadChildren: () =>
      import('./domains/documents/documents.module').then(m => m.DocumentsModule),
    canActivate: [MsalGuard]
  },

  // Search Domain - lazy loading
  {
    path: '',
    loadChildren: () =>
      import('./domains/search/search.module').then(m => m.SearchModule),
    canActivate: [MsalGuard]
  },

  // Auth Domain - lazy loading
  {
    path: '',
    loadChildren: () =>
      import('./domains/auth/auth.module').then(m => m.AuthModule)
  },

  // Admin Domain - lazy loading
  {
    path: '',
    loadChildren: () =>
      import('./domains/admin/admin.module').then(m => m.AdminModule),
    canActivate: [ PermissionGuard],
    data: { role: 'Administrador' }
  },

  // Editor independente (não está em módulo de domínio)
  { path: 'edit-document', component: EditorHtmlComponent },

  // Página de acesso negado
  { path: 'forbidden', component: ForbiddenComponent }
];
