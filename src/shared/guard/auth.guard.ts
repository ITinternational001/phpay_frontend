import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {JwtHelperService} from "@auth0/angular-jwt";
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accessToken = sessionStorage.getItem("token");
  var result:boolean =false;
  
  if(accessToken !== null){
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(accessToken);
    const username = decodedToken.username;
    
    if(username !== null){
      sessionStorage.setItem("username", username);
       // Add the condition to check user role here
       let isAdmin : boolean = false;
       if(sessionStorage.getItem("clientId") == "1" || sessionStorage.getItem("clientId")=="2"){
        isAdmin = true;
       }
       
       if (isAdmin && state.url.includes('/client')) {
        // Admin can't access client pages
        router.navigate(['/denied']); // or any other route for denied access
        return false;
      } else if (!isAdmin && state.url.includes('/admin')) {
        // Client can't access admin pages
        router.navigate(['/denied']); // or any other route for denied access
        return false;
      }
      return true;
    }else{
      router.navigate(["/newpassword"])
      return false;
    }

  }else{
   router.navigate(["/login"]);
   sessionStorage.clear();
   return false;
  }
};
