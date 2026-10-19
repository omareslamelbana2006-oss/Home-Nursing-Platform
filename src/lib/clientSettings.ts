import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const HIDE_SERVICE_PRICES_KEY = 'hn-hide-service-prices';
const PRICE_VISIBILITY_EVENT = 'hn-price-visibility-changed';

export function getLocalHideServicePrices(): boolean {
  return window.localStorage.getItem(HIDE_SERVICE_PRICES_KEY) === 'true';
}

export function publishHideServicePrices(value: boolean): void {
  window.localStorage.setItem(HIDE_SERVICE_PRICES_KEY, String(value));
  window.dispatchEvent(new CustomEvent<boolean>(PRICE_VISIBILITY_EVENT, { detail: value }));
}

export function useHideServicePrices(): boolean {
  const [hideServicePrices, setHideServicePrices] = useState(getLocalHideServicePrices);

  useEffect(() => {
    let active = true;
    let preferenceVersion = 0;
    let loadErrorLogged = false;

    const applyPreference = (value: boolean) => {
      preferenceVersion += 1;
      if (active) setHideServicePrices(value);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === HIDE_SERVICE_PRICES_KEY && event.newValue !== null) {
        applyPreference(event.newValue === 'true');
      }
    };
    const handleLocalChange = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'boolean') {
        applyPreference(event.detail);
      }
    };
    const handleFocus = () => void loadPreference();

    const loadPreference = async () => {
      const versionAtRequest = preferenceVersion;
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        if (!loadErrorLogged) {
          console.error('Could not load client price visibility setting:', error);
          loadErrorLogged = true;
        }
        return;
      }
      if (versionAtRequest === preferenceVersion && typeof data?.hide_service_prices === 'boolean') {
        window.localStorage.setItem(HIDE_SERVICE_PRICES_KEY, String(data.hide_service_prices));
        if (active) setHideServicePrices(data.hide_service_prices);
      }
    };
    void loadPreference();

    const channel = supabase
      .channel('admin-settings-price-visibility')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'admin_settings',
      }, (payload) => {
        const value = payload.new.hide_service_prices;
        if (typeof value === 'boolean') {
          window.localStorage.setItem(HIDE_SERVICE_PRICES_KEY, String(value));
          applyPreference(value);
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Price visibility realtime subscription status: ${status}`);
        }
      });

    const refreshTimer = window.setInterval(() => void loadPreference(), 20000);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener(PRICE_VISIBILITY_EVENT, handleLocalChange);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PRICE_VISIBILITY_EVENT, handleLocalChange);
      void supabase.removeChannel(channel);
    };
  }, []);

  return hideServicePrices;
}
