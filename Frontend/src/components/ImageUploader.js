// ImageUploader.js — Light Theme
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { validateImage } from "../utils/imageHelper";

const MAX_IMAGES = 4;

export default function ImageUploader({ images, onChange }) {
  const handleAdd = () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Limit Reached", "Maximum 4 images allowed.");
      return;
    }

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.multiple = true;
      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_IMAGES - images.length;
        const selected = files.slice(0, remaining);

        const newImages = [];
        for (const file of selected) {
          const uri = URL.createObjectURL(file);
          const validation = validateImage(uri, file.size);
          if (!validation.valid) {
            Alert.alert("Invalid Image", validation.error);
            continue;
          }
          newImages.push({
            uri,
            fileSize: file.size,
            fileName: file.name,
            type: file.type,
            _webFile: file,
          });
        }

        if (newImages.length > 0) {
          onChange([...images, ...newImages].slice(0, MAX_IMAGES));
        }
      };
      input.click();
    } else {
      const { launchImageLibrary } = require("react-native-image-picker");
      launchImageLibrary(
        {
          mediaType: "photo",
          selectionLimit: MAX_IMAGES - images.length,
          includeBase64: false,
        },
        (response) => {
          if (response.didCancel || response.errorCode) return;

          const newImages = [];
          for (const asset of response.assets || []) {
            const validation = validateImage(asset.uri, asset.fileSize);
            if (!validation.valid) {
              Alert.alert("Invalid Image", validation.error);
              continue;
            }
            newImages.push({
              uri: asset.uri,
              fileSize: asset.fileSize,
              fileName: asset.fileName,
              type: asset.type,
            });
          }

          if (newImages.length > 0) {
            onChange([...images, ...newImages].slice(0, MAX_IMAGES));
          }
        }
      );
    }
  };

  const handleRemove = (index) => {
    if (Platform.OS === "web" && images[index]?.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(images[index].uri);
    }
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Clothing Images</Text>
      <Text style={styles.sublabel}>Upload 1–4 photos of the clothing item</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {images.map((img, index) => (
          <View key={index} style={styles.tile}>
            <Image source={{ uri: img.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeX}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {images.length < MAX_IMAGES && (
          <TouchableOpacity style={styles.addTile} onPress={handleAdd}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.counter}>
        {images.length}/{MAX_IMAGES} images added
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  sublabel: {
    color: "#AAAAAA",
    fontSize: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 4,
  },
  tile: {
    width: 100,
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  removeX: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
  addTile: {
    width: 100,
    height: 120,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E2E2",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
    gap: 6,
  },
  addIcon: {
    color: "#AAAAAA",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "300",
  },
  addText: {
    color: "#AAAAAA",
    fontSize: 11,
  },
  counter: {
    color: "#AAAAAA",
    fontSize: 11,
    marginTop: 8,
    textAlign: "right",
  },
});