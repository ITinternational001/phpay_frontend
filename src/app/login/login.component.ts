import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { SessionManager } from 'src/shared/helpers/session-manager';
import { LoginRequestDTO, LoginResultDTO, UserService } from 'src/shared/dataprovider/api';
import { HttpErrorResponse } from '@angular/common/http';
import { booleanify } from 'src/shared/helpers/helper';
import { NotificationService } from 'src/shared/components/modals/notification/notification.service';
import { AuthService } from 'src/shared/dataprovider/api/api/auth.service';
import { PushNotificationService } from 'src/app/push-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: string = '';
  password: string = '';
  isAuth: boolean = false;
  showAlert: boolean = false;
  alertType: string = '';
  alertMessage: string = '';
  alertSuccess: boolean = false;
  alertError: boolean = false;

  private observable!: Observable<LoginResultDTO>;
  private subscription!: Subscription;
  private language: string = "";

  constructor(
    private authService: AuthService,
    public router: Router,
    private ngZone: NgZone,
    private notification: NotificationService,
    private pushNotificationService: PushNotificationService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  onLogin(username: string, password: string) {

    this.authService.configuration.username = username;
    this.authService.configuration.password = password;
    const loginData: LoginRequestDTO = {
      username: username,
      password: password,
    };

    this.observable = this.authService.apiAuthLoginPost(loginData);
    this.subscription = this.observable.subscribe({
      next: (response: LoginResultDTO) => {
        if (response.Token !== null) {
          const clientId = response?.Client?.Id ?? "";
          const agentId = response?.Agent?.AgentId ?? "";
          sessionStorage.setItem("clientId", clientId?.toString());
          sessionStorage.setItem("agentId", agentId.toString());
          sessionStorage.setItem("token", response.Token);
          sessionStorage.setItem("refreshToken", response.RefreshToken!);

          this.initializeAuthGuard(response.Token);
          //Request Permission for Notification
          const userId = response?.Id ?? 0;
          if (userId) {
            this.pushNotificationService.requestPermission(userId);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.showAlert = true;
        this.notification.showNotification(error.error, "close", 'error');
      },
      complete: () => { }
    });
  }

  initializeAuthGuard(accessToken: string) {
    SessionManager.put('accessToken', accessToken);
    SessionManager.put('Username', SessionManager.getFromToken("Username"));
    sessionStorage.setItem("isAuthenticated", "true");
    const Status = SessionManager.getFromToken("Status");
    if (Status == "Deleted" || Status == "Inactive") {
      this.notification.showNotification("User is disabled. Please contact the administrator", "close", "error");
    } else {
      this.notification.showNotification("Login was successfull", "close", 'success');
      if (SessionManager.getFromToken("PasswordDidChanged") == null) {
        this.router.navigate(["/login"]);
      } else {
        if (booleanify(SessionManager.getFromToken("PasswordDidChanged"))) {
          this.ngZone.run(() => {
            setTimeout(() => {
              this.router.navigate(["/authenticator"]);
            }, 3000);
          });
        } else {
          this.ngZone.run(() => {
            setTimeout(() => {
              this.router.navigate(["/password/reset"]);
            }, 5000);
          });
        }
      }

    }
  }
}
