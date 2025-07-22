import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CofundtransferComponent } from './cofundtransfer.component';
import { CofundtransferRoutingModule } from './cofundtransfer-routing.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/shared/components/components.module';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [
    CofundtransferComponent,
  ],
  imports: [
    CommonModule,
    CofundtransferRoutingModule,
    MaterialUIModule,
    ReactiveFormsModule,
    ComponentsModule,
  ]
})
export class CofundtransferModule { }
