import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientTransfersRoutingModule } from './client-transfers-routing.module';
import { ClientTransfersComponent } from './client-transfers.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from 'src/shared/components/components.module';

import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { WallettransferHistoryComponent } from 'src/shared/components/reusables/wallettransfer-history/wallettransfer-history.component';
import { ɵInternalFormsSharedModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';
import { WalletTransferCompletedComponent } from 'src/shared/components/reusables/wallettransfer-history/wallet-transfer-completed/wallet-transfer-completed.component';





@NgModule({
  declarations: [
    ClientTransfersComponent,
    WalletTransferCompletedComponent
    
    
  ],
  imports: [
    CommonModule,
    ClientTransfersRoutingModule,
    MaterialUIModule,
    ComponentsModule,
    FormsModule,
     RouterModule.forChild([
      { path: 'Dropdown', component: ClientTransfersComponent }
      // Add other routes if needed
    ]),
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
export class ClientTransfersModule { }
