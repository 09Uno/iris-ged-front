import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular'; // Import do MSAL
import { AuthGuard } from './auth.guard';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionGuard implements CanActivate {
  constructor(
    private msalService: MsalService,
    private authGuard: AuthGuard,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    // Verifique se o MSAL está autenticado
    const isMsalAuthenticated = this.msalService.instance.getAllAccounts().length > 0;
    // Verifique a outra condição
    const isSecondConditionMet = await firstValueFrom(this.authGuard.canActivate());
    
    // Retorne true se qualquer uma das verificações for verdadeira
    if (isMsalAuthenticated || isSecondConditionMet) {
      
      return true;
    }

    // Redirecione se nenhuma condição for verdadeira
    this.router.navigate(['/home-corporative']);
    return false;
  }
}
