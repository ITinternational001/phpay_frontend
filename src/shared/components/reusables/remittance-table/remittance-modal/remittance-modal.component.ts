import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { CardDTO } from 'src/shared/dataprovider/api/model/cardDTO';
import { convertFormattedAmount, DecimalPipeConverter, getCurrentUserClientId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-remittance-modal',
  templateUrl: './remittance-modal.component.html',
  styleUrls: ['./remittance-modal.component.scss']
})
export class RemittanceModalComponent implements OnInit {
  remittanceForm!: FormGroup;
  selectedFiles: Blob[] = [];
  fileNames: string[] = [];
  public maskedAccountNumber: string = "";
  public cards: Array<CardDTO> = [];
  @ViewChild('fileInput') fileInput!: ElementRef;
  private obsCard!: Observable<any>;
  private subsCard!: Subscription;
  private obsCardNumber!: Observable<any>;
  private subsCardNumber!: Subscription;
  actionDisable: boolean = false;

  formattedTotalAmount: string | null = '';
  transferFee: number | null = 0;
  withdrawalCount: number | null = 0;
  requestedAmount: string | null = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private decimalPipe: DecimalPipe,
    private notification: NotificationService,
    private _dialogRef: MatDialogRef<ConfirmationModalComponent>,
    private _fb: FormBuilder,
    private cardService: ClientService,
    private _clientService: ClientService) {
    this.remittanceForm = this._fb.group({
      DateRequested: [''],
      ClientName: [''],
      TotalAmount: [''],
      TransferFee: [''],
      RemittanceMethod: [''],
      BankDetails: [''],
      //ConfirmationAmount: ['', Validators.required],
      WithdrawalCount: [''],
      ReferenceNumber: ['', Validators.required],
      CardId: ['', Validators.required],
      DepositSlips: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.requestedAmount = this.decimalPipe.transform(this.data.RequestedAmount, '1.2-2');
      this.formattedTotalAmount = this.decimalPipe.transform(this.data.TotalAmount, '1.2-2');
      this.transferFee = this.data.OriginalFee;
      this.withdrawalCount = Math.ceil(this.data.RequestedAmount / 50000);
      this.remittanceForm.patchValue({
        DateRequested: this.data.TimeStamp,
        ClientName: this.data.Wallet,
        TotalAmount: this.formattedTotalAmount,
        TransferFee: this.data.TransactionFee ?? 0,
        RemittanceMethod: this.data.Method != null ? this.data.Method : 'n/a',
        BankDetails: `Bank: ${this.data.MethodDescription}\nAccount: ${this.maskedAccountNumber}\nName: ${this.data.CardAccountName}`
      });

    }



    this.getAccountNumber(this.data.CardId)
    //this.setupFormListeners();
    this.getWalletCards();
  }


  getAccountNumber(cardId: number) {
    if (this.obsCardNumber) { this.subsCardNumber.unsubscribe() }
    this.obsCardNumber = this._clientService.apiClientGetAccountNumberGet(cardId);
    this.subsCardNumber = this.obsCardNumber.subscribe({
      next: (response) => {
        this.maskedAccountNumber = response
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    })
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files).map(file => file as File);
      this.fileNames = Array.from(input.files).map(file => file.name);
      this.remittanceForm.patchValue({ DepositSlips: this.selectedFiles });
    }
  }

  // setupFormListeners(): void {
  //   this.remittanceForm.get('ConfirmationAmount')?.valueChanges.subscribe(rawAmount => {
  //     const fee = this.data.OriginalFee || 0;
  //     const amount = convertFormattedAmount(rawAmount);
  //     let limit = 0;
  //     if (this.data.Method == "BANK") {
  //       limit = 50000;
  //     } else if (this.data.Method == "PICKUP") {
  //       limit = 10000;
  //     }
      
  //     if (amount > 0) {
  //       const chunks = Math.ceil(amount / limit); // Always 1 or more
  //       const totalFee = fee * chunks;

  //       this.remittanceForm.patchValue({
  //         TransferFee: totalFee,
  //         WithdrawalCount: chunks
  //       });

  //       this.transferFee = totalFee;
  //       this.withdrawalCount = chunks;

  //     } else {
  //       this.remittanceForm.patchValue({
  //         TransferFee: 0,
  //         WithdrawalCount: 0
  //       });
  //     }
  //   });
  // }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onReleaseRemittance() {
    if (this.remittanceForm.valid) {
      //const ConfirmationAmount = convertFormattedAmount(this.remittanceForm.get('ConfirmationAmount')?.value);
      //this.remittanceForm.patchValue({ ConfirmationAmount: ConfirmationAmount })
      this.actionDisable = true;
      const data = {
        release: true,
        form: this.remittanceForm.value,
        row: this.data
      }

      this._dialogRef.close(data)
    }
  }

  getWalletCards() {
    if (this.obsCard) {
      this.subsCard.unsubscribe();
    }

    this.obsCard = this.cardService.apiClientGetCardsByClientIdGet(getCurrentUserClientId());
    this.subsCard = this.obsCard.subscribe({
      next: (response) => {
        if (response != null && Array.isArray(response.Data)) {
          this.cards = response.Data;
        }

      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {

      }
    });
  }
}
