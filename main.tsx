import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// Register the push service worker so proximity alerts can be delivered in the
// background (and clicked to open the report). Safe no-op where unsupported.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* registration is best-effort; the in-app bell still works without it */
    });
  });
}
