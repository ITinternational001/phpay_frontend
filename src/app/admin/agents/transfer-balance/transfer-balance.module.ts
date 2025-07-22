import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransferBalanceRoutingModule } from './transfer-balance-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';




@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    TransferBalanceRoutingModule,
    ComponentsModule,
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
export class TransferBalanceModule { }
