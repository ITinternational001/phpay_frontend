import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardsRoutingModule } from './cards-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    CardsRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class CardsModule { }
