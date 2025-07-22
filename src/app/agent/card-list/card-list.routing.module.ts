import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from './card-list.component';
import { RouterModule, Routes } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: CardListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class AgentCardListRoutingModule { }
