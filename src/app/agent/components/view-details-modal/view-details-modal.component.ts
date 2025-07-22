import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-details-modal',
  templateUrl: './view-details-modal.component.html',
  styleUrls: ['./view-details-modal.component.scss']
})
export class ViewDetailsModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { wallets: any[] }) {
    // data.wallets will contain the wallets passed from the calling component
  }
}
