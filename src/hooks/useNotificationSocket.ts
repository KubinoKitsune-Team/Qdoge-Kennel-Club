import { useQubicConnect } from "@/components/connect/QubicConnectContext";
import { useSocketIO } from "./useSocketIO";
import { useEffect } from "react";

// Default server URL - should be configurable
const DEFAULT_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export function useNotificationSocket() {
  const { isConnected, socket, emit, connect, disconnect } = useSocketIO({
    url: DEFAULT_SOCKET_URL,
    autoConnect: true,
  });

  const { wallet } = useQubicConnect();

  // Subscribe to user-specific notifications when connected
  useEffect(() => {
    if (isConnected && socket && wallet?.publicKey) {
      emit("subscribe", { userId: wallet.publicKey });
      console.log("Subscribed to notifications");
    }
  }, [isConnected, socket, wallet?.publicKey]);

  return {
    isConnected,
    socket,
    emit,
    connect,
    disconnect,
  };
}
