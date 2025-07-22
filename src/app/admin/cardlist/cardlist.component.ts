import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TopCardData, cardsData, cardListData, TransferMethod, ConfigFeeMethod, CardIdList } from '../../../shared/dataprovider/local/data/common';
import { Observable, Subscription } from 'rxjs';
import { ClientService } from 'src/shared/dataprovider/api';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CardDTO } from 'src/shared/dataprovider/api/model/cardDTO';
import { getCardTypeId, getCurrentUserId, getCurrentUserClientId, getTransferMethod, getUserPermissionsAccess, transposeToNotApplicable } from 'src/shared/helpers/helper';
import { MatDialog } from '@angular/material/dialog';
import { CardCreateComponent } from 'src/shared/components/modals/card-create/card-create.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { itemsPerPageOptions } from 'src/shared/dataprovider/local/data/general';
import { ClientCardListDTO } from 'src/shared/dataprovider/api/model/clientCardListDTO';

@Component({
  selector: 'app-cardlist',
  templateUrl: './cardlist.component.html',
  styleUrls: ['./cardlist.component.scss']
})
export class CardlistComponent {
  private observable!: Observable<any>;
  private subscription!: Subscription;
  transferMethod = TransferMethod;
  public cardTypes = CardIdList;
  public isReadAndWrite : boolean = false;
  topData = TopCardData.clientWalletBalance;
  displayedColumns1: string[] = ['Id', 'BinanceWalletAddress', 'CardName', 'AccountName', 'AccountNumber', 'CardType', 'NickName', 'Actions'];
  dataSource!: MatTableDataSource<any>;
  totalItems: number = 0;
  itemsPerPage = itemsPerPageOptions[0]; 
  currentPage: number = 1;
  dataSource1!: MatTableDataSource<any>;
  public isLoading: boolean = false;
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
  constructor(
    private _dialog: MatDialog,
    private notification: NotificationService,
    private _clientService: ClientService,
    private route: ActivatedRoute,
    private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
     }

  async ngOnInit() {
    this.isReadAndWrite = getUserPermissionsAccess(this.route.snapshot.data['routeName']);
    await this.getCardsByAgent();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  getCardsByAgent(keyword: string = '') {
    this.isLoading = true;
    const pageSize = this.itemsPerPage;
    const pageNumber = this.currentPage;
    const id: number = parseInt(sessionStorage.getItem('clientId') as string);
  
    this.observable = this._clientService.apiClientGetCardsByClientIdGet(id, this.itemsPerPage, this.currentPage, keyword);
  
    this.subscription = this.observable.subscribe({
      next: (response: ClientCardListDTO) => {
        const cards = response.Data || [];
  
        this.totalItems = response.TotalRecordCount || 0;
  
        this.tableData = cards.map((item) => ({
          Id: item.Id ?? 0,
          BinanceWalletAddress: item.BinanceWalletAddress ? transposeToNotApplicable(item.BinanceWalletAddress) : "n/a",
          CardName: item.BankName ? transposeToNotApplicable(item.BankName) : "n/a",
          AccountName: item.AccountName ?? "-",
          AccountNumber: item.AccountNumber ? transposeToNotApplicable(item.AccountNumber) : "-",
          CardType: item.Type !== undefined ? getTransferMethod(item.Type) : "-",
          CardTypeId: item.Type ?? '',
          NickName: item.NickName ?? "-",
          ClientId: item.ClientId,
          Type: item.Type
        }));
  
        this.topData[0].value = cards.length > 0 && cards[0].Balance ? cards[0].Balance : 0;
  
        this.dataSource1 = new MatTableDataSource(this.tableData);
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
    const dialogRef = this._dialog.open(CardCreateComponent, { data: { cardType: type }, width: '600px' });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val.isContinue) {
          this.saveNewCard({...val.data, cardType:type});
        }
      }
    });
  }

  saveNewCard(val: any) {
    const parameters = {
      ClientId: getCurrentUserClientId(),
      CardType: val.cardType,
      BankName: val.BankName,
      AccountNumber: val.AccountNumber,
      AccountName: val.AccountName,
      NickName: val.NickName,
      BinanceWalletAddress: val.BinanceWalletAddress
    }
    this.observable = this._clientService.apiClientCreateCardPost(parameters);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.actionDisable = true;
        this.getCardsByAgent();
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error on saving new card" + error.error, "close", 'error');
      },
      complete: () => { 
        this.notification.showNotification("Card Added successfully", "close", 'success');
      }
    });
  }

  openEditForm(data: any) {
    console.log(data);
    const dialogRef = this._dialog.open(CardCreateComponent, {
      data: {
        isUpdate: true,
        details: data,
        cardType: data.Type ?? 0
      },
      width: '600px'
    });
  
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val?.isContinue) {
          this.updateCard({ ...val.data, Id: data.Id });
        }
      }
    });
  }
  
  
  

  updateCard(val: any) {
    const parameters = {
      Id: val.Id,
      ClientId: getCurrentUserClientId(),
      CardType: val.cardType,
      BankName: val.BankName,
      AccountNumber: val.AccountNumber,
      AccountName: val.AccountName,
      NickName: val.NickName,
      BinanceWalletAddress: val.BinanceWalletAddress
    }
     this.observable = this._clientService.apiClientUpdateCardPut(parameters);
    this.subscription = this.observable.subscribe({
      next: (response) => {
        this.actionDisable = true;
        this.getCardsByAgent();
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error on saving new card" + error.error, "close", 'error');
      },
      complete: () => { 
        this.notification.showNotification("Card details updated successfully", "close", 'success');
      }
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
    this.getCardsByAgent(keyword ?? '');
  }
  onSearch(query: string): void {
    // Handle the search query, e.g., make an API call or filter data
    this.loadPage(1, query);
  }
}