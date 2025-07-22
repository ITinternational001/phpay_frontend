import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MerchantsRoutingModule } from './merchants-routing.module';
import { MerchantsComponent } from './merchants.component';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { WithdrawalfeesComponent } from './withdrawalfees/withdrawalfees.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [
    MerchantsComponent,
    WithdrawalfeesComponent,
    TransactionsComponent
  ],
  imports: [
    CommonModule,
    MerchantsRoutingModule,
    ComponentsModule,
    MatTableModule,
    MatButtonModule,
    MaterialUIModule,
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
export class MerchantsModule { }
