import { Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authentication/auth.service';

@Component({
  selector: 'app-tool-bar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    RouterModule, 
    CommonModule
  ],
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  @Input() title: string = 'aaaaa';
  userName: string | null = 'Usuário Default';
  @Input() isProfessional: boolean = false;
  @Input() isCorporative: boolean = false;
  @Input() isHome : boolean = false;


  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Lista de rotas que exigem autenticação pelo GovBR
  private govBrRequiredRoutes: string[] = ['/home-professional'];
  // Lista de rotas que exigem autenticação pelo Azure AD
  private azureRequiredRoutes: string[] = ['/home-corporative', 'documents', 'inserir-arquivos'];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    combineLatest([
      this.authService.isGovBrAuthenticated(),
      this.authService.isAuthenticated(),
    ]).subscribe(([govBrAuthStatus, adAuthStatus]) => {
      const currentRoute = this.router.url;
      const isGovBrRoute = this.govBrRequiredRoutes.includes(currentRoute);
      const isAzureRoute = this.azureRequiredRoutes.includes(currentRoute);

      // Se a rota exige autenticação pelo GovBR, ignore o estado do Azure AD
      // Se a rota exige autenticação pelo Azure, ignore o estado do GovBR
      const isAuthenticated = 
        (isGovBrRoute && govBrAuthStatus) || 
        (isAzureRoute && adAuthStatus) ||
        (!isGovBrRoute && !isAzureRoute && (govBrAuthStatus || adAuthStatus));

      this.isAuthenticatedSubject.next(isAuthenticated);

      // Determina o nome do usuário com base na prioridade (GovBR ou Azure AD)
      if (govBrAuthStatus) {
        this.userName = this.authService.getUserName() || this.authService.getNameFromGovBR();
      } else if (adAuthStatus) {
        this.userName = this.authService.getUserName();
      } else {
        this.userName = null; // Se nenhum estiver autenticado
      }
    });
  }

  logo = 'assets/logo.png';

  someMethod() {
    this.trigger.openMenu();
  }
  
  gotoHome() {}

  signInGovBR() {
    this.authService.loginGovBr();
  }

  signOut() {
    console.log('signOut' + this.isProfessional + this.isCorporative);
    this.authService.logout(this.isProfessional, this.isCorporative);
  }

  signIn() {
    this.authService.login();
  }
}
