import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { NotificationService } from '../notification/notification.service';
import { convertFormattedAmount, DecimalPipeConverter } from 'src/shared/helpers/helper';
import { TransactionsService } from 'src/shared/dataprovider/api';
import { DecimalPipe } from '@angular/common';
import { Approved } from '../transfer-balance-modal/transfer-balance-modal.component';
import { WalletToCOF } from 'src/shared/dataprovider/local/data/common';

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss']
})
export class TransferModalComponent implements OnInit {
  transactionForm!: FormGroup;
  remittanceForm!: FormGroup;
  transferFormCondition: boolean = true;
  label: string = '';
  value: string = '';
  icon: string = '';
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public sourceChannels: any[][] = [];  // Array to store channels for each row
  public destinationChannels: any[][] = [];  // Array to store channels for each row
  ClientId: any;
  sourceVendors : any = [];
  destinationVendors : any = [];
  actionDisable: boolean = false;
  details :any = {};
  sourceRequestedAmounts: { [vendorId: number]: number } = {};
  destinationRequestedAmounts: { [vendorId: number]: number } = {};
  channelsMap: { [index: number]: any[] } = {};
  selectedDestinationChannel: { [index: number]: any[] } = {};
  totalBalances: number[] = [];
  totalDestiBalances: number[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder,
    private _remittance: RemittanceService,
    private _notification: NotificationService,
    private transactionService: TransactionsService,
    private _dialogRef: MatDialogRef<TransferModalComponent>,
    private _decimalpipe: DecimalPipe
  ) {
    this.transactionForm = this._fb.group({
      TransactionNumber: [''],
      Status: [Approved],
      Destinations: this._fb.array([]),
      Sources: this._fb.array([]),
      Remarks: ['Completed'],
      TransferType: WalletToCOF
    });
  }

  ngOnInit(): void {
    if(this.data != null){
      this.addSource();
      this.addDestination();
      this.sourceVendors = this.data.source;
      this.destinationVendors = this.data.destination;
      this.details  = this.data.row;
      this.transactionForm.patchValue({TransactionNumber: this.details.TransactionNo});
    }
  }

  onSourceSelect(event:any, index:number){
    const selectedVendorId = event.value;
    const selectedVendor = this.sourceVendors.find((vendor:any) => vendor.Id === selectedVendorId);
    this.channelsMap[index] = selectedVendor ? selectedVendor.Channels : [];
    this.sources.at(index).patchValue({ VendorId: selectedVendorId, ChannelId: null});
  }

  

  onDestinationSelect(event:any, index:number){
    const selectionDestinationId = event.value;
    const selectedDestinationVendor = this.destinationVendors.find((vendor:any) => vendor.Id === selectionDestinationId);
    this.selectedDestinationChannel[index] = selectedDestinationVendor ? selectedDestinationVendor.Channels : [];
    this.destinations.at(index).patchValue({ VendorId: selectionDestinationId, ChannelId: null });
  }

  get sources(): FormArray {
    return this.transactionForm.get('Sources') as FormArray;
  }

  get destinations(): FormArray {
    return this.transactionForm.get('Destinations') as FormArray;
  }

  addSource(): void {
    const sourceGroup = this._fb.group({
      Amount: [null, Validators.required],
      VendorId: [null, Validators.required],
      ChannelId: [null, Validators.required]
    });
    this.sources.push(sourceGroup);
    this.totalBalances.push(0);
    this.channelsMap[this.sources.length - 1] = [];
  }

  addDestination(): void {
    const destinationGroup = this._fb.group({
      Amount: [null, Validators.required],
      VendorId: [null, Validators.required],
      ChannelId: [null, Validators.required]
    });
    this.destinations.push(destinationGroup);
    this.totalDestiBalances.push(0);
    this.selectedDestinationChannel[this.sources.length - 1] = [];
  }

  onChannelSelect(event: any, index: number): void {
    const selectedChannelId = event.value;
    const channels = this.channelsMap[index];
    const selectedChannel = channels.find(channel => channel.Id === selectedChannelId);
    if (selectedChannel) {
      this.totalBalances[index] = selectedChannel.TotalBalance; // Update the balance for this source
    }
  }

  onChannelDestiSelect(event: any, index: number): void {
    const selectedChannelId = event.value;
    const channels = this.selectedDestinationChannel[index];
    const selectedChannel = channels.find(channel => channel.Id === selectedChannelId);
    if (selectedChannel) {
      this.totalDestiBalances[index] = selectedChannel.TotalBalance; // Update the balance for this source
    }
  }

  getTotalBalance(index: number): number {
    return this.totalBalances[index] || 0;
  }

  getTotalDestiBalance(index: number): number {
    return this.totalDestiBalances[index] || 0;
  }

  getChannels(index: number): any[] {
    return this.channelsMap[index] || [];
  }

  getDestiChannels(index:number):any[]{
    return this.selectedDestinationChannel[index] || [];
  }
  

  onSubmit() {
    if (this.transactionForm.valid) {
      const formValue = {
        ...this.transactionForm.value,
        Sources: this.transactionForm.value.Sources.map((source: any) => ({
          VendorId: source.VendorId,
          ChannelId: source.ChannelId,
          Amount: source.Amount != '' ? convertFormattedAmount(source.Amount) : 0, 
        })).filter((source:any) => source.Amount !== 0),
        Destinations: this.transactionForm.value.Destinations.map((destination: any) => ({
          VendorId: destination.VendorId,
          ChannelId: destination.ChannelId,
          Amount: destination.Amount != '' ? convertFormattedAmount(destination.Amount) : 0, 
        })).filter((destination:any) => destination.Amount != 0)
      };
      this.observable = this.transactionService.updateBalanceTransfer(formValue);
      this.subscription = this.observable.subscribe({
        next: () => {
          this.actionDisable = true;
          // this._dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error: " + error.error, "close", "error");
        },
        complete: () => {
          this._dialogRef.close(true);
        }
      });
    }
  }
}
