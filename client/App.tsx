import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/home";
import AddScreen from "./screens/add";
import * as React from "react";
import { SampleProvider } from "./contexts/samples-context";
import TouchpadScreen from "./screens/touchpad";
import { ConnectionProvider } from "./contexts/connection-context";

const Tabs = createBottomTabNavigator();

export default function App() {
  return (
    <ConnectionProvider>
      <SampleProvider>
        <NavigationContainer>
          <Tabs.Navigator>
            <Tabs.Screen name="Home" component={HomeScreen} />
            <Tabs.Screen name="Add" component={AddScreen} />
            <Tabs.Screen name="Touchpad" component={TouchpadScreen} />
          </Tabs.Navigator>
        </NavigationContainer>
      </SampleProvider>
    </ConnectionProvider>
  );
}
