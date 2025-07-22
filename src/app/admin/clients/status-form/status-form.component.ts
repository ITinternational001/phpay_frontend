import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProvidersService, ClientService } from 'src/shared/dataprovider/api';
import { Status, StatusDropdown } from 'src/shared/dataprovider/local/data/common';
import { ClientsFormComponent } from '../clients-form/clients-form.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';

@Component({
  selector: 'app-status-form',
  templateUrl: './status-form.component.html',
  styleUrls: ['./status-form.component.scss']
})
export class StatusFormComponent implements OnInit {
  statusForm: FormGroup;
  public statusEnum = StatusDropdown;
  public selectedStatus: { id: number; name: string} | null = null;
  obsStatusUpdate!: Observable<any>;
  subsStatusUpdate!: Subscription;
  actionDisable: boolean = false;
  constructor(private _dialogRef: MatDialogRef<StatusFormComponent>, private _fb: FormBuilder,
    private _clientService: ClientService, private _notification: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
    this.statusForm = this._fb.group({
      Status: ''
    })
  }

  ngOnInit(): void {
    this.statusForm.patchValue({Status:this.data.Status});
    this.initializeForm();
  }

  initializeForm(){
    this.selectedStatus = this.statusEnum.find(status => status.id === this.data.Status) || null;
    this.statusForm.patchValue({
      statusForm: {
        Status: this.selectedStatus ? this.selectedStatus.id : null,
      }
    })
  }

  onFormSubmit() {
    if (this.data) {
      this.obsStatusUpdate = this._clientService.apiClientUpdateClientStatusPost(this.data.Id, this.statusForm.value.Status);
      this.subsStatusUpdate = this.obsStatusUpdate.subscribe({
        next: (response) => {
         this.actionDisable = true;
         this._notification.showNotification("Data updated successfully","close", "success");
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error on updating" + error.error,"close", "error");
        },
        complete: () => {
          this.subsStatusUpdate.unsubscribe();
          this._dialogRef.close(true);
        }
      });
    }
  }

  onSelectStatus(selectedStatus: { id: number, name: string }){
    this.selectedStatus = selectedStatus;
    this.statusForm.patchValue({
      Status: selectedStatus.id,
    });
  }
}
