import { Component, NgZone, OnInit } from '@angular/core';
import { OtpsService, UserOtpRequestDTO, OtpDTO, UserOtpValidateResultDTO, UserOtpValidateRequestDTO } from 'src/shared/dataprovider/api';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { booleanify, checkIsAgent, getCurrentUserClientId } from 'src/shared/helpers/helper';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';

@Component({
  selector: 'app-google-auth',
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.scss']
})
export class GoogleAuthComponent implements OnInit {
  showQr: boolean = true;
  pincode: string = '';
  private observableRequest!: Observable<OtpDTO>;
  private subscriptionRequest!: Subscription;
  private observableValidate!: Observable<UserOtpValidateResultDTO>;
  private subscriptionValidate!: Subscription;
  private obsPermission! : Observable<any>;
  private subsPermission! : Subscription;

  public QRCodeUrl: string = "";
  constructor(private otpsService: OtpsService, public router: Router, 
    private notification: NotificationService, private ngZone: NgZone, private permissionService:RolePermissionService) { }

  ngOnInit(): void {
    if (booleanify(SessionManager.getFromToken("OTPIsEnabled"))) {
      this.showQr = false;
    } else {
      this.onRequestOtp();
      this.showQr = true;
    }
  }

  onRequestOtp() {
    const otprequest: UserOtpRequestDTO = {
      userId: parseInt(SessionManager.getFromToken('Id')),
      email: SessionManager.getFromToken("Email"),
    }
    this.observableRequest = this.otpsService.apiOtpsGenerateOtpPost(otprequest);
    this.subscriptionRequest = this.observableRequest.subscribe(
      {
        next: (result: OtpDTO) => {
          if (result != null) {
            this.QRCodeUrl = result.AuthUrl!;
          }
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
          this.notification.showNotification("Error:" + httpErrorResponse.error, "close", "error")
        },
        complete: () => {
          this.subscriptionRequest.unsubscribe();
        }
      }
    );
  }

  onValidateOtp(pincode: string) {
    const OtpValidateData: UserOtpValidateRequestDTO = {
      id: parseInt(SessionManager.getFromToken("Id")),
      tokenPIN: pincode
    };

    this.observableValidate = this.otpsService.apiOtpsValidateOtpPost(OtpValidateData);
    this.subscriptionValidate = this.observableValidate.subscribe(
      {
        next: (validateResult: UserOtpValidateResultDTO) => {
          let isAdminSide: boolean = getCurrentUserClientId() <= 2 ? true : false;
          let isClientSide: boolean = getCurrentUserClientId() > 2 ? true : false;
          if (validateResult.IsValid) {
            this.notification.showNotification("Redirecting. please wait...", "close", 'success');
            if ((isAdminSide && !checkIsAgent()) || (isAdminSide && checkIsAgent() && SessionManager.getFromToken('RoleName') == 'Admin')) {
              this.ngZone.run(() => {
                setTimeout(() => {
                  this.router.navigate(["/admin"]);
                }, 3000);
              });
            } 
             else if(checkIsAgent()) {
              this.ngZone.run(() => {
                setTimeout(() => {
                  this.router.navigate(["/agent"]);
                }, 3000);
              });
            }
             else if(isClientSide && !checkIsAgent()){
              this.ngZone.run(() => {
                setTimeout(() => {
                  this.router.navigate(["/client"]);
                }, 3000);
              });
            }

            this.getUserPermissions();
          } else {
            this.notification.showNotification("One-Time Pin is Invalid. ", "close", 'error');
          }
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
          this.notification.showNotification(httpErrorResponse.error, "close", 'error');
        },
        complete: () => {
          this.subscriptionValidate.unsubscribe();
        }
      }
    );
  }

  getUserPermissions(){
    if(this.obsPermission){this.subsPermission.unsubscribe()}

    this.obsPermission = this.permissionService.apiRolePermissionUserUserIDGet(SessionManager.getFromToken("Id"));
    this.subsPermission = this.obsPermission.subscribe({
      next:(response)=>{
        sessionStorage.setItem("Permission",JSON.stringify(response));
      },
      error:(error:HttpErrorResponse)=>{
        console.log(error);
      }
    });
  }
}
