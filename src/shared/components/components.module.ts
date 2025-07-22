import { Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopnavComponent } from './topnav/topnav.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SubmenuComponent } from './sidenav/submenu/submenu.component';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScreenComponent } from './screen/screen.component';
import { CardComponent } from './card/card.component';
import { TableComponent } from './table/table.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { SearchComponent } from './search/search.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { DownloadComponent } from './download/download.component';
import { WalletComponent } from './wallet/wallet.component';
import { FilterNavComponent } from './filter-nav/filter-nav.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MaterialUIModule } from '../modules/material-ui.module';
import { NotificationComponent } from './modals/notification/notification.component';
import { MatDatepicker } from '@angular/material/datepicker';
import { LogoutComponent } from './logout/logout.component';
import { NgChartsModule } from 'ng2-charts';
import { SwitchComponent } from './switch/switch.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ButtonComponent } from './button/button.component';
import { ModalComponent } from './modals/modal/modal.component';
import { TransferModalComponent } from './modals/transfer-modal/transfer-modal.component';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ReceiptDialogComponent } from './modals/receipt-dialog/receipt-dialog.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { NodataComponent } from './reusables/nodata/nodata.component';
import { IncomeReportComponent } from './reusables/income-report/income-report.component';
import { SummaryReportComponent } from './reusables/summary-report/summary-report.component';
import { RemittanceReportComponent } from './reusables/remittance-report/remittance-report.component';
import { CashoutTransactionsComponent } from './reusables/cashout-transactions/cashout-transactions.component';
import { BalanceTransferTableComponent } from './reusables/balance-transfer-table/balance-transfer-table.component';
import { ManualTopupTableComponent } from './reusables/manual-topup-table/manual-topup-table.component';
import { TopupModalComponent } from './modals/topup-modal/topup-modal.component';
import { NumberFormatDirective } from './number-format.directive';
import { StatusColorPipe } from './status-color.pipe';
import { NumbersOnlyDirective } from './numbers-only.directive';
import { WalletCardComponent } from './wallet-card/wallet-card.component';
import { RemittanceTableComponent } from './reusables/remittance-table/remittance-table.component';

import { RemittanceModalComponent } from './reusables/remittance-table/remittance-modal/remittance-modal.component';
import { WallettransferHistoryComponent } from './reusables/wallettransfer-history/wallettransfer-history.component';
import { TransferBalanceModalComponent } from './modals/transfer-balance-modal/transfer-balance-modal.component';
import { TransferBalanceFormComponent } from './reusables/transfer-balance-form/transfer-balance-form.component';
import { RemittanceCompletedComponent } from './reusables/remittance-table/remittance-completed/remittance-completed.component';
import { WalletTransferCompletedComponent } from './reusables/wallettransfer-history/wallet-transfer-completed/wallet-transfer-completed.component';
import { MaintenanceMessageComponent } from './reusables/maintenance-message/maintenance-message.component';

import { ProfileDetailsComponent } from './reusables/profile-details/profile-details.component';
import { ResetUserPasswordComponent } from './reusables/reset-user-password/reset-user-password.component';
import { CardCreateComponent } from './modals/card-create/card-create.component';
import { SelectSearchComponent } from './select-search/select-search.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { InputTextFieldComponent } from './reusables/input-text-field/input-text-field.component';
import { CoWalletsComponent } from './reusables/co-wallets/co-wallets.component';
import { CopViewDetailsComponent } from './reusables/remittance-table/cop-view-details/cop-view-details.component';
import { EodReportComponent } from './reusables/eod-report/eod-report.component';
import { TransactionSummaryTableComponent } from './reusables/eod-report/transaction-summary-table/transaction-summary-table.component';
import { CofTableComponent } from './reusables/eod-report/cof-table/cof-table.component';
import { AgentCommsTableComponent } from './reusables/eod-report/agent-comms-table/agent-comms-table.component';
import { VendorSummaryComponent } from './reusables/eod-report/vendor-summary/vendor-summary.component';
import { CoVendorSummaryComponent } from './reusables/eod-report/vendor-summary/co-vendor-summary/co-vendor-summary.component';
import { CoTransactionSummaryComponent } from './reusables/eod-report/transaction-summary-table/co-transaction-summary/co-transaction-summary.component';
import { RunningBalanceReportComponent } from './reusables/running-balance-report/running-balance-report.component';
import { TableAndGraphComponent } from './reusables/running-balance-report/table-and-graph/table-and-graph.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../helpers/helper';


