import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AddDocumentTypeModalComponent } from '../add-document-type-modal/add-document-type-modal.component';
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
    // Tenta navegação relativa primeiro, depois absoluta como fallback
    this.router.navigate(['usuarios'], { relativeTo: this.route }).catch(() => {
      this.router.navigate(['/admin/administracao/usuarios']);
    });
  }
}