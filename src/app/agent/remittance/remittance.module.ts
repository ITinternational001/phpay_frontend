import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceRoutingModule } from './remittance-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { AgentRemittanceModalComponent } from './agent-remittance-modal/agent-remittance-modal.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    
  
    AgentRemittanceModalComponent
  ],
  imports: [
    CommonModule,
    RemittanceRoutingModule,
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
export class RemittanceModule { }
