import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { PermissionService } from '../Permissions/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredPermission = route.data['permission'] as string | undefined;
    const requiredRole = route.data['role'] as string | undefined;

    console.log('🔒 PermissionGuard: Verificando permissão:', requiredPermission, 'e role:', requiredRole);

    // Verifica se as permissões já foram carregadas (inclusive da sessão)
    if (this.permissionService.arePermissionsLoaded()) {
      const currentUser = this.permissionService.getCurrentUser();
      console.log('🔒 PermissionGuard: Permissões já carregadas, verificando acesso...');
      return this.checkUserAccess(currentUser!, requiredPermission, requiredRole);
    }

    // Se permissões não estão carregadas, aguarda carregamento
    console.log('🔒 PermissionGuard: Permissões não carregadas, aguardando...');
    return new Observable<boolean | UrlTree>((observer) => {
      this.permissionService.waitForPermissions().then((user) => {
        if (user) {
          console.log('🔒 PermissionGuard: Permissões carregadas, verificando acesso...');
          this.checkUserAccess(user, requiredPermission, requiredRole).subscribe((result) => {
            observer.next(result);
            observer.complete();
          });
        } else {
          console.log('🔒 PermissionGuard: Timeout - redirecionando para forbidden');
          observer.next(this.router.createUrlTree(['/forbidden']));
          observer.complete();
        }
      });
    });
  }

  private checkUserAccess(user: any, requiredPermission?: string, requiredRole?: string): Observable<boolean | UrlTree> {
    console.log('🔒 PermissionGuard: checkUserAccess chamado com:', {
      user: user,
      requiredPermission: requiredPermission,
      requiredRole: requiredRole,
      userRole: user?.role?.name,
      userPermissions: user?.permissions?.map((p: any) => p.name || p.code)
    });

    let hasAccess = true;

    if (requiredPermission) {
      const hasPermission = this.permissionService.hasPermission(requiredPermission);
      console.log('🔒 PermissionGuard: Tem permissão?', hasPermission, 'para:', requiredPermission);
      hasAccess = hasAccess && hasPermission;
    }

    if (requiredRole) {
      const hasRole = this.permissionService.hasRole(requiredRole);
      const isAdmin = this.permissionService.isAdmin();
      console.log('🔒 PermissionGuard: Verificação de role:', {
        requiredRole: requiredRole,
        hasRole: hasRole,
        isAdmin: isAdmin,
        userRoleName: user.role?.name,
        roleNames: ['admin', 'administrator', 'ADMIN', 'Administrador']
      });

      // Se é administrador, tem acesso automaticamente independente da role específica
      if (isAdmin) {
        hasAccess = hasAccess && true;
        console.log('🔒 PermissionGuard: Usuário é admin, acesso liberado');
      } else {
        hasAccess = hasAccess && hasRole;
      }
    }

    console.log('🔒 PermissionGuard: Resultado final:', hasAccess);

    if (hasAccess) {
      return of(true);
    } else {
      console.log('🔒 PermissionGuard: Acesso negado - redirecionando para /forbidden');
      return of(this.router.createUrlTree(['/forbidden']));
    }
  }
}
