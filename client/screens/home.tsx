import React from "react";

import { Button, Text, View, TouchableOpacity } from "react-native";
import { AVAILABLE_OPERATIONS } from "../constants";
import { useSampleContext } from "../contexts/samples-context";
import { BatchType } from "../types/data-type";
import model from "../utils/knn";
import useIMU from "../utils/sensors";

export default function HomeScreen() {
  const { sampleSets } = useSampleContext();
  const [recording, setRecording] = React.useState(false);
  const [imuData, setImuData] = React.useState<BatchType>([]);

  const [prediction, setPrediction] = React.useState<string>("");

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

      <Text>{prediction === null ? "No prediction yet" : prediction}</Text>
    </View>
  );
}
