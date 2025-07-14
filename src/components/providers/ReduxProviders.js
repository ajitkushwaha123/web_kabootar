"use client";

import { SocketProvider } from "@/context/SocketProvider";
import store from "@/store";
import { Provider } from "react-redux";

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
}
