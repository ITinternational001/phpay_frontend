import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, PaymentChannelDTO, PaymentChannelsService, TransactionsService, VendorDTO, VendorsService } from 'src/shared/dataprovider/api';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../notification/notification.service';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { RemittanceWalletRequestTransferFundsSourceDTO } from 'src/shared/dataprovider/api/model/remittanceWalletRequestTransferFundsSourceDTO';
import { UserUpdateTransferFundsRequestDTO } from 'src/shared/dataprovider/api/model/userUpdateTransferFundsRequestDTO';
import { checkTransferType, convertFormattedAmount, DecimalPipeConverter, getCurrentUserId } from 'src/shared/helpers/helper';
import { DecimalPipe } from '@angular/common';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { ApproveRequestBalanceTransfer } from 'src/shared/dataprovider/api/model/approveRequestBalanceTransfer';
import { AgentClientChannelSummaryDTO } from 'src/shared/dataprovider/api/model/agentClientChannelSummaryDTO';
import { ClientPaymentChannel } from 'src/shared/dataprovider/api/model/clientPaymentChannel';
import { SelectOptions } from 'src/shared/dataprovider/local/interface/commonInterface';
import { ClientBalanceResultDTO } from 'src/shared/dataprovider/api/model/clientBalanceResultDTO';
import { ClientBalanceDTO } from 'src/shared/dataprovider/api/model/clientBalanceDTO';
import { ClientBalanceChannelDTO } from 'src/shared/dataprovider/api/model/clientBalanceChannelDTO';
import { BalanceTransferType, COFToRemittance, COFToWallet, remittanceToCOF, RemittanceToWallet, WalletToCOF, WalletToRemittance } from 'src/shared/dataprovider/local/data/common';
import { ClientBalanceVendorDTO } from 'src/shared/dataprovider/api/model/clientBalanceVendorDTO';
import { UpdateBalanceTransferRequestDTO } from 'src/shared/dataprovider/api/model/updateBalanceTransferRequestDTO';
import { TopUpStatusEnum } from 'src/shared/dataprovider/api/model/topUpStatusEnum';

export const Pending = 1;
export const Approved = 2;
export const Decline = 3;

