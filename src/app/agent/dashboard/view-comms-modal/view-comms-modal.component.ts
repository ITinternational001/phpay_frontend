import { Component, Inject, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-comms-modal',
  templateUrl: './view-comms-modal.component.html',
  styleUrls: ['./view-comms-modal.component.scss']
})
export class ViewCommsModalComponent implements OnInit {
  vendorComms = this.data.vendorComms;
  isLoading = false;
  dataSource = new MatTableDataSource(); 
  public observable!: Observable<any>;
  public subscription!: Subscription;

  displayedColumns: string[] = ['VendorName', 'CIComms', 'TotalCI', 'COComms', 'TotalCO', 'TotalCommission'];

  clientId: number = 0;
  clientName: string = '';
  GrandTotalCI: number = 0;
  GrandTotalCO: number = 0;
  GrandTotalCommission: number = 0;

  constructor(
    private agentService: AgentService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService
  ) {
    this.vendorComms = data.vendorComms;
    this.clientId = data.clientId;
    this.clientName = data.clientName;
    this.GrandTotalCI = data.GrandTotalCI || 0;
    this.GrandTotalCO = data.GrandTotalCO || 0;
    this.GrandTotalCommission = data.GrandTotalCommission || 0;
  }

  ngOnInit(): void {
    console.log('🚀 vendorComms:', this.vendorComms);
    this.dataSource.data = this.vendorComms || [];

    console.log('✅ Grand Totals:', {
      CI: this.GrandTotalCI,
      CO: this.GrandTotalCO,
      Commission: this.GrandTotalCommission
    });
  }
}
