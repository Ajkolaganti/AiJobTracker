// src/services/websocketService.ts

class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private messageHandlers: Map<string, Function> = new Map();
  
    constructor() {
      this.setupWebSocket();
    }
  
    private setupWebSocket() {
      this.ws = new WebSocket('ws://coral-app-gorus.ondigitalocean.app/ws');
  
      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0;
      };
  
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
          handler(data);
        }
      };
  
      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.setupWebSocket();
          }, 1000 * Math.pow(2, this.reconnectAttempts));
        }
      };
    }
  
    public addMessageHandler(type: string, handler: Function) {
      this.messageHandlers.set(type, handler);
    }
  
    public removeMessageHandler(type: string) {
      this.messageHandlers.delete(type);
    }
  
    public sendMessage(type: string, data: any) {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type, data }));
      }
    }
  }
  
  export const wsService = new WebSocketService();