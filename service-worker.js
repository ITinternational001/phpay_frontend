self.addEventListener('push', function (event) {
    // Set default values for title and body
    let title = 'Notification';
    let body = 'No message data';
    let icon = 'assets/notifbell.png';  // Optional icon for the notification
    let badge = 'assets/notifbell.png'; // Optional badge

    // If the event contains data, use it
    if (event.data) {
        // Parse the JSON payload from the event data
        const data = event.data.json();

        // Extract title, message, and any other data
        title = data.title || title;
        body = data.message || body;  // 'message' corresponds to the 'message' in your payload
        icon = data.icon || icon;     // Optional icon URL
        badge = data.badge || badge; // Optional badge URL
    }

    // Create notification options
    let options = {
        body: body,
        icon: icon,
        badge: badge,
    };

    // Show the notification
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

  self.addEventListener('notificationclick', function (event) {
    // Handle notification click event
    event.notification.close();
    event.waitUntil(
      clients.openWindow('/') // Open the home page (or any other URL)
    );
  });