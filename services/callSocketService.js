import { io } from 'socket.io-client';
import { API_CONFIG } from '../constants/api';

class CallSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(userId = null, providerId) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = API_CONFIG.BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    this.socket = io(`${wsUrl}/calls`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Call socket connected');
      
      // Register user/provider
      this.socket.emit('register', { userId, providerId });
      
      // Notify listeners
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Call socket disconnected');
      this.emit('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Call socket connection error:', error);
      this.emit('error', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Incoming call
    this.socket.on('call_incoming', (data) => {
      this.emit('call_incoming', data);
    });

    // Call accepted
    this.socket.on('call_accepted', (data) => {
      this.emit('call_accepted', data);
    });

    // Call rejected
    this.socket.on('call_rejected', (data) => {
      this.emit('call_rejected', data);
    });

    // Call ended
    this.socket.on('call_ended', (data) => {
      this.emit('call_ended', data);
    });

    // Call failed
    this.socket.on('call_failed', (data) => {
      this.emit('call_failed', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit call invite
  inviteCall(payload) {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('call_invite', payload);
  }

  // Accept call
  acceptCall(payload) {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('call_accept', payload);
  }

  // Reject call
  rejectCall(payload) {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('call_reject', payload);
  }

  // End call
  endCall(payload) {
    if (!this.isConnected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('call_end', payload);
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export default new CallSocketService();

