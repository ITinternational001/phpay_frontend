import { DecimalPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DecimalPipeConverter } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-receipt-dialog',
  templateUrl: './receipt-dialog.component.html',
  styleUrls: ['./receipt-dialog.component.scss']
})
export class ReceiptDialogComponent implements OnInit {
  public receiptData! : receipt;
  public amount:any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _decimapipe:DecimalPipe){}
public details = [
  {key: "User Id", value:""},
  {key: "Reference No.", value:""},
  {key: "Gateway", value:""},
  {key: "Method", value:""},
  {key: "Holder Name.", value:""},
  {key: "Account No.", value:""},
  {key: "Date - Time", value:""},
  {key: "Status", value:""},
]
  ngOnInit(): void {
    if(this.data){
      this.details[0].value = this.data.ReferenceUserId;
      this.details[1].value = this.data.TransactionNo;
      this.details[2].value = "DynastyPay";
      this.details[3].value = this.data.Method;
      this.details[4].value = this.data.HolderName;
      this.details[5].value = this.data.AccountNumber;
      this.details[6].value = this.data.Date;
      this.details[7].value = this.data.Status;
      this.amount = DecimalPipeConverter(parseInt(this.data?.Gross), this._decimapipe);
    }
  }
}

export interface receipt{
  ReferenceNo: string;
  Gateway : string;
  Method : string;
  AccountNo : string;
  DateTime : string;
  Amount : string;
} 
