import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentAllocationComponent } from './agent-allocation.component';
import { Routes, RouterModule } from '@angular/router';




const routes : Routes = [
  {
    path: "",
    component: AgentAllocationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
 })
export class AgentAllocationRoutingModule { }
