import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              console.log('Service Worker state changed to:', installingWorker.state);
            };
          }
        };
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  } else {
    console.error('Service Worker is not supported in this browser.');
  }