@NgModule({
  declarations: [
    TopnavComponent,
    SidenavComponent,
    SubmenuComponent,
    ScreenComponent,
    CardComponent,
    TableComponent,
    DropdownComponent,
    SearchComponent,
    DatepickerComponent,
    DownloadComponent,
    WalletComponent,
    FilterNavComponent,
    NotificationComponent,
    LogoutComponent,
    SwitchComponent,
    ButtonComponent,
    ModalComponent,
    TransferModalComponent,
    ConfirmationModalComponent,
    PaginationComponent,
    ReceiptDialogComponent,
    SpinnerComponent,
    NodataComponent,
    IncomeReportComponent,
    SummaryReportComponent,
    RemittanceReportComponent,
    CashoutTransactionsComponent,
    BalanceTransferTableComponent,
    ManualTopupTableComponent,
    TopupModalComponent,
    NumberFormatDirective,
    StatusColorPipe,
    NumbersOnlyDirective,
    WalletCardComponent,
    RemittanceTableComponent,
    RemittanceModalComponent,
    WallettransferHistoryComponent,
    TransferBalanceModalComponent,
    TransferBalanceFormComponent,
    RemittanceCompletedComponent,
    MaintenanceMessageComponent,
    ProfileDetailsComponent,
    ResetUserPasswordComponent,
    CardCreateComponent,
    SelectSearchComponent,
    InputTextFieldComponent,
    CoWalletsComponent,
    CopViewDetailsComponent,
    EodReportComponent,
    TransactionSummaryTableComponent,
    CofTableComponent,
    AgentCommsTableComponent,
    VendorSummaryComponent,
    CoVendorSummaryComponent,
    CoTransactionSummaryComponent,
    RunningBalanceReportComponent,
    TableAndGraphComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialUIModule,
    NgChartsModule,
    MatSlideToggleModule,
    FormsModule,
    MatInputModule,
    OverlayModule,
    PortalModule,
    HttpClientModule,
    TranslateModule.forRoot({
          loader:{
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
  ],
  exports: [
    TopnavComponent,
    SidenavComponent,
    ScreenComponent,
    CardComponent,
    TableComponent,
    DropdownComponent,
    SearchComponent,
    DatepickerComponent,
    DownloadComponent,
    WalletComponent,
    FilterNavComponent,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatSlideToggleModule,
    SwitchComponent,
    ButtonComponent,
    ModalComponent,
    TransferModalComponent,
    ConfirmationModalComponent,
    PaginationComponent,
    SpinnerComponent,
    NodataComponent,
    IncomeReportComponent,
    SummaryReportComponent,
    RemittanceReportComponent,
    CashoutTransactionsComponent,
    BalanceTransferTableComponent,
    ManualTopupTableComponent,
    TopupModalComponent,
    NumberFormatDirective,
    StatusColorPipe,
    NumbersOnlyDirective,
    WalletCardComponent,
    RemittanceTableComponent,
    RemittanceModalComponent,
    WallettransferHistoryComponent,
    TransferBalanceFormComponent,
    MaintenanceMessageComponent,
    ResetUserPasswordComponent,
    ProfileDetailsComponent,
    SelectSearchComponent,
    InputTextFieldComponent,
    CoWalletsComponent,
    CopViewDetailsComponent,
    EodReportComponent,
    VendorSummaryComponent,
    RunningBalanceReportComponent,
    TableAndGraphComponent
  ],providers:[
    HttpClient
  ]
})
export class ComponentsModule { }
