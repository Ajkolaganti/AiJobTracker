// src/services/websocketService.ts

class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // Base delay in milliseconds
    private messageHandlers: Map<string, Function> = new Map();
    private websocketUrl: string;
  
    constructor() {
      // Fetch WebSocket URL from environment variables
      this.websocketUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://default-url.example.com/ws';
      this.setupWebSocket();
    }
  
    private setupWebSocket() {
      // Clean up existing WebSocket before creating a new one
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
  
      this.ws = new WebSocket(this.websocketUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        this.reconnectAttempts = 0; // Reset reconnection attempts on successful connection
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
          handler(data);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.handleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        // Optionally, attempt reconnecting on error as well
        this.handleReconnect();
      };
    }
  
    private handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.setupWebSocket();
        }, delay);
      } else {
        console.error('Max reconnect attempts reached. Please check your connection.');
        // Optionally, alert the user that reconnection failed
      }
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
      } else {
        console.warn('WebSocket is not open. Unable to send message.');
      }
    }
  }
  
  export const wsService = new WebSocketService();