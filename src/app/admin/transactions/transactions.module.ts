import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsComponent } from './transactions.component';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { IncomeReportComponent } from './income-report/income-report.component';
import { SummaryComponent } from './summary/summary.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';




@NgModule({
  declarations: [
    TransactionsComponent,
    IncomeReportComponent,
    SummaryComponent,
  ],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    MaterialUIModule,
    ComponentsModule,
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
export class TransactionsModule { }
