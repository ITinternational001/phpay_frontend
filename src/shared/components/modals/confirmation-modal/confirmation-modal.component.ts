import { Component, Inject, OnInit } from '@angular/core';
import { NotificationService } from '../notification/notification.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {
  confirmationModal!: FormGroup;
  public details = {
    Name: ''
  };
  public Action = "";
  public icon = "";
  public showInputField = false;  // Flag to control visibility of app-input-text-field
  language: string = "";
  actionDisable: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notification: NotificationService,
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<ConfirmationModalComponent>,
    private translateService: TranslateService
  ) {  this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language); }

  ngOnInit(): void {
    this.confirmationModal = this._fb.group({
      Remarks: ['', Validators.required]  // Directly assigning the initial value and validators
    });

    var type = this.data.type;
    var details = this.data.data;

    switch (type) {
      case "Vendor":
        this.details = { Name: details.Name };
        this.Action = "Delete";
        this.icon = "fa fa-trash";
        this.showInputField = false; // Don't show input field
        break;

      case "Merchant":
        this.details = { Name: details.VendorId + "-" + details.PaymentChannelId };
        this.Action = "Delete";
        this.icon = "fa fa-trash";
        this.showInputField = false; // Don't show input field
        break;

      case "User":
        this.details = { Name: details.UserId + "-" + details.Name };
        this.Action = details.Status == "Active" ? "disabled" : "Enable";
        this.icon = details.Status == "Active" ? "fa fa-user-times" : "fa fa-user-check";
        this.showInputField = false; // Don't show input field
        break;

      case "TopUp":
        this.details.Name = "Manual Top Up";
        this.Action = "Proceed";
        this.icon = "fa fa-thumbs-up";
        this.showInputField = false; 
        break;

      case "BalanceTransfer":
        this.details.Name = "balanceTransfer";
        this.Action = "Proceed";
        this.icon = "fa fa-exchange";
        this.showInputField = true; 
        break;

        case "TransferBalance":
          this.details.Name = "balanceTransfer";
          this.Action = "Proceed";
          this.icon = "fa fa-exchange";
          this.showInputField = false; 
          break;

      case "DeclineTransfer":
        this.details.Name = "balanceTransfer";
        this.Action = "decline";
        this.icon = "fa fa-close";
        this.data.type = "Transfer";
        this.showInputField = true;
        break;

      case "DeclineRelease":
        this.details.Name = details.RemittanceId;
        this.Action = "decline";
        this.icon = "fa fa-close";
        this.data.type = "Withdrawal Transaction";
        this.showInputField = true; 
        break;

      case "DisableAgent":
        this.details.Name = "this Agent";
        this.Action = "Confirm";
        this.icon = "fa fa-close";
        this.data.type = "Withdrawal Transaction";
        this.showInputField = false; 
        break;

        case "DeclineRemittance":
          this.details.Name = "remittanceTransaction";
          this.Action = "decline";
          this.icon = "fa fa-close";
          this.data.type = "Remittance";
          this.showInputField = true; 
          break;
    }
  }

  // ConfirmationModalComponent (modified)
  onSubmit() {
    if(this.showInputField){
      if(this.confirmationModal.valid){
        const result = this.confirmationModal.get('Remarks')?.value;
        this._dialogRef.close({continue: true, remarks:result});
      }
    }else{
      this._dialogRef.close({continue:true});
    }
  }

  cancel() {
    this._dialogRef.close(null); 
  }
}
