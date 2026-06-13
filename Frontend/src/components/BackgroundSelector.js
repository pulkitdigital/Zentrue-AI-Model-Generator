// BackgroundSelector.js — Light Theme + Color Picker
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const PRESETS = [
  { label: "White",  value: "#FFFFFF" },
  { label: "Grey",   value: "#CCCCCC" },
  { label: "Black",  value: "#000000" },
  { label: "Cream",  value: "#F5F0E8" },
  { label: "Blue",   value: "#E8F0FE" },
];

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/;

export default function BackgroundSelector({ value, onChange }) {
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const colorInputRef = useRef(null);

  const isPreset = PRESETS.some((p) => p.value === value);
  const isCustomActive = !isPreset && HEX_REGEX.test(value);

  const handleCustomPick = (hex) => {
    setCustomColor(hex);
    onChange(hex);
  };

  const openPicker = () => {
    if (Platform.OS === "web") {
      colorInputRef.current?.click();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Background Color</Text>

      {/* Preset swatches */}
      <View style={styles.presetsRow}>
        {PRESETS.map((preset) => {
          const isSelected = value === preset.value;
          const isDark = preset.value === "#000000";
          return (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.swatch,
                { backgroundColor: preset.value },
                isSelected && styles.swatchSelected,
                isDark && styles.swatchDark,
              ]}
              onPress={() => onChange(preset.value)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Text style={[styles.tick, isDark && styles.tickLight]}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Custom color swatch — picker trigger */}
        <TouchableOpacity
          style={[
            styles.swatch,
            styles.swatchCustom,
            { backgroundColor: isCustomActive ? value : customColor },
            isCustomActive && styles.swatchSelected,
          ]}
          onPress={openPicker}
          activeOpacity={0.7}
        >
          {/* Gradient-like indicator */}
          {!isCustomActive && (
            <Text style={styles.customIcon}>+</Text>
          )}
          {isCustomActive && (
            <Text style={styles.tick}>✓</Text>
          )}

          {/* Hidden native color input — web only */}
          {Platform.OS === "web" && (
            <input
              ref={colorInputRef}
              type="color"
              value={isCustomActive ? value : customColor}
              onChange={(e) => handleCustomPick(e.target.value)}
              style={{
                position: "absolute",
                width: 0,
                height: 0,
                opacity: 0,
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Labels row */}
      <View style={styles.labelsRow}>
        {PRESETS.map((preset) => (
          <Text key={preset.value} style={styles.swatchLabel}>
            {preset.label}
          </Text>
        ))}
        <Text style={styles.swatchLabel}>Custom</Text>
      </View>

      {/* Selected custom color display */}
      {isCustomActive && (
        <TouchableOpacity style={styles.customRow} onPress={openPicker} activeOpacity={0.7}>
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: value },
              styles.colorPreviewActive,
            ]}
          />
          <Text style={styles.hexDisplay}>{value.toUpperCase()}</Text>
          <Text style={styles.changeTap}>Tap to change</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  swatchSelected: {
    borderWidth: 2.5,
    borderColor: "#7C3AED",
  },
  swatchDark: {
    borderColor: "#888888",
  },
  swatchCustom: {
    overflow: "hidden",
    position: "relative",
  },
  customIcon: {
    fontSize: 20,
    color: "#AAAAAA",
    fontWeight: "300",
    lineHeight: 24,
  },
  tick: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "700",
  },
  tickLight: {
    color: "#EEEEEE",
  },
  labelsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  swatchLabel: {
    width: 44,
    textAlign: "center",
    color: "#AAAAAA",
    fontSize: 10,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  colorPreviewActive: {
    borderColor: "#7C3AED",
    borderWidth: 2,
  },
  hexDisplay: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    fontFamily: "monospace",
  },
  changeTap: {
    color: "#7C3AED",
    fontSize: 12,
  },
});