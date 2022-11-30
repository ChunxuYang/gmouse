import React from "react";

import { Button, Text, View, TouchableOpacity } from "react-native";
import { AVAILABLE_OPERATIONS, DELAY_OPERATIONS } from "../constants";
import { useSampleContext } from "../contexts/samples-context";
import { BatchType } from "../types/data-type";
import { Picker } from "@react-native-picker/picker";
import model from "../utils/knn";
import useIMU from "../utils/sensors";

import Connect from "../components/connect";

export default function HomeScreen() {
  const { sampleSets } = useSampleContext();
  const [recording, setRecording] = React.useState(false);
  const [imuData, setImuData] = React.useState<BatchType>([]);

  const [prediction, setPrediction] = React.useState<string>("");

  const [currentData, setCurrentData] = React.useState<{
    label: string;
    value: number;
  }>(DELAY_OPERATIONS[0]);

  const { data, startSubscription, stopSubscription } = useIMU();

  React.useEffect(() => {
    if (sampleSets.length > 0) {
      model.refreshAllClasses(sampleSets);
    }
  }, [sampleSets]);

  async function stopRecording() {
    setRecording(false);
    stopSubscription();
    const prediction = await model.predict(imuData);
    const type = prediction.type;
    const label = AVAILABLE_OPERATIONS.find(
      (op) => op.value.toString() === type
    )?.label;
    setPrediction(`Prediction: ${label} - ${prediction.confidence}`);
  }

  function startRecording() {
    setRecording(true);
    setImuData([]);
    startSubscription();

    setInterval(() => {
      // just recording the last 100 data points
      const newData = imuData;
      newData.push(data);
      if (newData.length > 100) {
        newData.shift();
      }
      setImuData(newData);
    }, 100);
  }

  function handleBarCodeScanned({ type, data }) {
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={{
          width: 100,
          height: 50,
          borderRadius: 10,
          borderColor: "black",
          borderWidth: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => {
          if (recording) {
            // stop recording
            stopRecording();
          } else {
            // start recording
            startRecording();
          }
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {recording ? "Stop" : "Start"}
        </Text>
      </TouchableOpacity>

      <Connect />

      <View
        style={{
          display: "flex",
          flexDirection: "row",

          borderWidth: 3,
          borderColor: "black",
          borderRadius: 10,
          marginTop: 20,
          padding: 10,

          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Delay
        </Text>

        <Picker
          style={{
            width: 200,
            marginLeft: 10,
          }}
          selectedValue={currentData.value}
          onValueChange={(itemValue, itemIndex) => {
            setCurrentData(DELAY_OPERATIONS[itemIndex]);
            console.log(DELAY_OPERATIONS[itemIndex]);
          }}
        >
          {DELAY_OPERATIONS.map((operation, index) => (
            <Picker.Item
              key={index}
              label={operation.label}
              value={operation.value}
            />
          ))}
        </Picker>
      </View>

      <Text>{prediction === null ? "No prediction yet" : prediction}</Text>
    </View>
  );
}
