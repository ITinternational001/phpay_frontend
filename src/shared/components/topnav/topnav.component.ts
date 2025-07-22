import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input, HostListener} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router  } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NotificationService } from 'src/shared/dataprovider/api/api/notification.service';
import { MessagesDTO } from 'src/shared/dataprovider/api/model/messagesDTO';
import { MessageStatusEnum } from 'src/shared/dataprovider/api/model/messageStatusEnum';
import { PushNotificationMessageDTO } from 'src/shared/dataprovider/api/model/pushNotificationMessageDTO';
import { NotificationStatus, Status } from 'src/shared/dataprovider/local/data/common';
import { SessionManager } from 'src/shared/helpers/session-manager';

@Component({
  selector: 'app-topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss']
})
export class TopnavComponent implements OnInit {

  @Input() collapsed = false;
  @Input() screenWidth = 0;
  private observable! : Observable<any>;
  private subscription!:Subscription;
  public notificationCount : number = 5;
  public notificationList : Array<PushNotificationMessageDTO> = [];
  UserEmail:string='';
  headerLabel:string = "";
  showHistory: boolean = false;
  buttonLabel: string = 'History';

  showNotifications = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pushNotificationService : NotificationService
  ) { 
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      const routeData = this.getChildRouteData(this.route.root);
      if (routeData && routeData['headerLabel']) {
        this.headerLabel = routeData['headerLabel'];
      }
    });
  }


  ngOnInit(): void {
    this.UserEmail = SessionManager.getFromToken('Email');
    var UserId = SessionManager.getFromToken('Id');
    this.getPushNotification();
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    if ((event.target as Element).closest('.btn')) {
      return;
    }
  
    this.showNotifications = !this.showNotifications;
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedElement = event.target as Element;
  
    // Ignore clicks on buttons with the class `.btn` or within the notification container
    if (clickedElement.closest('.notification-container') || clickedElement.closest('.btn')) {
      return;
    }
  
    this.showNotifications = false;
  }
  

  getPushNotification(status: MessageStatusEnum | undefined = MessageStatusEnum.NUMBER_1) {
    if (this.observable) {
      this.subscription.unsubscribe();
    }
  
    const userId = SessionManager.getFromToken('Id');

    this.observable = this.pushNotificationService.apiNotificationMessageListGet(userId, status, 'body');
    this.subscription = this.observable.subscribe({
      next: (response: MessagesDTO) => {
        if (response != null) {
          if (status === MessageStatusEnum.NUMBER_2) {
            this.notificationList = response.Notifications!.filter(notification => notification.Status === MessageStatusEnum.NUMBER_2);
          } else {
            this.notificationList = response.Notifications!.filter(notification => notification.Status === MessageStatusEnum.NUMBER_1);
          }
          this.notificationCount = this.notificationList.length;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log(error.error);
      }
    });
  }
  

  updateNotification(){
    if(this.observable){this.subscription.unsubscribe()}
    this.observable = this.pushNotificationService.apiNotificationMessageUpdateStatusPut(1,1);
    this.subscription = this.observable.subscribe({
      next:(response)=>{

      },
      error:(error:HttpErrorResponse)=>{
        console.log(error.error);
      }
    })
  }

  private getChildRouteData(route: ActivatedRoute): any {
    if (!route.firstChild) {
      return null;
    }
  
    let data = route.firstChild.snapshot.data;
  
    while (route.firstChild?.firstChild) {
      route = route.firstChild;
      data = { ...data, ...route.snapshot.data };
    }
  
    return data;
  }

  getHeaderClass():string{
    let styleClass =''; 
    if(this.collapsed && this.screenWidth > 768){
      styleClass = 'header-trimmed';
    }else if(this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0){
      styleClass = 'header-md-screen';
    }
    return styleClass;
  }

  changeNotification() {
    if (this.showHistory) {
      this.showHistory = false;
      this.buttonLabel = 'History';
      this.getPushNotification(MessageStatusEnum.NUMBER_1);
    } else {
      this.showHistory = true;
      this.buttonLabel = 'Unread';
      this.getPushNotification(MessageStatusEnum.NUMBER_2);
    }
  }

  removeNotification(notificationId: number, event: MouseEvent): void {
    event.stopPropagation();
    console.log(`Removing notification ID ${notificationId} (status: 3)`);

    if (this.observable) {
        this.subscription.unsubscribe();
    }

    this.observable = this.pushNotificationService.apiNotificationMessageUpdateStatusPut(notificationId, MessageStatusEnum.NUMBER_3);
    this.subscription = this.observable.subscribe({
        next: () => {
            console.log(`Notification ID ${notificationId} removed.`);
            // Refresh the read notifications list after updating
            this.getPushNotification(MessageStatusEnum.NUMBER_2);
        },
        error: (error: HttpErrorResponse) => {
            console.error('Error removing notification:', error.error);
        }
    });
}



movetoHistory(notificationId: number, event: MouseEvent): void {
  event.stopPropagation();
  console.log(`Moving notification ID ${notificationId} to history (status: 2)`);

  if (this.observable) {
      this.subscription.unsubscribe();
  }

  this.observable = this.pushNotificationService.apiNotificationMessageUpdateStatusPut(notificationId, MessageStatusEnum.NUMBER_2);
  this.subscription = this.observable.subscribe({
      next: () => {
          console.log(`Notification ID ${notificationId} moved to history.`);
          // Refresh the unread notifications list after updating
          this.getPushNotification(MessageStatusEnum.NUMBER_1);
      },
      error: (error: HttpErrorResponse) => {
          console.error('Error updating notification status:', error.error);
      }
  });
}
}
