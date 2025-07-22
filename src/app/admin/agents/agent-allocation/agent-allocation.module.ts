import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentAllocationComponent } from './agent-allocation.component';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { AgentAllocationRoutingModule } from './agent-allocation-routing.module';
import { ViewAgentModalComponent } from './view-agent-modal/view-agent-modal.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    AgentAllocationComponent,
    ViewAgentModalComponent
  ],
  imports: [
    CommonModule,
    AgentAllocationRoutingModule,
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
export class ManagementModule { }
