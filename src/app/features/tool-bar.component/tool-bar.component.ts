import { Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs'; // Importando Observable e BehaviorSubject
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/authservices';

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
  styleUrls: ['./tool-bar.component.scss'] // Corrigi o nome da propriedade "styleUrls" (antes estava "styleUrl")
})
export class ToolBarComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  @Input() title: string = '';
  userName : string | null = 'Usuário Default'

  // Adicionando o BehaviorSubject para controlar o estado de autenticação
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable(); // Expondo o Observable

  constructor(private authService: AuthService,  private router: Router) {
    // Observando as mudanças no estado de autenticação
    this.authService.isAuthenticated().subscribe((authStatus) => {
      this.isAuthenticatedSubject.next(authStatus); // Atualizando o estado de autenticação
      this.userName = this.authService.getUserName()
      
    });
  }

  logo = 'assets/logo.png';
  
  someMethod() {
    this.trigger.openMenu();
  }
  
  gotoHome() {
    
  }
  
  signOut() {
    this.authService.logout();
  }
  
  signIn() {
    this.authService.login();
  }
}
