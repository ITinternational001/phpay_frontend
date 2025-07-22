import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRemittancesComponent } from './client-remittances.component';
import { ClientRemittancesRoutingModule } from './client-remittances-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    ClientRemittancesComponent
  ],
  imports: [
    CommonModule,
    ClientRemittancesRoutingModule,
    MaterialUIModule,
    ComponentsModule,
    FormsModule,
     RouterModule.forChild([
      { path: '', component: ClientRemittancesComponent }
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
export class ClientRemittancesModule { }
