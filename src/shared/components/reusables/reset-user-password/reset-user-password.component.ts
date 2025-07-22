import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { ClientPasswordResetComponent } from 'src/app/client/user-list/client-password-reset/client-password-reset.component';
import { UserService, UserPasswordDTO } from 'src/shared/dataprovider/api';
import { NotificationService } from '../../modals/notification/notification.service';

@Component({
  selector: 'app-reset-user-password',
  templateUrl: './reset-user-password.component.html',
  styleUrls: ['./reset-user-password.component.scss']
})
export class ResetUserPasswordComponent {
  resetForm!: FormGroup;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  errorMessage = '';
  isValidated: boolean=false;

  constructor(private _fb: FormBuilder, private userService: UserService, private notification: NotificationService,@Inject(MAT_DIALOG_DATA) public data: any,private _dialogRef: MatDialogRef<ClientPasswordResetComponent>) {
    this.resetForm = this._fb.group({
      Username: '',
      NewTemporaryPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if(this.data){
      this.resetForm.patchValue({Username: this.data.Username, NewTemporaryPassword: Math.random().toString(36).slice(-12)})
    }
  }

  onSubmit() {
      this.resetPassword(this.resetForm.value);
  }

  copyPassword() {
    navigator.clipboard.writeText(this.resetForm.get('NewTemporaryPassword')?.value);
    this.notification.showNotification("Temporary password copied","close","success");
  }

  resetPassword(data: any) {
    
    this.observable = this.userService.apiUserForgotPasswordPost(data);
    this.subscription = this.observable.subscribe(
      {
        next: (result: UserPasswordDTO) => {
          if(result){
            this._dialogRef.close(true);
            this.notification.showNotification("Password was reset. please try to relogin ", "close", "success");
          }   
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error
          this.notification.showNotification("Error:" + error.error, "close", "success");
        },
        complete: () => {
          this.subscription.unsubscribe();
        }
      });
  }
}
