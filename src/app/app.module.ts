import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityLogsService, ClientService, FeesService, MerchantsService, OtpsService, PaymentChannelsService, ProvidersService, TransactionsService, UserService, VendorsService } from 'src/shared/dataprovider/api';
import { JwtModule } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GoogleAuthComponent } from './google-auth/google-auth.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialUIModule } from 'src/shared/modules/material-ui.module';
import { ApiKeyService } from 'src/shared/dataprovider/api/api/apiKey.service';
import { TransactionLogsService } from 'src/shared/dataprovider/api/api/transactionLogs.service';
import { AuthService } from 'src/shared/dataprovider/api/api/auth.service';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { ReportsService } from 'src/shared/dataprovider/api/api/reports.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RemittanceService } from 'src/shared/dataprovider/api/api/remittance.service';
import { TokenInterceptor } from 'src/shared/helpers/token.interceptor';
import { TokenService } from 'src/shared/dataprovider/api/api/token.service';
import { AgentComponent } from './agent/agent.component';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { NotificationService } from 'src/shared/dataprovider/api/api/notification.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/shared/helpers/helper';
import { TransactionRedirectComponent } from './transaction-redirect/transaction-redirect.component';
import { TransactionPaymentComponent } from './transaction-payment/transaction-payment.component';

export function tokenGetter() {
  return localStorage.getItem("jwt");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PasswordresetComponent,
    GoogleAuthComponent,
    TransactionRedirectComponent,
    TransactionPaymentComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    HttpClientModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MaterialUIModule,
    MatNativeDateModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["localhost:7299"],
        disallowedRoutes: []
      }
    }),
    TranslateModule.forRoot({
      loader:{
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    UserService,
    OtpsService,
    MerchantsService,
    ProvidersService,
    PaymentChannelsService,
    VendorsService,
    ClientService,
    TransactionsService,
    FeesService,
    ApiKeyService,
    TransactionLogsService,
    AuthService,
    RolePermissionService,
    ReportsService,
    ActivityLogsService,
    DatePipe,
    RemittanceService,
    DecimalPipe,
    AuthService,
    TokenService,
    NotificationService,
    AgentService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    HttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
