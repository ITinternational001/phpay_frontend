import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AgentService } from 'src/shared/dataprovider/api/api/agent.service';
import { DashboardTotalCommDTO } from 'src/shared/dataprovider/api/model/dashboardTotalCommDTO';
import { DateFilter } from 'src/shared/dataprovider/api/model/dateFilter';
import { DropDownData } from 'src/shared/dataprovider/local/interface/commonInterface';
import { getAgentId } from 'src/shared/helpers/helper';

@Component({
  selector: 'app-total-commission',
  templateUrl: './total-commission.component.html',
  styleUrls: ['./total-commission.component.scss'],
  providers: [DatePipe]
})
export class TotalCommissionComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  isLoading = false;
  data: DashboardTotalCommDTO = {};
  agentTotalCommission!: FormGroup;
  public defaultAgentId: number = getAgentId('some-id') ?? 0;
  public dateDropdown = [
    { id: 0, name: 'Today' },
    { id: 1, name: 'Yesterday' },
    { id: 2, name: 'This Week' },
    { id: 3, name: 'Last Week' },
    { id: 4, name: 'This Month'},
    { id: 5, name: 'Last Month'},
  ];
  private subscription!: Subscription;
  private observable!: Observable<any>;
  language: string ="";
  constructor(
    private agentService: AgentService,
    private notification: NotificationService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private translateService: TranslateService
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.agentTotalCommission = this.fb.group({
      dateSelect: [0]
    });

    this.getTotalComms(this.defaultAgentId, 0);
  }

  getTotalComms(agentId: number, searchByDate: DateFilter) {
    this.isLoading = true;
    const updatedAgentId = this.isAdmin ? 2 : (agentId || this.defaultAgentId);
    this.observable = this.agentService.apiAgentDashboardTotalCommissionsGet(updatedAgentId, searchByDate)
    this.subscription = this.observable.subscribe({
      next: (response: DashboardTotalCommDTO) => {
        this.data = response;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.notification.showNotification('Failed to load total commissions.' + error.error, 'Close', 'error');
      }
    });
  }

  onSelectChange(event: { id: number; name: string }) {
    const selectedFilter = event.id as unknown as DateFilter;
    this.getTotalComms(this.defaultAgentId, selectedFilter);
  }

  loadPage(agentId: number, searchByDate: DateFilter): void {
    this.getTotalComms(agentId, searchByDate);
  }
}
