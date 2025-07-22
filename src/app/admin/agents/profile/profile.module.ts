import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ComponentsModule } from 'src/shared/components/components.module';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';



@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ComponentsModule,
    MaterialUIModule,
  ]
})
export class ProfileModule { }
