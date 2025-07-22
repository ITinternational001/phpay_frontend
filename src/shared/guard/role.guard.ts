import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionManager } from '../helpers/session-manager';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userRole = SessionManager.getFromToken('RoleName') ?? '';

  let allowedRoles: string[] = route.data['roles'] || [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    router.navigate(['/denied']);
    return false;
  }

  return true;
};