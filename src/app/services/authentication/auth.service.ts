// import { AuthService } from './authservices'; // Remove this line to avoid the merged declaration issue
import { Injectable, Injector } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { catchError, lastValueFrom, Observable, of, tap } from 'rxjs';
import { AccountInfo } from '@azure/msal-browser'; // Importa AccountInfo
import { Router } from '@angular/router';
import GedApiService from '../../ged.api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {


  private gedApi: GedApiService | undefined  ;
  
  constructor(private msalService: MsalService, private router: Router, private injector: Injector) { 
    setTimeout(() => {
      this.gedApi = this.injector.get(GedApiService);
    });
  }

  apiUrl = 'https://localhost:5001/';

  login() {
    const currentUrl = this.router.url;
    localStorage.setItem('redirectUrl', currentUrl);  
    const loginRequest = {
      // Usando o escopo personalizado configurado no Azure AD
      scopes: ['api://399b1b16-84cc-48d2-b811-95c66a50a6fb/acess_as_user/front'], // Substitua pelo seu escopo
      state: currentUrl,
    };
    this.msalService.loginRedirect(loginRequest);
  }

  loginGovBr() {
    const currentUrl = this.router.url;
    localStorage.setItem('redirectUrl', currentUrl);  
    window.location.href = `${this.apiUrl}api/Auth/authGovBR`;
  }


  async logout(isProfessional: boolean, isCorporative: boolean) {
    // Limpa o token de autenticação do GovBR
    if (isProfessional === true && isCorporative === false) {
      this.gedApi?.logoutGovBr()
      console.log('logout');
      sessionStorage.removeItem('authTokenGovBR');
      document.cookie = 'authTokenGovBR=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.reload();
    }
    else {
      // Limpa o estado local de autenticação d
      document.cookie = 'authTokenGovBR=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      sessionStorage.removeItem('authTokenGovBR');
      this.router.navigate(['/']);
      this.msalService.instance.logoutRedirect({
        account: this.msalService.instance.getAllAccounts()[0],
      }).catch(error => {
        console.error('Erro ao fazer logout do Azure AD:', error);
      });

      // Redireciona o usuário para a página inicial ou outra página definida
      this.router.navigate(['/']);
    }

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

  isGovBrAuthenticated(): Observable<boolean> {
    const token = this.getGovBrToken();
    return new Observable<boolean>((observer) => {
      if (token) {
        observer.next(true);

      } else {
        observer.next(false);
      }
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


  getCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }


  getGovBrToken(): string | null {
    const token = this.getCookie('authTokenGovBR');
    if (token) {
      sessionStorage.setItem('authTokenGovBR', token);
      
      return token;
    }
    return null;
  }


  getNameFromGovBR(): string | null {
    const token = this.getGovBrToken();
    if (token) {
      // Assuming the token contains the user's name in a JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.unique_name || null;
    }
    return null;
  }
}

