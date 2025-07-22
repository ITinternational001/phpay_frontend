import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from './notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
 
  constructor(private _snackBar : MatSnackBar) { }

  showNotification(displayMessage: string, buttonText: string, type:'error'|'success') {
    this._snackBar.openFromComponent(NotificationComponent,{
     data:{
      type:type,
      message:displayMessage, 
      buttonText:buttonText
    },
     duration: 5000,
     horizontalPosition:'center',
     verticalPosition: 'top',
     panelClass: type,
    })
   }
}
