import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from './card-list.component';
import { CardListRoutingModule } from './card-list-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MatTableModule } from '@angular/material/table';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { TransactionComponent } from './transaction/transaction.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    CardListComponent,
    TransactionComponent,
  ],
  imports: [
    CommonModule,
    CardListRoutingModule,
    ComponentsModule,
    MatTableModule,
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
export class CardListModule { }
