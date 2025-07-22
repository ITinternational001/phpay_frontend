import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
    private token: string | null = null; // Set this dynamically if needed
    private basePath:string=environment.basePath;
    public defaultHeaders = new HttpHeaders({
      'X-API-KEY': environment.APIkey,
      'Authorization': this.token ? `Bearer ${this.token}` : '',
    });

  constructor() {}

  // Request permission for notifications
  requestPermission(userId:number): void {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          //console.log('Notification permission granted');
          this.subscribeToPush(userId);
          
        } else {
          //console.log('Notification permission denied');
        }
      });
    }
  }

  // Subscribe the user to push notifications
  private subscribeToPush(userId: number): void {
    if ('serviceWorker' in navigator) {
      //console.log('Service Worker is available.');
      navigator.serviceWorker.ready.then((registration) => {
        //console.log('Service Worker is ready.');
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array('BAJ0N5sRD-Y9CkmjEUhdrSRbTOfDn8aYlvE5XUDRAR3KrTEuzK7y8vfpBgQmEn83t8PqV2eVYyJhOfSj6ptt9Yg')
        }).then(subscription => {
          //console.log('User is subscribed:', subscription);
          this.sendSubscriptionToBackend(subscription, userId);
        }).catch(err => {
          console.error('Failed to subscribe the user: ', err);
        });
      }).catch(err => {
        console.error('Service Worker is not ready:', err);
      });
    } else {
      console.error('Service Worker is not supported in this browser.');
    }
  }

  // Send the subscription to the backend
  private sendSubscriptionToBackend(subscription: PushSubscription,id:number): void {
    const userId = id; // Replace with your actual UserId
    const subscriptionJson = subscription.toJSON();
    //console.log('Subscription JSON:', subscriptionJson);
  
    const payload = {
      UserId: userId,
      Endpoint: subscription.endpoint,
      Keys: {
        P256dh: subscription.getKey ? this.arrayBufferToBase64(subscription.getKey('p256dh')) : '',
        Auth: subscription.getKey ? this.arrayBufferToBase64(subscription.getKey('auth')) : ''
      }
    };
  
    const headers: Record<string, string> = {};
    this.defaultHeaders.keys().forEach(key => {
      const headerValue = this.defaultHeaders.get(key);
      if (headerValue) {
        headers[key] = headerValue;
      }
    });
  
    fetch(`${this.basePath}/api/Notification/Subcription/Create`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })
      .then(response => {
        if (response.ok) {
          //console.log('Subscription sent to backend successfully');
        } else {
          console.error('Failed to send subscription to backend:', response);
        }
      })
      .catch(err => {
        console.error('Error sending subscription:', err);
      });
  }
  
  // Helper to convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const byteArray = new Uint8Array(buffer);
    let binary = '';
    byteArray.forEach(byte => (binary += String.fromCharCode(byte)));
    return btoa(binary);
  }
  // Convert the VAPID key to a Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
