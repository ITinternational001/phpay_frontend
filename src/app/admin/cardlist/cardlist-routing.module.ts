import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardlistComponent } from './cardlist.component';
import { Routes, RouterModule } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: CardlistComponent
  }
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})
export class CardlistRoutingModule { }
