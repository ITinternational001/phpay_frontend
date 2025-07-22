import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhitelistingComponent } from './whitelisting.component';
import { RouterModule, Routes } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: WhitelistingComponent
  }
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})
export class WhitelistingRoutingModule { }
