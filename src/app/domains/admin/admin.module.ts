import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Material Modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Quill Editor
import { QuillModule } from 'ngx-quill';

// Feature Components
import { ToolBarComponent } from '../../features/tool-bar.component/tool-bar.component';

// Guards
import { PermissionGuard } from '../../services/authentication/permission.guard';

// Components
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AddDocumentTypeModalComponent } from './components/add-document-type-modal/add-document-type-modal.component';
import { UserPermissionsModalComponent } from './components/user-permissions-modal/user-permissions-modal.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

const routes: Routes = [
  {
    path: 'administracao',
    component: AdminDashboardComponent
  },
  {
    path: 'administracao/usuarios',
    component: UserManagementComponent,
    canActivate: [PermissionGuard],
    data: { role: 'Administrador' }
  }
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AddDocumentTypeModalComponent,
    UserPermissionsModalComponent,
    UserManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    
    // Material Modules
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule,

    // Quill Editor
    QuillModule.forRoot(),

    // Feature Components
    ToolBarComponent
  ]
})
export class AdminModule { }