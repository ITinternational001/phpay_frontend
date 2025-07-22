import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationRoutingModule } from './integration-routing.module';
import { IntegrationComponent } from './integration.component';
import { ComponentsModule } from 'src/shared/components/components.module';
import {MatDialogModule } from '@angular/material/dialog';
import {MatInputModule } from '@angular/material/input';
import {MatIconModule } from '@angular/material/icon';
import { IntegrationFormComponent } from './integration-form/integration-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { HttpClient } from '@angular/common/http';


@NgModule({
  declarations: [
    IntegrationComponent,
    IntegrationFormComponent
  ],
  imports: [
    CommonModule,
    IntegrationRoutingModule,
    ComponentsModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
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
export class IntegrationModule { }
