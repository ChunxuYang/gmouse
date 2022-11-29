import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

export default function TouchpadScreen() {
  const [currentCursor, setCurrentCursor] = React.useState({
    x: 0,
    y: 0,
  });

  const singleTap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e) => {
      const fingers = e.numberOfPointers;
      console.log("Single tap with " + fingers + " fingers");
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onUpdate((e) => {
      const { translationX, translationY } = e;
      setCurrentCursor({
        x: translationX,
        y: translationY,
      });
    });

  const doublePan = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onEnd((e) => {
      // determin up, down, left, right
      const { translationX, translationY } = e;
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > 0) {
          console.log("Right");
        } else {
          console.log("Left");
        }
      }

      if (Math.abs(translationX) < Math.abs(translationY)) {
        if (translationY > 0) {
          console.log("Down");
        } else {
          console.log("Up");
        }
      }
    });

  const tripplePan = Gesture.Pan()
    .minPointers(3)
    .onEnd((e) => {
      const { translationX, translationY } = e;
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > 0) {
          console.log("Tripple Right");
        } else {
          console.log("Tripple Left");
        }
      } else {
        if (translationY > 0) {
          console.log("Tripple Down");
        } else {
          console.log("Tripple Up");
        }
      }
    });

  const gestureHandler = Gesture.Exclusive(
    pan,
    doublePan,
    tripplePan,
    singleTap
  );

  return (
    <GestureDetector gesture={gestureHandler}>
      <View style={styles.container}>
        {/* a big arrow pointing to right */}
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
          <Text>
            {currentCursor.x.toFixed(3)} {currentCursor.y.toFixed(3)}
          </Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 100,
  },
});