"use client";

import { useEffect, useState } from "react";

export function useSocket() {
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    console.log(url);
    async function connectToSocket() {
      try {
        setLoading(true);
        console.log("Hello");
        const socket = new WebSocket(url || "ws://localhost:8080/ws");
        setSocket(socket);
        console.log(socket);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    connectToSocket();
  }, []);

  return {
    loading,
    socket,
  };
}
