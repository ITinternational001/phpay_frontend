import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { ApiKeyService } from 'src/shared/dataprovider/api/api/apiKey.service';
import { ApiKeyDTO } from 'src/shared/dataprovider/api/model/apiKeyDTO';

@Component({
  selector: 'app-generate-form',
  templateUrl: './generate-form.component.html',
  styleUrls: ['./generate-form.component.scss']
})
export class GenerateFormComponent implements OnInit {
  private observable!: Observable<ApiKeyDTO>;
  private subscription!: Subscription;
  private prefix: string = '';
  generateForm: FormGroup;
  isAPIGenerated: boolean = false;
  language: string = "";
  actionDisable: boolean = false;
  constructor(private _dialogRef: MatDialogRef<GenerateFormComponent>, private _fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any
    , private _apiKeyService: ApiKeyService, private _notification: NotificationService, private translateService: TranslateService) {
      this.language = localStorage.getItem('language') || 'en';
      this.translateService.setDefaultLang(this.language);
    this.generateForm = this._fb.group({
      Prefix: [''],
      ApiKey: ['']
    })
  }

  ngOnInit(): void {
    this.getApiKeyData();
  }

  getApiKeyData() {
    if (this.data) {
      this.observable = this._apiKeyService.apiApiKeyGetApiKeyPost(this.data.Id);
      this.subscription = this.observable.subscribe({
        next: (response) => {
          if (response.Prefix != null) {
            this.prefix = response.Prefix;
            this.isAPIGenerated = true;
            this.generateForm.patchValue({
              Prefix: response.Prefix,
              ApiKey: "API already generated"
            });
          }
        },
        error: (error: HttpErrorResponse) => {
          this._notification.showNotification("Error: "+ error.error, "close","success");
        },
        complete: () => {
          this.subscription.unsubscribe();
        }
      });
    }
  }

  onGenerateApiKey() {
    if (this.isAPIGenerated) {
      if (this.data) {
        this.observable = this._apiKeyService.apiApiKeyUpdateApiKeyPost({ prefix: this.prefix, clientId: this.data.Id });
        this.subscription = this.observable.subscribe({
          next: (response) => {
            this.generateForm.patchValue({
              Prefix: response.Prefix,
              ApiKey: response.Secret
            });
          },
          error: (error: HttpErrorResponse) => {
            this._notification.showNotification("Error: "+ error.error, "close","success");
          },
          complete: () => {
            this.subscription.unsubscribe();
          }
        });
      }
    } else {
      if (this.data) {
        this.observable = this._apiKeyService.apiApiKeyCreateApiKeyPost({ ClientId: this.data.Id });
        this.subscription = this.observable.subscribe({
          next: (response) => {
            this.generateForm.patchValue({
              Prefix: response.Prefix,
              ApiKey: response.Secret
            });
          },
          error: (error: HttpErrorResponse) => {
            //this._notification.showNotification("Error: "+ error.error, "close","success");
          },
          complete: () => {
            this.subscription.unsubscribe();
          }
        });
      }
    }
  }
}
