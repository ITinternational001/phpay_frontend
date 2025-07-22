import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesComponent } from './roles.component';
import { RolesRoutingModule } from './roles-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { RolesFormComponent } from './roles-form/roles-form.component';
import { PageAccessComponent } from './page-access/page-access.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';



@NgModule({
  declarations: [
    RolesComponent,
    RolesFormComponent,
    PageAccessComponent,
  ],
  imports: [
    CommonModule,
    RolesRoutingModule,
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
export class RolesModule { }
