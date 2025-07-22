import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardlistComponent } from './cardlist.component';
import { CardlistRoutingModule } from './cardlist-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { TransactionComponent } from './transaction/transaction.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    CardlistComponent,
    TransactionComponent,
  ],
  imports: [
    CommonModule,
    CardlistRoutingModule,
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
export class CardlistModule { }
