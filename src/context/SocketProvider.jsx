"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { useConversations } from "@/hooks/useConversation";
import { addMessage } from "@/store/slices/chatSlice";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();

  const { sendLocalMessage } = useConversations();
  const onBroadcastReceived = useCallback(
    (data) => {
      console.log("📥 Received event:broadcast from server =>", data);
      if (data?.type === "message" && data?.message) {
        dispatch(addMessage(data?.message));
        sendLocalMessage({
          message: data?.message,
          chatId: data?.message?.chatWith,
        });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const socketURL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    console.log("🌐 Attempting connection to:", socketURL);

    const _socket = io(socketURL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    _socket.on("connect", () => {
      console.log("✅ Connected to server! Socket ID:", _socket.id);
    });

    _socket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    _socket.on("disconnect", (reason) => {
      console.warn("🚫 Disconnected from server:", reason);
    });

    _socket.on("event:broadcast", onBroadcastReceived);
    console.log("👂 Subscribed to 'event:broadcast'");

    setSocket(_socket);

    return () => {
      _socket.off("event:broadcast", onBroadcastReceived);
      _socket.disconnect();
      console.log("🔌 Cleanup: socket disconnected");
    };
  }, [onBroadcastReceived]);

  const sendMessage = useCallback(
    ({ type, message }) => {
      console.log("📤 Sending messagessssssssss:", {
        type: type,
        message: message,
      });

      if (!socket) {
        console.warn("⚠️ Tried to send message but socket is null");
        return;
      }
      console.log("📤 Emitting event:message =>", {
        type: type,
        message: message,
      });
      socket.emit("event:message", {
        type: type,
        message: message,
      });
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ sendMessage, socket }}>
      {children}
    </SocketContext.Provider>
  );
};
