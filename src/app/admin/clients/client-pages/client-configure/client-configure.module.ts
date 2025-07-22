import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientConfigureRoutingModule } from './client-configure-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { ClientConfigureComponent } from './client-configure.component';
import { RouterModule } from '@angular/router';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { FormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    ClientConfigureComponent
  ],
  imports: [
    CommonModule,
    ClientConfigureRoutingModule,
    MaterialUIModule,
    ComponentsModule,
    FormsModule,
     RouterModule.forChild([
      { path: '', component: ClientConfigureComponent }
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
export class ClientConfigureModule { }
