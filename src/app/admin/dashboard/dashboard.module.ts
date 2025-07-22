import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from 'src/app/admin/dashboard/dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ClientsSummaryComponent } from './clients-summary/clients-summary.component';
import { DailyTransactionComponent } from './daily-transaction/daily-transaction.component';
import { IncomeStatementComponent } from './income-statement/income-statement.component';
import { TotalIncomeComponent } from './total-income/total-income.component';
import { ComponentsModule } from 'src/shared/components/components.module';
import { NgChartsModule } from 'ng2-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';



@NgModule({
  declarations: [
    DashboardComponent,
    ClientsSummaryComponent,
    DailyTransactionComponent,
    IncomeStatementComponent,
    TotalIncomeComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ComponentsModule,
    NgChartsModule,
    MatDatepickerModule,
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
