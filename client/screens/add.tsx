import React from "react";

import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Button,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import useIMU from "../utils/sensors";

import { Picker } from "@react-native-picker/picker";

import model from "../utils/knn";
import { BatchType } from "../types/data-type";
import { useSampleContext } from "../contexts/samples-context";
import { AVAILABLE_OPERATIONS } from "../constants";

function CustomButton({
  onPress,
  title,
  danger,
}: {
  onPress: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
      }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 16, color: danger ? "red" : "blue" }}>
        {title}
      </Text>
    </Pressable>
  );
}

export default function AddScreen() {
  const { sampleSets, addSampleSet, addSample, setSampleSet, deleteSampleSet } =
    useSampleContext();

  const [recording, setRecording] = React.useState<string | null>(null);
  const [editingSet, setEditingSet] = React.useState<string | null>(null);
  const [imuData, setImuData] = React.useState<BatchType>([]);

  const [currentData, setCurrentData] = React.useState<{
    label: string;
    value: number;
  }>(AVAILABLE_OPERATIONS[0]);

  const { data, startSubscription, stopSubscription } = useIMU();

  function stopRecording(setId: string, classValue: number) {
    setRecording(null);
    stopSubscription();
    model.addExample(imuData, classValue);
    addSample(imuData, setId);
  }

  function startRecording(setId: string) {
    setRecording(setId);
    setImuData([]);
    startSubscription();

    setInterval(() => {
      // just recording the last 100 data points
      const newData = [...imuData];
      newData.push(data);
      if (newData.length > 100) {
        newData.shift();
      }
      setImuData(newData);
    }, 100);
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editingSet !== null}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "white",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 20 }}>Operation</Text>
            <Picker
              selectedValue={currentData.value}
              onValueChange={(itemValue, itemIndex) => {
                setCurrentData(AVAILABLE_OPERATIONS[itemIndex]);
                console.log(AVAILABLE_OPERATIONS[itemIndex]);
              }}
            >
              {AVAILABLE_OPERATIONS.map((operation, index) => (
                <Picker.Item
                  key={index}
                  label={operation.label}
                  value={operation.value}
                />
              ))}
            </Picker>

            <View
              style={{
                flexDirection: "row",
                // right aligned
                justifyContent: "flex-end",
              }}
            >
              <Button
                title="Cancel"
                onPress={() => {
                  setEditingSet(null);
                }}
              />
              <Button
                title="Done"
                onPress={() => {
                  if (editingSet !== null) {
                    setSampleSet(editingSet, {
                      class: currentData,
                    });
                    setEditingSet(null);
                  }
                }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
      <View
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        {sampleSets.length === 0 && (
          <Text
            style={{
              fontSize: 20,
              marginBottom: 20,
            }}
          >
            No sample sets. Please add one first.
          </Text>
        )}
        {sampleSets.map((sampleSet, index) => (
          // two components in a row: name is select, edit is button
          <View
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderColor: "black",
              borderWidth: 3,
              borderRadius: 10,
              marginBottom: 10,

              padding: 10,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                {sampleSet.class.label}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontStyle: "italic",
                }}
              >
                {sampleSet.samples.length} samples
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <CustomButton
                title="Edit"
                onPress={() => {
                  setEditingSet(sampleSet.id);
                }}
              />
              <CustomButton
                title={recording === sampleSet.id ? "Stop" : "Record"}
                onPress={() => {
                  if (recording === sampleSet.id) {
                    stopRecording(sampleSet.id, sampleSet.class.value);
                  } else {
                    // start recording
                    startRecording(sampleSet.id);
                  }
                }}
              />
              <CustomButton
                title="Delete"
                danger={true}
                onPress={() => {
                  deleteSampleSet(sampleSet.id);
                }}
              ></CustomButton>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={{
            width: "100%",
            borderRadius: 10,
            borderColor: "black",
            borderWidth: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
          }}
          onPress={() => {
            addSampleSet({
              id: Math.random().toString(),
              class: AVAILABLE_OPERATIONS[0],
              samples: [],
            });
          }}
        >
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>+</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
