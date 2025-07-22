import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardDTO } from 'src/shared/dataprovider/api/model/cardDTO';
import { ClientService } from 'src/shared/dataprovider/api';
import { HttpErrorResponse } from '@angular/common/http';
import { convertFormattedAmount, getCurrentUserId, getCurrentUserClientId } from 'src/shared/helpers/helper';
import { ConfirmationModalComponent } from 'src/shared/components/modals/confirmation-modal/confirmation-modal.component';
import { AgentBankType } from 'src/shared/dataprovider/api/model/agentBankType';
import { DecimalPipe } from '@angular/common';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agent-remittance-modal',
  templateUrl: './agent-remittance-modal.component.html',
  styleUrls: ['./agent-remittance-modal.component.scss'],
})
export class AgentRemittanceModalComponent implements OnInit {
  agentremittanceForm!: FormGroup;
  private subscription!: Subscription;
  private observable!: Observable<any>;
  private obsCard!: Observable<any>;
  private obsRelease!: Observable<any>;
  private subsRelease!: Subscription;
  private subsCard!: Subscription;
  selectedFiles: Blob[] = [];
  uploadedFiles: File[] = [];
  fileNames: string[] = [];
  cards: any[] = [];
  actionDisable: boolean = false;
  public cardDetails: { agentBankName: string; agentAccountName: string; agentAccountNumber: string } | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  language: string = "";
  constructor(
    private fb: FormBuilder,
    private agentService: AgentService,
    private clientService: ClientService,
    private notification: NotificationService,
    private dialogRef: MatDialogRef<any>,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
    this.agentremittanceForm = this.fb.group({
      TransactionId: ['',],
      DateRemitted: [ '', Validators.required],
      ModeOfPayment: ['', Validators.required],
      TotalAmount: [ 0, Validators.required],
      WithdrawalCount: [0, Validators.required],
      Source: [''],
      BankDetails: ['', Validators.required],
      ConfirmAmount: ['', Validators.required],
      TransactionFee: [''],
      TransferFee: ['', Validators.required],
      ReferenceNumber: ['', Validators.required],
      Remarks: ['', ],
      DepositSlips: [],
      ApproveBy: [],
    });
  }

  ngOnInit(): void {
    const formattedTotalAmount = this.decimalPipe.transform(this.data?.TotalAmount, '1.2-2');
    console.log('Formatted Total Amount:', formattedTotalAmount);

    console.log('Initial Data:', this.data?.TransacationFees); 

    this.agentremittanceForm.patchValue({
      ModeOfPayment: this.data?.MethodDescription,
        DateRemitted: this.data?.TimeStamp,
        TransactionId: this.data?.TransactionId,
        TotalAmount: formattedTotalAmount,
        BankDetails: this.data?.MOP,
        TransactionFee: this.data?.TransactionFees,
      
    });

    console.log('Form Values after Patch:', this.agentremittanceForm.value);
    this.calculateConfirmAmountFee();
    this.calculateTransferFee();
    this.getCardList(this.data?.AgentId);  
    this.getWalletCards();  
  }

  private calculateConfirmAmountFee(): number {
    const confirmAmount = parseFloat(this.agentremittanceForm.value.ConfirmAmount) || 0;
    const transferFee = parseFloat(this.agentremittanceForm.value.TransferFee) || 0;
  
    const totalAmount = confirmAmount + transferFee;
    
    console.log(`Confirm Amount: ${confirmAmount}, Transfer Fee: ${transferFee}, Total Amount: ${totalAmount}`);
  
    return totalAmount;
  }
  

  private calculateTransferFee(): void {
    this.agentremittanceForm.get('TransferFee')?.valueChanges.subscribe((count) => {
      this.updateTransferFee();
    });

    this.agentremittanceForm.get('ModeOfPayment')?.valueChanges.subscribe((method) => {
      this.updateTransferFee();
    });
  }

  private updateTransferFee(): void {
    const withdrawalCount = this.agentremittanceForm.get('TransferFee')?.value || 0;
    const method = this.agentremittanceForm.get('ModeOfPayment')?.value;
    const transactionFees = this.data?.TransactionFees || {};

    let fee = 0;
    if (method === 'Bank') {
        fee = transactionFees.BankWithdrawalFee * withdrawalCount;
    } else if (method === 'USDT') {
        fee = transactionFees.USDTWithdrawalFee * withdrawalCount;
    } else if (method === 'Cash-On Pick up') {
        fee = transactionFees.CashOnPickupWithdrawalFee * withdrawalCount;
    }

    this.agentremittanceForm.get('WithdrawalCount')?.setValue(Math.round(fee), { emitEvent: false });
}


getCardList(agentId: number): void {
  if (!agentId) return;
  const cardId = this.data?.MOP;
  this.observable = this.agentService.apiAgentCardListGet(agentId);
  
  this.subscription = this.observable.subscribe({
      next: (response) => {
          if (response && response.length > 0) {
              const mainCard = response.find((card: CardDTO) => card.Id === cardId) || response[0];
              
              this.cardDetails = {
                  agentBankName: mainCard?.BankName || '',
                  agentAccountName: mainCard?.AccountName || '',
                  agentAccountNumber: mainCard?.AccountNumber || '',
              };
              this.agentremittanceForm.patchValue({
                  agentBankName: this.cardDetails.agentBankName,
                  agentAccountName: this.cardDetails.agentAccountName,
                  agentAccountNumber: this.cardDetails.agentAccountNumber
              });
          } else {
              console.warn("No cards found for agent.");
              this.cardDetails = {
                  agentBankName: '',
                  agentAccountName: '',
                  agentAccountNumber: '',
              };
          }
      },
      error: (error: HttpErrorResponse) => {
          console.error("Error fetching card list:", error);
          this.notification.showNotification("Error fetching card list: " + error.error, "close", "error");
      },
  });
}




  getWalletCards(): void {
    const clientId = getCurrentUserClientId(); 

    if (this.obsCard) {
      this.subsCard.unsubscribe();
    }

    this.obsCard = this.clientService.apiClientGetCardsByClientIdGet(clientId);
    this.subsCard = this.obsCard.subscribe({
      next: (response) => {
        console.log('CARDS', response);
        this.cards = response;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification('Error: ' + error.error, 'close', 'error');
      },
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files).map(file => file as File);
      this.fileNames = Array.from(input.files).map(file => file.name);
      this.agentremittanceForm.patchValue({ DepositSlips: this.selectedFiles });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  getCurrentUserId(): number {
    return parseInt(SessionManager.getFromToken('Id'));
  }

  onReleaseRemittance(): void {
    if (this.agentremittanceForm.valid) {
      const calculatedAmount = this.calculateConfirmAmountFee(); // Get the summed amount
      const approveById = this.getCurrentUserId();
  
      this.agentremittanceForm.patchValue({
        ConfirmAmount: calculatedAmount, // Use the calculated amount
        ApproveBy: approveById,
      });
  
      console.log(`Final ConfirmAmount (Summed): ${calculatedAmount}`);
  
      const data = {
        release: true,
        form: {
          ...this.agentremittanceForm.value,
        },
        row: this.data,
      };
  
      this.dialogRef.close(data);
    } else {
      this.notification.showNotification('Please fill in all required fields.', 'close', 'error');
    }
  }
  


}



