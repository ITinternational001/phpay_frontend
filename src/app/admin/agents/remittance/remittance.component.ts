import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MaintenanceService } from 'src/shared/services/maintenance.service';
@Component({
  selector: 'app-admin-agent-remittance',
  templateUrl: './remittance.component.html',
  styleUrls: ['./remittance.component.scss']
})
export class RemittanceComponent {
  language: string = "";

 constructor(private translateService: TranslateService){
  
  this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
 }

}