@Component({
  selector: 'app-transfer-balance-modal',
  templateUrl: './transfer-balance-modal.component.html',
  styleUrls: ['./transfer-balance-modal.component.scss']
})
export class TransferBalanceModalComponent implements OnInit {
  transferForm!: FormGroup;
  public channelName = '';
  public clientName = '';
  public agentId = 0; // Initialize to 0
  public clientId = '';
  public totalFunds: string | null = '';
  public requestedAmount = '';
  public transferType: string = "";
  filteredVendors: any[] = [];
  public walletBalance: number = 0;
  isLoading = false;
  showMerchant: boolean = true;
  public isTransferBalance: boolean = true;
  public vendorOptions: SelectOptions[] = [];
  public channelOptions: SelectOptions[] = [];
  vendorList: VendorWithChannels[] = [];
  isHideDestination: boolean = false;
  isHideSource: boolean = false;
  actionDisable: boolean = false;
  transactionNumber : string = "";
  constructor(
    private _agentService: AgentService,
    private _paymentService: PaymentChannelsService,
    private fb: FormBuilder,
    public _dialogRef: MatDialogRef<TransferBalanceModalComponent>,
    private _clientService: ClientService,
    private _remittanceService: RemittanceService,
    private _notification: NotificationService,
    private _vendorService: VendorsService,
    private _decimalPipe: DecimalPipe,
    private _transactionService: TransactionsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {


    this.transferForm = this.fb.group({
      TransactionNumber: [''],
      TransferType: [''],
      Status: [2],
      Remarks: [''],
      Amount:[''],
    });
  }


  ngOnInit(): void {
    if (this.data) {
      // Use the agentId passed from the modal data
      this.agentId = this.data.AgentId || 0; // Ensure agentId is passed from the parent
      this.clientId = this.data.ClientId || '';
      this.channelName = this.data.channelName || '';
      this.clientName = this.data.clientName || '';
      this.transferType = BalanceTransferType.find(x => x.id == this.data.transferType)?.name!;
      this.requestedAmount = (this.data.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      this.transactionNumber = this.data.transactionNumber ?? this.data.requestId;
      this.transferForm.patchValue({
        TransactionNumber: this.data.transactionNumber ?? this.data.requestId,
        TransferType: this.data.transferType
      });

      this.checkCreationType(this.data.data.type);
      this.checkTransferType(this.data.transferType);

      // Fetch data based on transfer type
      if (this.isTransferBalance) {
        // For clientTransferBalance (Sources)

      } else {
        // For agentTransferBalance (PaymentChannels)
        if (this.agentId !== 0) {
          //this.getClientWallet(this.data);
          this.getPaymentChannels(this.agentId, this.data.clientId);
          this.isHideDestination = true;
        }
      }
    }
  }

  checkTransferType(transferType: number) {
    if (transferType === WalletToRemittance || transferType === COFToRemittance) {
      this.isHideDestination = true;
      this.isHideSource = false;
    } else if (transferType === remittanceToCOF || transferType === RemittanceToWallet) {
      this.isHideSource = true;
      this.isHideDestination = false;
    } else {
      this.isHideSource = false;
      this.isHideDestination = false;
    }
  }


  getPaymentChannels(agentId: number, clientId: number): void {
    this.isLoading = true;
    this._agentService.apiAgentRequestBalanceTransFerApproveGetClientPaymentChannelsGet(agentId, clientId).subscribe({
      next: (response: any) => {
        this.totalFunds = response.TotalFund
        response.PaymentChannels.map((item: any) => {
          var channel = { id: item.PaymentChannelId, name: item.PaymentChannelName + " (₱" + DecimalPipeConverter(item.WalletBalance, this._decimalPipe) + ")" };
          this.channelOptions.push(channel);
        })
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification("Error:" + error.error, "close", "error")
        this.isLoading = false;
      }
    });
  }

  checkCreationType(type: string) {
    switch (type) {
      case 'clientTransferBalance':
        this.isTransferBalance = true;
        break;
      case 'agentTransferBalance':
        this.isTransferBalance = false;
        break;
    }
  }

  onSubmit(): void {
   const params : UpdateBalanceTransferRequestDTO = {
    Amount: Number(this.requestedAmount.replace(/,/g, '')),
    TransactionNumber: this.transferForm.get("TransactionNumber")?.value,
    TransferType: this.data.transferType,
    Status: TopUpStatusEnum.NUMBER_2,
    Remarks:this.transferForm.get("Remarks")?.value
    
   }
    if (this.isTransferBalance) {
      this.onNormalTransferApproved(params)
    } else {
     // this.onAgentTransferApproved(cleanedFormValue)
    }
  }

  onNormalTransferApproved(parameters: UpdateBalanceTransferRequestDTO) {
    this._transactionService.updateBalanceTransfer(parameters).subscribe({
      next: (response) => {
        this.actionDisable = true;
        // this._dialogRef.close(true);
      },
      error: (error: HttpErrorResponse) => {
        this._notification.showNotification(error.error, "close", "error");
      },
      complete: () => {
        this._dialogRef.close(true);
      }
    })
  }

  onAgentTransferApproved(form: any) {
    let paymentChannels: { ChannelId: number; Amount: number }[] = [];
    if (Array.isArray(form.Sources)) {
      form.Sources.map((item: any) => {
        paymentChannels.push({ ChannelId: item.ChannelId, Amount: item.Amount });
      });
    }
    var params = {
      RequestId: form.TransactionNumber,
      ApprovedBy: getCurrentUserId(),
      PaymentChannels: paymentChannels
    }
    this._agentService.apiAgentRequestBalanceTransferApprovePut(params).subscribe({
        next: (response) => {
           this.actionDisable = true;
         },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error:" + error.message, "close", "error");
        },
        complete:()=>{
          this._dialogRef.close(true);
        }
      })
    }
}
interface Vendor {
  VendorId: number;
  VendorName: string;
  VendorWalletBalance: number;
}

interface Channel {
  ChannelId: number;
  ChannelName: string;
  WalletBalance: number;
  Vendors: Vendor[];
}

interface VendorWithChannels {
  VendorId: number;
  VendorName: string;
  Channels: {
    ChannelId: number;
    ChannelName: string;
    WalletBalance: number;
    VendorWalletBalance: number;
  }[];
}