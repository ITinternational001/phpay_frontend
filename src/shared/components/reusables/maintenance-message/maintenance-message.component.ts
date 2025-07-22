import { Component, Input } from '@angular/core';
import { MaintenanceService } from 'src/shared/services/maintenance.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-maintenance-message',
  templateUrl: './maintenance-message.component.html',
  styleUrls: ['./maintenance-message.component.scss']
})
export class MaintenanceMessageComponent {
   
  @Input() message: string = 'Page is currently under maintenance.';
  @Input() isMaintenance: boolean = false; // Default value
  @Input() dataSource: 'admin' | 'client' | 'agent' = 'client'; // Default to 'client'

  constructor(
    private maintenanceService: MaintenanceService,
    private router: Router
  ) {
    // Get the current route URL dynamically
    const currentRoute = this.router.url; 
    const maintenanceStatus = this.maintenanceService.isPageUnderMaintenance(currentRoute);
    this.isMaintenance = maintenanceStatus.isMaintenance; // Extract the boolean
    this.message = maintenanceStatus.message || this.message; // Use the returned message if available
    
  }
}
