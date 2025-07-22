import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsRoutingModule } from './vendors-routing.module';
import { VendorsComponent } from './vendors.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { VendorPriorityModalComponent } from './vendor-priority-modal/vendor-priority-modal.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';




@NgModule({
  declarations: [
    VendorsComponent,
    VendorFormComponent,
    VendorPriorityModalComponent
  ],
  imports: [
    CommonModule,
    VendorsRoutingModule,
    ReactiveFormsModule,
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
export class VendorsModule { }
