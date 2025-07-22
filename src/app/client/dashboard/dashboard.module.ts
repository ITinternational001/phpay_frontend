import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ComponentsModule } from 'src/shared/components/components.module';
import { IncomeStatementComponent } from './income-statement/income-statement.component';
import { DailyTransactionComponent } from './daily-transaction/daily-transaction.component';
import { MerchantSummaryComponent } from './merchant-summary/merchant-summary.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { NgChartsModule } from 'ng2-charts';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { PaymentChannelSummaryComponent } from './payment-channel-summary/payment-channel-summary.component';
import { PaymentchannelModalComponent } from './paymentchannel-modal/paymentchannel-modal.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    DashboardComponent,
    IncomeStatementComponent,
    DailyTransactionComponent,
    MerchantSummaryComponent,
    TransactionsComponent,
    PaymentChannelSummaryComponent,
    PaymentchannelModalComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ComponentsModule,
    MaterialUIModule,
    NgChartsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    HttpClient
  ]
})
export class DashboardModule { }
