import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';
import { AuthService } from '@services/authentication/auth.service';
import { PermissionService } from '@services/Permissions/permission.service';
import { UserProfile } from './types/permissions.types';
import GedApiService from './ged.api.service';

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
  constructor(
    private msalService: MsalService,
    private router: Router,
    private auth: AuthService,
    private permissionService: PermissionService,
    private gedApi: GedApiService
  ) { }

  async ngOnInit() {
    console.log('🔥 AppComponent: Iniciando aplicação...');

    this.msalService.handleRedirectObservable().subscribe({
      next: async (result: AuthenticationResult) => {
        if (result) {
          console.log('Autenticado com sucesso', result);
          const name = result.account.name!
          localStorage.setItem('name', name)
          console.log('Nome:', name)
          console.log('link:', this.router.url)

          // Recupera a URL de redirecionamento armazenada no localStorage
          const redirectUrl = localStorage.getItem('redirectUrl') || '/';

          // Remove a URL de redirecionamento após o uso
          localStorage.removeItem('redirectUrl');

          // Aguarda 1s para o token carregar e então carrega as permissões
          setTimeout(async () => {
            try {
              console.log('🚀 AppComponent: Iniciando carregamento de permissões (após login)...');
              await this.loadUserPermissions();
              console.log('✅ AppComponent: Permissões carregadas com sucesso');
            } catch (error) {
              console.error('❌ AppComponent: Erro ao carregar permissões do usuário:', error);
            }
          }, 1000);

          // Redireciona para a URL armazenada
          this.router.navigateByUrl(redirectUrl);
        } else {
          // Se não há resultado de login, verifica se já está logado
          console.log('🔍 AppComponent: Verificando se usuário já está logado...');
          this.checkIfAlreadyLoggedIn();
        }
      },
      error: (error) => {
        console.error('Erro ao processar o callback do MSAL:', error);
        // Mesmo em caso de erro, verifica se já está logado
        this.checkIfAlreadyLoggedIn();
      }
    });
  }

  private async checkIfAlreadyLoggedIn() {
    try {
      const accounts = this.msalService.instance.getAllAccounts();
      console.log('🔍 AppComponent: Contas encontradas:', accounts);

      if (accounts.length > 0) {
        console.log('👤 AppComponent: Usuário já logado, carregando permissões...');
        setTimeout(async () => {
          try {
            console.log('🚀 AppComponent: Iniciando carregamento de permissões (usuário já logado)...');
            await this.loadUserPermissions();
            console.log('✅ AppComponent: Permissões carregadas com sucesso');
          } catch (error) {
            console.error('❌ AppComponent: Erro ao carregar permissões do usuário:', error);
          }
        }, 1000);
      } else {
        console.log('❌ AppComponent: Usuário não está logado');
      }
    } catch (error) {
      console.error('❌ AppComponent: Erro ao verificar login:', error);
    }
  }

  private async loadUserPermissions(): Promise<void> {
    try {
      console.log('📡 AppComponent: Iniciando loadUserPermissions...');
      console.log('📡 AppComponent: Verificando token...');

      // Primeiro verifica se tem token
      const token = await this.auth.getToken();
      console.log('📡 AppComponent: Token obtido:', token ? 'Token presente' : 'Sem token');

      if (!token) {
        console.log('❌ AppComponent: Sem token - não pode chamar /me');
        return;
      }

      console.log('📡 AppComponent: Chamando endpoint /me...');
      // Chama o endpoint /me para buscar dados reais do usuário
      const userMeObservable = await this.gedApi.getUserMe();

      userMeObservable.subscribe({
        next: (userData) => {
          console.log('📋 AppComponent: Dados do usuário recebidos do /me:', userData);
          console.log('📋 AppComponent: Role do usuário:', userData?.role);
          console.log('📋 AppComponent: Permissões do usuário:', userData?.permissions);

          // Converte para o formato esperado pelo PermissionService
          const userProfile: UserProfile = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role ? {
              id: userData.role.id,
              name: userData.role.name,
              description: '',
              permissions: [],
              isActive: true,
              createdAt: new Date().toISOString()
            } : null,
            permissions: userData.permissions.map(p => ({
              id: p.id,
              name: p.name,
              code: p.name, // Usa o name como code
              module: 'admin', // Default, você pode ajustar conforme sua API
              action: 'access',
              resource: 'general',
              description: p.description
            }))
          };

          // Define o usuário atual no PermissionService
          this.permissionService.setCurrentUser(userProfile);
          console.log('👤 AppComponent: Usuário definido no PermissionService:', userProfile);
        },
        error: (error) => {
          console.error('❌ AppComponent: Erro ao buscar dados do usuário no /me:', error);
          console.error('❌ AppComponent: Status do erro:', error?.status);
          console.error('❌ AppComponent: Mensagem do erro:', error?.message);
          console.error('❌ AppComponent: URL que falhou:', error?.url);
          // Em caso de erro, pode definir permissões padrão ou não fazer nada
        }
      });
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  }

}
