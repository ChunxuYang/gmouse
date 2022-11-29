import * as React from "react";
import { Socket } from "socket.io-client";

const { createContext, useContext } = React;

export type ConnectionContextType = {
  address: string | null;
  socket: Socket | null;
  setSocket: (socket: Socket | null) => void;
  setAddress: (address: string | null) => void;
};

export const ConnectionContext = createContext<ConnectionContextType>({
  address: null,
  socket: null,
  setAddress: () => {},
  setSocket: () => {},
});

export const useConnectionContext = () => useContext(ConnectionContext);

export const ConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [address, setAddress] = React.useState<string | null>(null);
  const [socket, setSocket] = React.useState<Socket | null>(null);

  return (
    <ConnectionContext.Provider
      value={{ address, setAddress, socket, setSocket }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
