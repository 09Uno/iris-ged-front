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

    // Verifica se o usuário já está carregado
    const currentUser = this.permissionService.getCurrentUser();
    console.log('🔒 PermissionGuard: Usuario atual:', currentUser);

    if (currentUser) {
      console.log('🔒 PermissionGuard: Usuario carregado, verificando acesso...');
      return this.checkUserAccess(currentUser, requiredPermission, requiredRole);
    }

    // Se usuário não está carregado, aguarda um pouco e verifica novamente
    console.log('🔒 PermissionGuard: Usuario não carregado, aguardando...');
    return timer(0, 200).pipe(
      switchMap(() => {
        const user = this.permissionService.getCurrentUser();
        if (user) {
          console.log('🔒 PermissionGuard: Usuario carregado após aguardar');
          return this.checkUserAccess(user, requiredPermission, requiredRole);
        }
        return of(null);
      }),
      take(25), // Máximo 5 segundos (25 * 200ms)
      map((result) => {
        if (result === null) {
          console.log('🔒 PermissionGuard: Timeout - redirecionando para forbidden');
          return this.router.createUrlTree(['/forbidden']);
        }
        return result;
      })
    );
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
