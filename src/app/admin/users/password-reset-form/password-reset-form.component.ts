import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription, merge, takeUntil } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { UserPasswordDTO, UserService } from 'src/shared/dataprovider/api';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-password-reset-form',
  templateUrl: './password-reset-form.component.html',
  styleUrls: ['./password-reset-form.component.scss']
})
export class PasswordResetFormComponent implements OnInit {
  resetForm!: FormGroup;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  errorMessage = '';
  isValidated: boolean=false;
  language: string = "";
  constructor(private _fb: FormBuilder, 
    private userService: UserService, 
    private notification: NotificationService,@Inject(MAT_DIALOG_DATA) 
    public data: any,
    private _dialogRef: MatDialogRef<PasswordResetFormComponent>,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
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
          if (result) {
            this._dialogRef.close(true);
            this.notification.showNotification("User now can relogin using new password", "close", "success");
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

