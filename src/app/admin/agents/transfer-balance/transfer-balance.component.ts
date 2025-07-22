import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-transfer-balance',
  templateUrl: './transfer-balance.component.html',
  styleUrls: ['./transfer-balance.component.scss']
})
export class TransferBalanceComponent {
  refreshTrigger: boolean = true  // Add this property to trigger table refresh
  @Output() pageRefreshed = new EventEmitter<void>(); // Event emitter for refresh
  // Define the method to handle transaction completion
  language: string = ""
  constructor(private translateService: TranslateService){
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }
  onTransactionCompleted(): void {
    this.pageRefreshed.emit(); // Emit event to signal refresh
  }

}
