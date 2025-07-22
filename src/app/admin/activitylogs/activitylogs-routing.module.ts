import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitylogsComponent } from 'src/app/admin/activitylogs/activitylogs.component';
import { Routes, RouterModule } from '@angular/router';



const routes : Routes = [
  {
    path: "",
    component: ActivitylogsComponent
  }
];

@NgModule({
 imports: [RouterModule.forChild(routes)],
 exports: [RouterModule]
})
export class ActivitylogsRoutingModule { }
