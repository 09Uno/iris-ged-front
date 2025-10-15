import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AddDocumentTypeModalComponent } from '../add-document-type-modal/add-document-type-modal.component';
import { DocumentClassesManagementComponent } from '../document-classes-management/document-classes-management.component';
import { UserPermissionsModalComponent } from '../user-permissions-modal/user-permissions-modal.component';
import { MessageUtil } from '../../../../utils/message';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  viewController = {
    title: 'Administração Geral'
  };

  isProfessional = false;
  isCorporative = true;
  today = new Date();

  // Mensagens
  messages = {
    errorMessage: '',
    alertMessage: '',
    successMessage: ''
  };

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  openAddDocumentTypeModal(): void {
    const dialogRef: MatDialogRef<AddDocumentTypeModalComponent> = this.dialog.open(
      AddDocumentTypeModalComponent,
      {
        width: '600px',
        disableClose: true
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success === true) {
        console.log('Novo tipo de documento adicionado:', result.data);
        MessageUtil.displaySuccessMessage(this, result.message);
      } else if (result?.success === false) {
        console.error('Erro ao adicionar tipo de documento:', result.error);
        MessageUtil.displayErrorMessage(this, result.message);
      }
    });
  }

  openUserManagement(): void {
    console.log('🔗 Navegando para administracao/usuarios');
    this.router.navigate(['/administracao/usuarios']).then(
      (success) => console.log('🔗 Navegação sucesso:', success),
      (error) => console.error('🔗 Erro na navegação:', error)
    );
  }

  openDocumentClassesManagement(): void {
    const dialogRef: MatDialogRef<DocumentClassesManagementComponent> = this.dialog.open(
      DocumentClassesManagementComponent,
      {
        width: '95vw',
        maxWidth: '1400px',
        height: '90vh',
        disableClose: false,
        panelClass: 'full-screen-modal'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success === true) {
        console.log('Classes documentais gerenciadas com sucesso');
        MessageUtil.displaySuccessMessage(this, 'Classes documentais atualizadas com sucesso!');
      }
    });
  }
}