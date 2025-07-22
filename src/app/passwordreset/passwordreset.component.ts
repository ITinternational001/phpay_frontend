import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserChangePasswordRequestDTO, UserPasswordDTO, UserService } from 'src/shared/dataprovider/api';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})
export class PasswordresetComponent implements OnInit {
  tempassword : string = ''; 
  newpassword : string = ''; 
  cpassword : string = '';
  errorMessage : string ='';
  isValidated:boolean = false;
  private observable!: Observable<UserPasswordDTO>;
  private subscription!: Subscription;
  constructor(private userService : UserService, public router :Router) { }

  ngOnInit(): void {

  }
  validate(temp: string, newpass : string, cpass:string,){
    if (newpass.length >= 8) {
      // Regular expression to match at least one uppercase letter, one lowercase letter, one digit, and one special character
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;,<.>]).{8,}$/;
      
      if (regex.test(newpass)) {
        if (newpass === cpass) {
          this.isValidated = true;
        } else {
          this.errorMessage = "Password and Confirm Password do not match";
          this.isValidated = false;
        }
      } else {
        this.errorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character";
        this.isValidated = false;
      }
    } else {
      this.errorMessage = "Password must be at least 8 characters long";
      this.isValidated = false;
    }
  }

  onResetPassword(tempassword : string, newpassword : string, cpassword : string){
    this.validate(tempassword, newpassword, cpassword)
    if(this.isValidated){
      const changePasswordData: UserChangePasswordRequestDTO = {
        Username: SessionManager.getFromToken("Username"),
        OldPassword: tempassword,
        NewPassword: newpassword
      };
  
      this.observable = this.userService.apiUserUpdatePasswordPost(changePasswordData);
      this.subscription = this.observable.subscribe(
        {
        next:(result :UserPasswordDTO)=>{
        if(result.PasswordDidChanged){
          this.router.navigate(["/authenticator"]);
        }},
        error:(error : HttpErrorResponse)=>{
          this.errorMessage = error.error
          console.log(error);
        },
        complete:()=>{
          this.subscription.unsubscribe();
        }
      });
    }else{
      console.log("Password did not match");
    }
   
  }
}
