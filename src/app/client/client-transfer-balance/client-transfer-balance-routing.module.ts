import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClientTransferBalanceComponent } from "./client-transfer-balance.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [{

    path:"",
    component: ClientTransferBalanceComponent
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    
})
export class ClientTransferBalanceRoutingModule { }