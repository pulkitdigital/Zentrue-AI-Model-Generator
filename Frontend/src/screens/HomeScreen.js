// HomeScreen.js — Light Theme + Web max-width fix
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import ImageUploader from "../components/ImageUploader";
import AgeGroupSelector from "../components/AgeGroupSelector";
import GenderSelector from "../components/GenderSelector";
import BackgroundSelector from "../components/BackgroundSelector";
import ModelStyleSelector from "../components/ModelStyleSelector";
import PoseSelector from "../components/PoseSelector";
import GenerationCount from "../components/GenerationCount";
import { generateModels } from "../services/api";

const DEFAULT_STATE = {
  images: [],
  ageGroup: "adult",
  gender: "female",
  backgroundColor: "#FFFFFF",
  modelStyle: "ecommerce",
  pose: "standing_front",
  generations: 1,
};

export default function HomeScreen() {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);

  const isFormValid = form.images.length > 0 && form.ageGroup && form.gender;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!isFormValid) return;
    setLoading(true);
    router.push({ pathname: "/loading", params: { generations: form.generations } });
    try {
      const generatedImages = await generateModels({
        images: form.images,
        ageGroup: form.ageGroup,
        gender: form.gender,
        backgroundColor: form.backgroundColor,
        modelStyle: form.modelStyle,
        pose: form.pose,
        generations: form.generations,
      });
      router.replace({
        pathname: "/results",
        params: { images: JSON.stringify(generatedImages), generations: form.generations },
      });
    } catch (error) {
      console.error("[HomeScreen] Generation error:", error.message);
      router.back();
      Alert.alert("Generation Failed", error.message || "Something went wrong. Please try again.", [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.centerWrap}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>AI Fashion Model</Text>
            <Text style={styles.subtitle}>
              Upload clothing → Generate studio-quality model photos
            </Text>
          </View>

          <ImageUploader
            images={form.images}
            onChange={(val) => updateField("images", val)}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <AgeGroupSelector
                value={form.ageGroup}
                onChange={(val) => updateField("ageGroup", val)}
              />
            </View>
            <View style={styles.half}>
              <GenderSelector
                value={form.gender}
                onChange={(val) => updateField("gender", val)}
              />
            </View>
          </View>

          <BackgroundSelector
            value={form.backgroundColor}
            onChange={(val) => updateField("backgroundColor", val)}
          />
          <ModelStyleSelector
            value={form.modelStyle}
            onChange={(val) => updateField("modelStyle", val)}
          />
          <PoseSelector
            value={form.pose}
            onChange={(val) => updateField("pose", val)}
          />
          <GenerationCount
            value={form.generations}
            onChange={(val) => updateField("generations", val)}
          />

          {!isFormValid && (
            <Text style={styles.requiredHint}>
              {form.images.length === 0
                ? "Upload at least one clothing image to continue"
                : "Select age group and gender to continue"}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.generateBtn, !isFormValid && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={!isFormValid || loading}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.generateBtnText,
              !isFormValid && styles.generateBtnTextDisabled,
            ]}>
              Generate Models
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomPad} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  centerWrap: {
    flex: 1,
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: { marginBottom: 28 },
  title: {
    color: "#111111",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: "#666666",
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: { flex: 1 },
  requiredHint: {
    color: "#7C3AED",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 14,
    opacity: 0.8,
  },
  generateBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  generateBtnDisabled: {
    backgroundColor: "#E2E2E2",
    shadowOpacity: 0,
    elevation: 0,
  },
  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  generateBtnTextDisabled: {
    color: "#AAAAAA",
  },
  bottomPad: { height: 40 },
});