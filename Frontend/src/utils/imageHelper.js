import { Platform } from "react-native";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export const validateImage = (uri, fileSizeBytes) => {
  if (!uri.startsWith("blob:") && !uri.startsWith("data:")) {
    const ext = uri.split(".").pop()?.toLowerCase().split("?")[0];
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: "Please upload JPG, PNG or WEBP only." };
    }
  }

  if (fileSizeBytes && fileSizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: "File size must be under 10MB." };
  }

  return { valid: true };
};

/**
 * Web pe direct <a href="external-url"> download nahi hota CORS ki wajah se.
 * Fix: fetch → blob → object URL → click → revoke
 */
const downloadOnWeb = async (url) => {
  // 1. Image fetch karo as blob
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();

  // 2. Temporary blob URL banao
  const blobUrl = URL.createObjectURL(blob);

  // 3. Hidden anchor tag se trigger karo download
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `fashion_model_${Date.now()}.jpg`;
  document.body.appendChild(link);
  link.click();

  // 4. Cleanup — memory leak avoid karne ke liye
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);

  return true;
};

export const saveImageToGallery = async (url) => {
  // ─── Web ───────────────────────────────────────────────────────────────────
  if (Platform.OS === "web") {
    return await downloadOnWeb(url);
  }

  // ─── Native (iOS / Android) ────────────────────────────────────────────────
  const MediaLibrary = await import("expo-media-library");
  const FileSystem = await import("expo-file-system");

  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Gallery permission denied. Please allow in Settings.");
  }

  let localUri = url;

  // Remote URL → download to cache first
  if (url.startsWith("http")) {
    const filename = `fashion_model_${Date.now()}.jpg`;
    const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
    const result = await FileSystem.downloadAsync(url, downloadPath);
    localUri = result.uri;
  }

  // Base64 data URI → write to cache
  if (url.startsWith("data:image")) {
    const base64Data = url.split(",")[1];
    const filename = `fashion_model_${Date.now()}.jpg`;
    const filePath = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    localUri = filePath;
  }

  await MediaLibrary.saveToLibraryAsync(localUri);
  return true;
};

export const getFileSizeLabel = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};