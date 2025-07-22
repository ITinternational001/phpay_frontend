// src/app/interceptors/token.interceptor.ts
import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, Subscription } from 'rxjs';
import { catchError, switchMap, filter, take, map } from 'rxjs/operators';
import { LoginResultDTO } from '../dataprovider/api/model/loginResultDTO';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenService } from '../dataprovider/api/api/token.service';
import { TokenApiModel } from '../dataprovider/api/model/tokenApiModel';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private refreshUrl = 'https://testapi.dynastypay.net/api/Token/Refresh';
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private refreshAttempted = false; // 🔥 Track if a refresh was already attempted

  constructor(private http: HttpClient, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authToken = sessionStorage.getItem('token');

    const clonedReq = this.addAuthHeaders(req, authToken);

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          if (!this.refreshAttempted) {
            // 🔥 First 401 → Attempt refresh
            this.refreshAttempted = true;
            return this.handle401Error(req, next);
          } else {
            // 🔥 Second 401 → Logout user and clear session
            this.logoutUser();
            alert('Session has expired. Please log in again');
            return throwError(() => new Error('Session expired. Please log in again.'));
          }
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeaders(req: HttpRequest<any>, token: string | null): HttpRequest<any> {
    return req.clone({
      setHeaders: { 
        Authorization: `Bearer ${token}`,
        'X-API-KEY': environment.APIkey
      },
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((newToken) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newToken.Token); 
          sessionStorage.setItem('token', newToken.Token);
          sessionStorage.setItem('refreshToken', newToken.RefreshToken!);

          return next.handle(this.addAuthHeaders(req, newToken.Token));
        }),
        catchError(() => {
          this.isRefreshing = false;
          this.logoutUser();
          return throwError(() => new Error('Token refresh failed. Logging out.'));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addAuthHeaders(req, token)))
      );
    }
  }

  private refreshToken(): Observable<LoginResultDTO> {
    let obj = {
      AccessToken: sessionStorage.getItem('token')!,
      RefreshToken: sessionStorage.getItem('refreshToken')!
    };

    return this.http.post<LoginResultDTO>(this.refreshUrl, obj, {
      headers: {
        'X-API-KEY': environment.APIkey
      }
    }).pipe(
      catchError(error => {
        console.error('Token refresh failed', error);
        return throwError(() => error);
      })
    );
  }

  private logoutUser() {
    sessionStorage.clear();
    location.reload();
    this.refreshAttempted = false;
  }
}
