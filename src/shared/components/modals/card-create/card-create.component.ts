import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { ClientService } from 'src/shared/dataprovider/api';
import { Bank, Banks, Binance, CashPickUp } from 'src/shared/dataprovider/local/data/common';
import { getCardTypeId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-card-create',
  templateUrl: './card-create.component.html',
  styleUrls: ['./card-create.component.scss']
})
export class CardCreateComponent implements OnInit {
  cardForm: FormGroup;
  public isBank: boolean = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  language: string = "";
  actionDisable: boolean = false;
  BankList : Array<any> = Banks;
  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<CardCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _clientService: ClientService,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.cardForm = this._fb.group({
      BankName: ['', this.isBankField() ? [Validators.required] : []],
      AccountNumber: ['', this.isBankField() ? [Validators.required, Validators.pattern('^[0-9]{8,17}$')] : []],
      AccountName: ['', [Validators.required]],
      NickName: ['', [Validators.required]],
      BinanceWalletAddress: ['', this.isBinanceField() ? [Validators.required] : []],
    });
  }

  ngOnInit(): void {
    // Set flags
    this.isBank = this.isBankField(); // Uses the method you want to keep

    // Create form based on flags
    this.cardForm = this._fb.group({
      BankName: ['', this.isBankField() ? [Validators.required] : []],
      AccountNumber: ['', this.isBankField() ? [Validators.required, Validators.pattern('^[0-9]{8,17}$')] : []],
      AccountName: ['', [Validators.required]],
      NickName: ['', [Validators.required]],
      BinanceWalletAddress: ['', this.isBinanceField() ? [Validators.required] : []],
    });

    // Populate data if editing
    if (this.data.details) {
      this.cardForm.patchValue({
        BankName: this.isBankField() ? this.data.details.CardName : '',
        AccountName: this.data.details.AccountName,
        NickName: this.data.details.NickName,
        BinanceWalletAddress: this.isBinanceField() ? this.data.details.BinanceWalletAddress : '',
      });

      if (this.isBankField()) {
        this.getAccountNumber(this.data.details.Id, this.data.details);
      }
    }
  }

  onSelectBank(event : any){
    this.cardForm.patchValue({BankName: event.name});
  }


  private isBankField(): boolean {
    return this.data.cardType === Bank || this.data.cardType === CashPickUp;
  }

  private isBinanceField(): boolean {
    return this.data.cardType === Binance;
  }

  getAccountNumber(cardId: number, data: any) {
    this.observable = this._clientService.apiClientGetAccountNumberGet(cardId);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.cardForm.patchValue({
          BankName: this.isBank ? data.CardName : 'Binance',
          AccountNumber: this.isBank ? response : '',
          BinanceWalletAddress: this.isBank ? '' : response,
          AccountName: data.AccountName,
          NickName: data.NickName,
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching account number:', error);
      },
    });
  }

  onFormSubmit() {
    if (this.cardForm.valid) {
      this._dialogRef.close({ isContinue: true, data: { ...this.cardForm.value, cardType: this.data.cardType } });
    }
  }
}
