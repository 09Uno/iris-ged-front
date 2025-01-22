import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ged';
  redirectUrl = ''
  constructor(private msalService: MsalService, private router: Router) { }

  ngOnInit() {
    this.msalService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult) => {
        if (result) {
          console.log('Autenticado com sucesso', result);
          const name = result.account.name!
          localStorage.setItem('name', name )
          console.log('Nome:', name)
          console.log('link:', this.router.url)
          // Recupera a URL de redirecionamento armazenada no localStorage
          const redirectUrl = localStorage.getItem('redirectUrl') || '/'; 
          
          // Remove a URL de redirecionamento após o uso
          localStorage.removeItem('redirectUrl');
  
          // Redireciona para a URL armazenada
          this.router.navigateByUrl(redirectUrl);
        }
      },
      error: (error) => {
        console.error('Erro ao processar o callback do MSAL:', error);
      }
    });
  }
  
}
