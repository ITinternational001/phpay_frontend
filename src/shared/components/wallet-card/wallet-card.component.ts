import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransferModalComponent } from 'src/shared/components/modals/transfer-modal/transfer-modal.component'; // Adjust the path if necessary

@Component({
  selector: 'app-wallet-card',
  templateUrl: './wallet-card.component.html',
  styleUrls: ['./wallet-card.component.scss']
})
export class WalletCardComponent implements OnInit {
  @Input() label: string = "";
  @Input() value: string = "";
  @Input() icon: string = "";
  @Input() buttonlabel: string = "";
  @Input() isVisible: boolean = false;
  @Input() isVisiblebtn: boolean = false;
  @Input() imageSrc: string = "";
  @Input() transferFormCondition: boolean = false;
  @Input() channelId: string = '';  // Ensure this is correctly typed
  @Input() clientId: string = '';

  

  constructor(private dialog: MatDialog) { }
  ngOnInit(): void { }

  
  openTransferModal() {
    const dialogRef = this.dialog.open(TransferModalComponent, {
      data: {
        transferFormCondition: false,
        label: this.label,
        value: this.value,
        clientId: this.clientId, // Pass the actual client ID
        channelId: this.channelId // Pass the actual channel ID
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      // Handle any actions after dialog closes
    });
  }
}
