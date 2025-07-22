import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ClientDTO, ClientService } from 'src/shared/dataprovider/api';
import { TransactionStatus } from 'src/shared/dataprovider/local/data/common';
import { Filters } from 'src/shared/dataprovider/local/data/general';
import { NotificationService } from '../modals/notification/notification.service';
import { ClientWalletListDTO } from 'src/shared/dataprovider/api/model/clientWalletListDTO';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() dropDownType: string = "";
  @Input() controlName: string = "";
  @Output() valueChange = new EventEmitter<string>();
  filterOptions: any[] = [];
  filterLabel: string = "";
  filterIcon: string = "";
  filterPlaceholder: string = "";
  @Input() isVisible: boolean = false;
  obsClient!: Observable<any>;
  subsClient!: Subscription;
  public selectLabel ='';
  constructor( private _clientService: ClientService, private notification: NotificationService) { }

  ngOnInit(): void {
    if (this.dropDownType == "TransactionStatus") {
      this.filterOptions = TransactionStatus;
      this.filterLabel = "Status";
      this.filterIcon = Filters.getFilter.Vendors.icon;
    } else if (this.dropDownType == "Clients") {
      this.getAllClients();
      this.selectLabel = 'Client'
    } 
  }

  getAllClients() {
    this.obsClient = this._clientService.apiClientGetAllClientsGet();
    this.subsClient = this.obsClient.subscribe({
      next: (response: ClientWalletListDTO) => {
        if(response.Data != null){
          this.filterOptions = response.Data;
        }
       
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showNotification("Error:" + error.error, "close", "error");
      },
      complete: () => {
      }
    });
  }

  onDropdownChange(event: any) {
    const selectedValue = event?.value;
    if (event) {
      this.valueChange.emit(selectedValue);
    }
  }
}