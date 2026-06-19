import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3021';

interface UseSocketOptions {
  namespace: string;
  autoConnect?: boolean;
  onEvent?: (event: string, data: any) => void;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [key, val] = c.trim().split('=');
      acc[key] = val;
      return acc;
    }, {} as Record<string, string>);
    return cookies['token'] || cookies['access_token'] || null;
  } catch {
    return null;
  }
}

export function useWebSocket({ namespace, autoConnect = true, onEvent }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempt = useRef(0);
  const maxReconnectAttempts = 10;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      return;
    }

    const socket = io(`${WS_URL}${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempt.current = 0;
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        return;
      }
      scheduleReconnect();
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      scheduleReconnect();
    });

    socket.onAny((event, ...args) => {
      if (onEventRef.current) {
        onEventRef.current(event, args[0]);
      }
    });

    socketRef.current = socket;
  }, [namespace]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempt.current >= maxReconnectAttempts) {
      setError('Max reconnection attempts reached');
      return;
    }

    reconnectAttempt.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 30000);
    setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.connect();
      } else {
        connect();
      }
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return { socket: socketRef.current, isConnected, error, emit, disconnect, connect };
}

export function useDashboardSocket(onEvent?: (event: string, data: any) => void) {
  return useWebSocket({ namespace: '/dashboard', onEvent });
}

export function usePdvSocket(onEvent?: (event: string, data: any) => void) {
  return useWebSocket({ namespace: '/pdv', onEvent });
}

export function useNotificationSocket(onEvent?: (event: string, data: any) => void) {
  return useWebSocket({ namespace: '/notifications', onEvent });
}

export function useInventorySocket(onEvent?: (event: string, data: any) => void) {
  return useWebSocket({ namespace: '/inventory', onEvent });
}

export function useRhSocket(onEvent?: (event: string, data: any) => void) {
  return useWebSocket({ namespace: '/rh', onEvent });
}
