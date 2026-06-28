/* Service worker for Lost & Found proximity alerts (Web Push).
   Receives push payloads from the backend, shows a system notification, and
   routes a click to /report/{id}. Lives at the site root (/sw.js) so it can
   control the whole app and run in the background. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = data.title || 'Lost Item Report Near You';
  const distance = typeof data.distanceKm === 'number' ? ` · ${data.distanceKm} km away` : '';
  // Prefer a descriptive line (item title + distance); fall back to the generic body.
  const line = data.reportTitle
    ? `${data.reportTitle}${data.category ? ` (${data.category})` : ''}${distance}`
    : (data.body || 'Someone reported a lost item within your selected area.');

  // Only http(s) image URLs are reliable for notification visuals (data: URLs
  // are not supported as notification icons in most browsers).
  const httpImg = typeof data.imageUrl === 'string' && /^https?:\/\//i.test(data.imageUrl) ? data.imageUrl : undefined;
  const url = data.url || (data.reportId ? `/report/${data.reportId}` : '/');

  const options = {
    body: line,
    icon: httpImg,
    image: httpImg,
    tag: data.reportId ? `report-${data.reportId}` : undefined,
    renotify: false,
    data: { url },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Reuse an open tab when possible: focus it and navigate to the report.
      for (const client of clientList) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            try { await client.navigate(target); } catch (e) { /* cross-origin / unsupported */ }
          }
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
    })()
  );
});
