import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ClientService } from 'src/shared/dataprovider/api';
import { ClientCOFundsBalanceDTO } from 'src/shared/dataprovider/api/model/clientCOFundsBalanceDTO';
import { VendorBalance } from 'src/shared/dataprovider/api/model/vendorBalance';

@Component({
  selector: 'app-co-wallet-modal',
  templateUrl: './co-wallet-modal.component.html',
  styleUrls: ['./co-wallet-modal.component.scss']
})
export class CoWalletModalComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public filteredVendors: VendorBalance[] = []; // To store the filtered vendors specific to the client
  clientId: number = 0;
  clientName: string = '';
  totalCOFundBalance: number = 0;
  CoWalletForm!: FormGroup;

  constructor(
    private clientService: ClientService,
    private notification: NotificationService,
    private fb: FormBuilder,
    private decimalPipe: DecimalPipe,
    public dialogRef: MatDialogRef<CoWalletModalComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.clientId = this.data.clientId;
      this.clientName = this.data.clientName || '';
      this.totalCOFundBalance = this.data.totalCOFundBalance;
      
      // Fetch the CO wallet data for the specified client
      this.getAllCoWallet(this.clientId);
    }

    // Initialize the form with an empty array initially
    this.CoWalletForm = this.fb.group({
      Sources: this.fb.array([])
    });
  }

  // Fetch the data for the specific client by their ID
  getAllCoWallet(clientId: number): void {
    // this.observable = this.clientService.apiClientGetAllClientsCOFundsGet()
    // this.subscription = this.observable.subscribe({
    //   next: (response: ClientCOFundsBalanceDTO[]) => {
    //     // Filter the data to get the vendor data for the selected client
    //     const selectedClient = response.find(client => client.ClientId === clientId);
    //     if (selectedClient && selectedClient.Vendors && selectedClient.Vendors.length > 0) {
    //       this.filteredVendors = selectedClient.Vendors;
    //       this.populateSourcesFormArray(); 
    //     } else {
    //       console.warn('No vendors found for the selected client');
    //     }
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     this.notification.showNotification("Error: " + error.error,"close","error");
    //   }
    // });
  }

  populateSourcesFormArray(): void {
    const sourcesArray = this.sources;
    this.filteredVendors.forEach(vendor => {
      sourcesArray.push(this.fb.group({
        VendorName: [vendor.VendorName],
        Amount: [
          this.decimalPipe.transform(vendor.COFundsBalance, '1.2-2')
        ]
      }));
    });
  }

  get sources(): FormArray {
    return this.CoWalletForm.get('Sources') as FormArray;
  }
}
