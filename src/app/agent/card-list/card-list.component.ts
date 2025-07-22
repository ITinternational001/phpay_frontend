import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { CardIdList,  TopCardData, TransferMethod } from 'src/shared/dataprovider/local/data/common';
import { getCurrentUsersAgentId,  getTransferMethod, getUserPermissionsAccess, transposeToNotApplicable } from 'src/shared/helpers/helper';
import { CardCreateComponent } from 'src/shared/components/modals/card-create/card-create.component';
import { CardRequestDTO } from 'src/shared/dataprovider/api/model/cardRequestDTO';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';

@Component({
  selector: 'app-agent-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements OnInit {
  @Input() isAdmin = false;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  transferMethod = TransferMethod;
  public cardTypes = CardIdList;
  topData = TopCardData.clientWalletBalance;
  displayedColumns: string[] = ['Id', 'BinanceWalletAddress', 'CardName', 'AccountName', 'AccountNumber', 'CardType', 'NickName', 'Actions'];
  dataSource!: MatTableDataSource<any>;
  currentPage: number = 1; // Current page
  totalItems: number = 0; // Total number of items
  itemsPerPage = itemsPerPageOptions[0];
  dataSource1!: MatTableDataSource<any>;
  public isLoading: boolean = false;
  public isReadAndWrite:boolean = false;
  tableData = [{
    Id: 0,
    BinanceWalletAddress: "",
    CardName: "",
    AccountName: "",
    AccountNumber: "",
    CardType: "",
    NickName: "",
  }];
    language: string = "";
    actionDisable: boolean = false;
  constructor(private _dialog: MatDialog,
    private notification: NotificationService,
    private _agentService: AgentService,
    private route: ActivatedRoute,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
     }

  async ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    await this.getCardsByClient();
    console.log(getCurrentUsersAgentId());
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  getCardsByClient(keyword: string = '') {
    this.isLoading = true;

    let id = getCurrentUsersAgentId();
    this.observable = this._agentService.apiAgentCardListGet(id, this.currentPage, this.itemsPerPage, keyword, undefined);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.actionDisable = true;
        console.log(response);
        if (response.length > 0) {
          this.totalItems = response.length;
          this.tableData = response.map((item :any) => ({
            Id: item.CardId ? item.CardId : 0,
            BinanceWalletAddress: item.BinanceWalletAddress ? transposeToNotApplicable(item.BinanceWalletAddress) : "n/a",
            CardName: item.BankName ? transposeToNotApplicable(item.BankName) : "n/a",
            AccountName: item.AccountName ? item.AccountName : "-",
            AccountNumber: item.AccountNumber ? transposeToNotApplicable(item.AccountNumber) : "-",
            CardType: item.Type !== undefined ? getTransferMethod(item.Type) : "-",
            NickName: item.NickName !== undefined ? item.NickName : "-",
            ClientId: item.ClientId,
          }));
          this.topData[0].value = response[0].Balance ? response[0].Balance : 0;
          this.dataSource = new MatTableDataSource(this.tableData);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Something went wrong " + error.error + ", please refresh the page", "close", "error");
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  openForm(type: number) {
    const dialogRef = this._dialog.open(CardCreateComponent, {
      data: { cardType: type },
      width: '600px',
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val?.isContinue) {
          this.saveNewCard({ ...val.data, cardType: type });
        }
      },
    });
  }
  

  saveNewCard(val: any) {
    const parameters: CardRequestDTO = {
      AgentId: getCurrentUsersAgentId(),
      Type: val.cardType, 
      BankName: val.BankName,
      AccountNumber: val.AccountNumber,
      AccountName: val.AccountName,
      NickName: val.NickName,
      BinanceWalletAddress: val.BinanceWalletAddress,
    };
  
    this.observable = this._agentService.apiAgentCardCreatePost(parameters);
    this.subscription = this.observable.subscribe({
      next: () => 
         this.getCardsByClient(),
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification(`Error saving card: ${error.error}`, 'close', 'error');
      },
      complete: () => {
        this.notification.showNotification('Card added successfully', 'close', 'success');
      },
    });
  }

  onFirstPage(): void {
    this.loadPage(1);
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.itemsPerPage)) {
      this.loadPage(this.currentPage + 1);
    }
  }

  onLastPage(): void {
    this.loadPage(Math.ceil(this.totalItems / this.itemsPerPage));
  }

  onItemsPerPageChanged(selectedItemsPerPage: number): void {
    this.itemsPerPage = selectedItemsPerPage;
    // Reload the page with the new itemsPerPage
    this.loadPage(this.currentPage);
  }

  loadPage(page: number, keyword?: string): void {
    this.currentPage = page;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    // Determine if it's the last page
    const isLastPage = this.currentPage === Math.ceil(this.totalItems / this.itemsPerPage);

    // Load data for the selected page here
    this.getCardsByClient(keyword ?? '');
  }
  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
  }

}
