import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationComponent } from './integration.component';
import { RouterModule, Routes } from '@angular/router';


const routes : Routes = [
  {
    path: "",
    component: IntegrationComponent
  }
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})
export class IntegrationRoutingModule { }
