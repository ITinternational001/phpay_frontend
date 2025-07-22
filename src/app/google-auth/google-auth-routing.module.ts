import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAuthComponent } from './google-auth.component';
import { Routes, RouterModule } from '@angular/router';

const routes : Routes = [
  {
    path : '',
    component:GoogleAuthComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoogleAuthRoutingModule { }
