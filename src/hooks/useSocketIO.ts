import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAtom } from "jotai";
import { notificationsAtom } from "@/store/notifications";
import toast from "react-hot-toast";

interface UseSocketIOOptions {
  url: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocketIO({
  url,
  autoConnect = true,
  reconnectionAttempts = 5,
  reconnectionDelay = 5000,
  onConnect,
  onDisconnect,
  onError,
}: UseSocketIOOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [, setNotifications] = useAtom(notificationsAtom);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket instance
    const socket = io(url, {
      autoConnect,
      reconnectionAttempts,
      reconnectionDelay,
    });

    // Set up event listeners
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", socket.id);
      onConnect?.();
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("Socket disconnected:", reason);
      onDisconnect?.();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      onError?.(error);
    });

    // Listen for notifications
    socket.on("notification", (notification) => {
      console.log("Received notification:", notification);

      // Add notification to store
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      notification.type === "error" ? toast.error(notification.message) : toast.success(notification.message);
    });

    // Listen for trade updates
    socket.on("trade_update", (trade) => {
      console.log("Received trade update:", trade);

      // Show toast notification for trade updates
      trade.status === "completed"
        ? toast.success(`Trade ${trade.id} completed`)
        : toast.error(`Trade ${trade.id} failed`);
    });

    // Store socket reference
    socketRef.current = socket;

    // Clean up on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socket.off();
      }
    };
  }, [url, autoConnect, reconnectionAttempts, reconnectionDelay, onConnect, onDisconnect, onError, setNotifications]);

  // Function to emit events
  const emit = (event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  };

  // Function to manually connect
  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  // Function to manually disconnect
  const disconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  };

  return {
    isConnected,
    socket: socketRef.current,
    emit,
    connect,
    disconnect,
  };
}
