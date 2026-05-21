import { create } from 'zustand';
import { oscClient } from '../osc/client';
import type { ConnectionConfig } from '../types';

const STORAGE_KEY = 'mad-osc:connection';

function loadConfig(): ConnectionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { host: 'self', port: 8080 };
}

interface ConnectionState {
  config: ConnectionConfig;
  status: 'disconnected' | 'connecting' | 'connected';
  lanUrl: string | null;
  setConfig: (config: ConnectionConfig) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => {
  oscClient.onStatus((status) => set({ status }));
  oscClient.onHello((lanUrl) => set({ lanUrl }));
  return {
    config: loadConfig(),
    status: 'disconnected',
    lanUrl: null,
    setConfig: (config) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      set({ config });
    },
    connect: () => {
      const { host, port } = get().config;
      oscClient.connect(host, port);
    },
    disconnect: () => oscClient.disconnect(),
  };
});
