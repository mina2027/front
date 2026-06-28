import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported, subscribeToPush, unsubscribeFromPush, fetchPushConfig,
  isCurrentlySubscribed, notificationPermission, SubscribeResult,
} from '../utils/push';

// Manages the browser's Web Push state for the current device: whether push is
// supported, the OS permission, whether the server has push enabled, and whether
// this device is currently subscribed. Exposes enable()/disable() actions.
export function usePushNotifications() {
  const supported = isPushSupported();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(notificationPermission());
  const [subscribed, setSubscribed] = useState(false);
  const [serverEnabled, setServerEnabled] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    let active = true;
    (async () => {
      const cfg = await fetchPushConfig();
      const sub = await isCurrentlySubscribed();
      if (!active) return;
      setServerEnabled(cfg.enabled);
      setSubscribed(sub);
      setPermission(notificationPermission());
    })();
    return () => { active = false; };
  }, [supported]);

  const enable = useCallback(async (): Promise<SubscribeResult> => {
    setBusy(true);
    const result = await subscribeToPush();
    setPermission(notificationPermission());
    if (result.ok) setSubscribed(true);
    setBusy(false);
    return result;
  }, []);

  const disable = useCallback(async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setSubscribed(false);
    setBusy(false);
  }, []);

  return { supported, permission, subscribed, serverEnabled, busy, enable, disable };
}
