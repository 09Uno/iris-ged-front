import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Observable } from 'rxjs';
import { AccountInfo } from '@azure/msal-browser'; // Importa AccountInfo
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private msalService: MsalService, private router: Router) { }

  login() {
    const currentUrl = this.router.url;
    const loginRequest = {
      // Usando o escopo personalizado configurado no Azure AD
      scopes: ['api://399b1b16-84cc-48d2-b811-95c66a50a6fb/acess_as_user/front'], // Substitua pelo seu escopo
      state: currentUrl,
    };
    this.msalService.loginRedirect(loginRequest);
  }
  

  logout() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: '/',
    });
  }

  isAuthenticated(): Observable<boolean> {
    const account: AccountInfo | null = this.msalService.instance.getAllAccounts()[0];
    return new Observable<boolean>((observer) => {
      if (account) {
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  getAccount(): AccountInfo | undefined {
    return this.msalService.instance.getAllAccounts()[0] || null;
  }

  getUserName(): string | null {
    const account = this.getAccount();
    if (account && account.name) {
      return account.name;
    }
    return null;
  }

  async getToken(scopes: string[] = ['api://399b1b16-84cc-48d2-b811-95c66a50a6fb/acess_as_user/front']): Promise<string | null> {
    try {
      // Solicita o token com o escopo personalizado
      const result = await this.msalService.instance.acquireTokenSilent({
        account: this.getAccount(),
        scopes: scopes, // Aqui você pode passar o escopo desejado
      });
      return result.accessToken;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      
      // Caso não consiga obter o token silenciosamente, faz uma nova solicitação de login
      this.msalService.loginRedirect({ scopes: scopes });
      return null;
    }
  }
  
}

