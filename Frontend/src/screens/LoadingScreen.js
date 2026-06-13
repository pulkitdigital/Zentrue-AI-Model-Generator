// LoadingScreen.js — Light Theme
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const MESSAGES = [
  "Analyzing your clothing...",
  "Building the model...",
  "Applying style and pose...",
  "Rendering details...",
  "Finalizing outputs...",
];

export default function LoadingScreen() {
  const { generations } = useLocalSearchParams();
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ─── Rotate spinner ──────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // ─── Pulse glow ───────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ─── Rotate messages ──────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Spinner */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.spinnerWrapper}>
            <Animated.View
              style={[styles.spinner, { transform: [{ rotate: spin }] }]}
            />
            <View style={styles.spinnerInner}>
              <Text style={styles.spinnerIcon}>✦</Text>
            </View>
          </View>
        </Animated.View>

        {/* Status text */}
        <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
          {MESSAGES[messageIndex]}
        </Animated.Text>

        <Text style={styles.subtext}>
          Generating {generations || 1}{" "}
          {Number(generations) === 1 ? "image" : "images"}
        </Text>

        <Text style={styles.warning}>
          Please don't close the app
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  spinnerWrapper: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  spinner: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: "transparent",
    borderTopColor: "#7C3AED",
    borderRightColor: "#7C3AED30",
  },
  spinnerInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#7C3AED30",
  },
  spinnerIcon: {
    color: "#7C3AED",
    fontSize: 22,
  },
  message: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtext: {
    color: "#666666",
    fontSize: 13,
    textAlign: "center",
  },
  warning: {
    color: "#AAAAAA",
    fontSize: 12,
    textAlign: "center",
    position: "absolute",
    bottom: 50,
  },
});