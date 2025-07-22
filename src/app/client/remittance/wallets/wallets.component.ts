import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { TransferModalComponent } from 'src/shared/components/modals/transfer-modal/transfer-modal.component';
import { ClientService, MerchantsService } from 'src/shared/dataprovider/api';
import { MerchantsListDTO } from 'src/shared/dataprovider/api/model/merchantsListDTO';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-client-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss']
})
export class WalletsComponent implements OnInit {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  public listOfWallet: Wallet[] = [];
  public groupedArray:any= [];
  public isTransfer:boolean=false;

  @Input() clientId!: number;
  constructor(
    private _clientService: ClientService, 
    private _merchantService: MerchantsService, 
    private _dialog:MatDialog, private notification: NotificationService,) { }

  ngOnInit(): void {
    this.getCardsByClientId();
    this.getMerchantByClientId();
  }

  onTransferFunds(data:any, type:any, totalfund:number){
    let width = '600px';
    if(type != 'transfer'){
      width = '500px'
    }
    const dialogRef = this._dialog.open(TransferModalComponent, { width: width, data:{data:data,type:type, totalfund} });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.notification.showNotification("Transfer fund successfully", "close", 'success');
        }
      }
    });
  }

  getCardsByClientId() {
    let clientId = parseInt(SessionManager.getFromToken('ClientId'));
    this.observable = this._clientService.apiClientGetCardsByClientIdGet(clientId);
    this.subscription = this.observable.subscribe({
      next: (response) => {
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      }
    });
  }

      getMerchantByClientId() {
        this.observable = this._merchantService.apiMerchantsGetMerchantsByClientIdGet(this.clientId);
        this.subscription = this.observable.subscribe({
          next: (response: MerchantsListDTO) => {
            if (response && Array.isArray(response)) {
              this.listOfWallet = response.map((item: any) => {
                return { 
                  Id: item.Id, 
                  Name: item.Name?.replace("DPayTest ", ""), 
                  VendorId: item.Vendor.Id, 
                  Balance: item.Balance, 
                  TotalCashIn: item.TotalCashIn, 
                  TotalCashOut: item.TotalCashOut,
                  VendorName: item.Vendor.Name,
                  ClientId: item.Client.Id
                };
              });

              // Group the data based on vendorId
              const groupedData: { [key: number]: { VendorName: string, Data: Wallet[] } } = this.listOfWallet.reduce((acc: any, curr) => {
                const vendorId = curr.VendorId;
                const vendorName = curr.VendorName;
                if (!acc[vendorId]) {
                  acc[vendorId] = {
                    VendorName: "", // Initialize VendorName
                    Data: [] ,      // Initialize Data array
                    TotalBalance: 0
                  };
                }
                // Check if VendorName is not set yet
                if (!acc[vendorId].VendorName) {
                  // You need to set VendorName here, you might fetch it from somewhere
                  acc[vendorId].VendorName = "DynastyPay " + vendorId;
                }
                acc[vendorId].Data.push(curr);
                acc[vendorId].TotalBalance += curr.Balance;
                return acc;
              }, {});

              // Convert the object into an array of values
              this.groupedArray = Object.values(groupedData).map((group: any) => [group]); // Wrap each group in an array  
            } else {
              this.notification.showNotification("Error: Invalid merchants data", "close", "error");
            }
          },
          error: (error: HttpErrorResponse) => {
            this.notification.showNotification("Error:" + error.error, "close", "error");
          },
          complete: () => {
            this.subscription.unsubscribe();
          }
        });
    }
}


export interface Wallet {
  Id: number, Name: string, VendorId: number, Balance: number, TotalCashIn: number, TotalCashOut: number, VendorName:string, ClientId:number
}
