import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  constructor( @Inject(MAT_DIALOG_DATA) public data: any, private notification:NotificationService,
  private _dialogRef: MatDialogRef<ModalComponent>,){}
  text:string = '';
  ngOnInit(): void {
    if(this.data){
      this.text = this.data.value;
    }
  }

  copyText() {
    navigator.clipboard.writeText(this.text);
    this.notification.showNotification("Temporary password copied","close","success");
  }

  onFinished(){
    this._dialogRef.close(true);
  }

}
