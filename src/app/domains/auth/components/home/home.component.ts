import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { createClaimsTable } from '../../../../utils/claim-utils';
import { MsalBroadcastService, MsalService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType } from '@azure/msal-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ToolBarComponent } from "@features/tool-bar.component/tool-bar.component";
import { AuthService } from '../../../../services/authentication/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    ToolBarComponent
  ]
})
export class HomeComponent implements OnInit {
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  
  // Propriedades unificadas para ambos os ambientes
  isCorporative = true;
  isProfessional = false;
  isAuthenticated = false;
  
  home = 'assets/home.png';

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private broadcastService: MsalBroadcastService,
    private authService: MsalService,
    private customAuthService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    this.checkAndSetActiveAccount();
    
    // Detectar ambiente baseado na rota atual
    const currentUrl = this.router.url;
    if (currentUrl.includes('professional')) {
      this.isCorporative = false;
      this.isProfessional = true;
    }
    
    this.broadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None)
    )
    .subscribe(() => {
      this.checkAndSetActiveAccount();
    });
  }

  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }

    this.isAuthenticated = !!this.authService.instance.getActiveAccount();
  }

  navigateToSearch() {
    this.router.navigate(['/pesquisar-documentos']);
  }

  navigateToInsert() {
    this.router.navigate(['/inserir-documento']);
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}