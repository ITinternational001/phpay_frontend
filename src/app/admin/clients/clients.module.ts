import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { ClientsFormComponent } from './clients-form/clients-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { GenerateFormComponent } from './generate-form/generate-form.component';
import { StatusFormComponent } from './status-form/status-form.component';
import { WfeeAddFormComponent } from './client-pages/wfee-add-form/wfee-add-form.component';
import { CoWalletModalComponent } from '../../../shared/components/reusables/co-wallets/co-wallet-modal/co-wallet-modal.component';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';




@NgModule({
  declarations: [
    ClientsComponent,
    ClientsFormComponent,
    GenerateFormComponent,
    StatusFormComponent,
    WfeeAddFormComponent,
    CoWalletModalComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    MaterialUIModule,
    ReactiveFormsModule,
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
export class ClientsModule { }
