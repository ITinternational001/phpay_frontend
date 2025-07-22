import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceComponent } from './remittance.component';
import { RemittanceRoutingModule } from './remittance-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MatTableModule } from '@angular/material/table';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { WalletsComponent } from './wallets/wallets.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [
    RemittanceComponent,
    WalletsComponent,
    
  ],
  imports: [
    CommonModule,
    RemittanceRoutingModule,
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
export class RemittanceModule { }
