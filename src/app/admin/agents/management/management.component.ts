import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TopCardData } from '../../../../shared/dataprovider/local/data/common';
@Component({
  selector: 'app-admin-agent-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent {

  constructor(private router: Router, ){}

  navigateToConfigurePage(data?: any): void {
    this.router.navigate(['/admin/agent/profile'], {
      //queryParams: { data: JSON.stringify(data) }
    });
  }
}
