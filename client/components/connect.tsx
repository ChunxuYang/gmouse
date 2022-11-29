import * as React from "react";
import { Modal, Text, View } from "react-native";
import io from "socket.io-client";
import { BarCodeScanner } from "expo-barcode-scanner";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useConnectionContext } from "../contexts/connection-context";

export default function Connect() {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null
  );
  const [scanning, setScanning] = React.useState(false);

  const { address, setAddress, socket, setSocket } = useConnectionContext();

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  function handleBarCodeScanned({ type, data }) {
    setScanning(false);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);

    // try connecting to socketio
    const socket_address = data
      .replace("exp://", "http://")
      .replace(":19000", ":5124");

    console.log(socket_address);

    const socket = io(socket_address, {
      transports: ["websocket"],
      rejectUnauthorized: false,
    });

    socket.io.on("error", (error) => {
      console.log(error);
      socket.close();
    });

    socket.io.on("open", () => {
      alert("Connected to socketio server");
      setAddress(socket_address);
      setSocket(socket);
    });
  }

  return (
    <View
      style={{ justifyContent: "center", alignItems: "center", marginTop: 10 }}
    >
      <TouchableOpacity
        style={{
          height: 50,
          borderRadius: 10,
          borderColor: "black",
          borderWidth: 3,
          padding: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          if (hasPermission) {
            setScanning(true);
          }
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {address === null ? "Connect" : address}
        </Text>
      </TouchableOpacity>

      <Modal visible={scanning}>
        <BarCodeScanner
          onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
          style={{ flex: 1 }}
        />
      </Modal>
    </View>
  );
}
