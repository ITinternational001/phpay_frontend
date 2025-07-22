import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClientTransfersRoutingModule } from "src/app/admin/clients/client-pages/client-transfers/client-transfers-routing.module";
import { MaterialUIModule } from "src/shared/modules/material-ui.module";
import { ReactiveFormsModule } from "@angular/forms";
import { ComponentsModule } from "src/shared/components/components.module";
import { BrowserModule } from "@angular/platform-browser";
import { ClientTransferBalanceComponent } from "./client-transfer-balance.component";
import { ClientTransferBalanceRoutingModule } from "./client-transfer-balance-routing.module";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { HttpLoaderFactory } from "src/shared/helpers/helper";
import { HttpClient } from "@angular/common/http";

@NgModule({
    declarations: [
        ClientTransferBalanceComponent,
    ],

    imports: [
        CommonModule,
        ClientTransferBalanceRoutingModule,
        MaterialUIModule,
        ReactiveFormsModule,
        ComponentsModule,
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            }
          }),
        ],
        providers: [
          HttpClient

        
    ]
})
    export class clientTransferBalanceModule {}
