// Service Worker registration and PWA functionality

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isActive: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker(): ServiceWorkerState & {
  update: () => void;
  unregister: () => void;
} {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isActive: false,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    let registration: ServiceWorkerRegistration | undefined;

    const registerSW = async () => {
      try {
        // Only register in production or when explicitly enabled
        if (process.env.NODE_ENV !== 'production' &&
            !localStorage.getItem('enable-sw')) {
          return;
        }

        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('Service Worker registered:', registration);

        const updateState = () => {
          const newState = registration ? {
            isRegistered: !!registration,
            isInstalling: registration.installing ? true : false,
            isWaiting: registration.waiting ? true : false,
            isActive: registration.active ? true : false,
            updateAvailable: !!(registration.waiting || registration.installing),
            registration,
          } : {
            isRegistered: false,
            isInstalling: false,
            isWaiting: false,
            isActive: false,
            updateAvailable: false,
            registration: null,
          };

          setState(prev => ({ ...prev, ...newState }));
        };

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
          updateState();
        });

        // Listen for state changes
        if (registration.installing) {
          registration.installing.addEventListener('statechange', updateState);
        }

        if (registration.waiting) {
          registration.waiting.addEventListener('statechange', updateState);
        }

        if (registration.active) {
          registration.active.addEventListener('statechange', updateState);
        }

        updateState();

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setState(prev => ({ ...prev, isRegistered: false }));
      }
    };

    registerSW();

    // Cleanup
    return () => {
      if (registration) {
        // Don't unregister here, let it persist
      }
    };
  }, [state.isSupported]);

  const update = () => {
    if (state.registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Reload the page to get the new service worker
      window.location.reload();
    }
  };

  const unregister = async () => {
    if (state.registration) {
      await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }));
    }
  };

  return {
    ...state,
    update,
    unregister,
  };
}

// Hook for offline/online detection
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Hook for background sync
export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype);
  }, []);

  const registerSync = async (tag: string) => {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  };

  return { isSupported, registerSync };
}

// Hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Push notification permission request failed:', error);
      return false;
    }
  };

  const subscribe = async (vapidKey: string) => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      setSubscription(pushSubscription);
      return pushSubscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}