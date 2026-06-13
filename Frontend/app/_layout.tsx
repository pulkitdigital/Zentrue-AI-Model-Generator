// _layout.tsx — Light Theme
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F8F8F8" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="loading"
          options={{
            animation: "fade",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="results"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});