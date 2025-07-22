import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionsService, UserCashInDTO } from 'src/shared/dataprovider/api';

@Component({
  selector: 'app-transaction-redirect',
  templateUrl: './transaction-redirect.component.html',
  styleUrls: ['./transaction-redirect.component.scss']
})
export class TransactionRedirectComponent {
  currentDate: string = "";
  signature: string | null = null;
  paymentStatus: string | null = null;
  paymentId: string | null = null;
  referenceNo: string | null = null;
  isProcessing: boolean = true;
  amount: number = 0;

  constructor(private route: ActivatedRoute, private _transactions: TransactionsService) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.signature = params.get('signature') ?? null;
      this.paymentStatus = params.get('x_payment_status') != null ? this.getStatus(params.get('x_payment_status')!) : "n/a";
      this.paymentId = params.get('x_payment_id') ?? null;
      this.referenceNo = params.get('x_reference_no') ?? "n/a";
    });

    this.getTransaction();
  }

  getStatus(swiftStatus: string) {
    var status = "";
    switch (swiftStatus) {
      case "EXECUTED":
        status = "SUCCESS";
        break;
      case "PENDING":
        status = "PENDING";
        break;
      case "CANCELLED":
        status = "CANCELLED";
        break;
      case "REJECTED":
        status = "REJECTED";
        break;
    }

    return status;
  }

  getTransaction() {
    this._transactions.apiTransactionsCashinsQueryGet(this.referenceNo ?? "").subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.Data)) {
          response.Data.map((item: any) => {
            this.isProcessing = true;
            this.amount = item.Amount ?? 0;
            this.currentDate = item.CompletedDate?.toString() ?? "n/a";
            console.log(this.amount);
          })
        }

      },
      error: () => { },
      complete: () => {
        this.isProcessing = false;
      }
    })
  }
}
