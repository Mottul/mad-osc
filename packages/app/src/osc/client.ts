import type { OscArg } from '../types';

type Status = 'disconnected' | 'connecting' | 'connected';
type Listener = (status: Status) => void;
type MessageListener = (address: string, args: OscArg[]) => void;

class OscClient {
  private ws: WebSocket | null = null;
  private url = '';
  private status: Status = 'disconnected';
  private statusListeners = new Set<Listener>();
  private messageListeners = new Set<MessageListener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private lanUrl: string | null = null;
  private helloListeners = new Set<(lanUrl: string) => void>();

  connect(host: string, port: number): void {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    // When host matches the page origin we let Vite/bridge proxy /ws.
    this.url =
      host === 'self'
        ? `${proto}://${location.host}/ws`
        : `${proto}://${host}:${port}/ws`;
    this.shouldReconnect = true;
    this.open();
  }

  private open(): void {
    this.setStatus('connecting');
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onopen = () => this.setStatus('connected');
    this.ws.onclose = () => {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    };
    this.ws.onerror = () => this.ws?.close();
    this.ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'osc') {
          this.messageListeners.forEach((l) => l(data.address, data.args ?? []));
        } else if (data.type === 'hello' && data.lanUrl) {
          this.lanUrl = data.lanUrl;
          this.helloListeners.forEach((l) => l(data.lanUrl));
        }
      } catch {
        /* ignore */
      }
    };
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, 2000);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.ws?.close();
    this.ws = null;
  }

  send(address: string, args: OscArg[] = []): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'osc', address, args }));
    }
  }

  private setStatus(status: Status): void {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  getStatus(): Status {
    return this.status;
  }

  onStatus(l: Listener): () => void {
    this.statusListeners.add(l);
    return () => this.statusListeners.delete(l);
  }

  onMessage(l: MessageListener): () => void {
    this.messageListeners.add(l);
    return () => this.messageListeners.delete(l);
  }

  getLanUrl(): string | null {
    return this.lanUrl;
  }

  onHello(l: (lanUrl: string) => void): () => void {
    this.helloListeners.add(l);
    if (this.lanUrl) l(this.lanUrl);
    return () => this.helloListeners.delete(l);
  }
}

export const oscClient = new OscClient();
