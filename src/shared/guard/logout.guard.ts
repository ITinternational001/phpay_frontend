import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const logoutGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Clear session or storage data as needed
  sessionStorage.clear();

  // Redirect to the login page or any other desired location
  router.navigate(['/login']);

  // Returning false prevents navigation to the /logout route
  return false;
};
