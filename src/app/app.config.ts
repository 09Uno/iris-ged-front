import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

// MSAL Imports
import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation,
  InteractionType
} from '@azure/msal-browser';
import {
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG
} from '@azure/msal-angular';

// Detectando IE (caso seja necessário)
const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

// Configuração do PublicClientApplication
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '399b1b16-84cc-48d2-b811-95c66a50a6fb', // Substitua pelo seu Client ID
      authority: 'https://login.microsoftonline.com/9476a667-1a5a-4cbd-8571-a0e5080b330d/discovery/v2.0/keys', // Substitua pelo seu Tenant ID
      redirectUri: 'https://localhost:4200', // Atualize se necessário
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage, // Usa LocalStorage para persistir tokens
      storeAuthStateInCookie: isIE, // Usa cookies no IE devido à compatibilidade
    },
  });
}

// Configuração do MSAL Guard
export function MSALGuardConfigFactory() {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ['User.Read'], // Escopos necessários para sua aplicação
    },
  };
}

// Configuração Principal da Aplicação
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch()
    ),

    // Provedores do MSAL
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService, provideAnimationsAsync(),
  ],
};
