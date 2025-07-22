import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionManager } from '../helpers/session-manager';
import { booleanify } from '../helpers/helper';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accessToken = sessionStorage.getItem("token")
  if(accessToken){
    if(booleanify(SessionManager.getFromToken("PasswordDidChanged"))){
          router.navigate(["/authenticator"]);
    }else{
          router.navigate(["/password/reset"]);
    }
    // if (sessionStorage.getItem("clientId") == "1" || sessionStorage.getItem("clientId")=="2") {
    //   // User is authenticated, redirect to another page
    //   router.navigate(['/admin']); // Replace with the desired route
    //   //return false;
    // }else{
    //   router.navigate(['/client']);
    // }
  }
  return true;
};
 