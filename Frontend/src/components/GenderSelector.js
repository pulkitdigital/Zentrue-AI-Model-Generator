import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

const OPTIONS = [
  { label: "Female", value: "female" },
  { label: "Male",   value: "male" },
];

export default function GenderSelector({ value, onChange }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gender</Text>
      <View style={[styles.optionsWrap, Platform.OS === "web" && styles.optionsCol]}>
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.text, isSelected && styles.textSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionsWrap: {
    flexDirection: "row",
    gap: 8,
  },
  optionsCol: {
    flexDirection: "column",
  },
  option: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionSelected: {
    borderColor: "#7C3AED",
    backgroundColor: "#EDE9FE",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#AAAAAA",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#7C3AED",
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#7C3AED",
  },
  text: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },
  textSelected: {
    color: "#7C3AED",
    fontWeight: "600",
  },
});