import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { WhitelistingRoutingModule } from './whitelisting-routing.module';
import { WhitelistingComponent } from './whitelisting.component';
import { WhitelistingFormComponent } from './whitelisting-form/whitelisting-form.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    WhitelistingComponent,
    WhitelistingFormComponent
  ],
  imports: [
    CommonModule,
    MaterialUIModule,
    ComponentsModule,
    ReactiveFormsModule,
    WhitelistingRoutingModule,
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
export class WhitelistingModule { }
