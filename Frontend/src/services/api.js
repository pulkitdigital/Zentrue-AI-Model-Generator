import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Add it to your .env file and restart with: npx expo start --clear"
  );
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("[API] Error status:", err.response?.status);
    console.log("[API] Error data:", JSON.stringify(err.response?.data));
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Something went wrong. Please try again.";
    throw new Error(msg);
  }
);

export const generateModels = async ({
  images,
  ageGroup,
  gender,
  backgroundColor,
  modelStyle,
  pose,
  generations,
}) => {
  if (!images || images.length === 0) {
    throw new Error("At least one clothing image is required.");
  }
  if (images.length > 4) {
    throw new Error("Maximum 4 images allowed.");
  }

  const formData = new FormData();

  // ─── Append images ─────────────────────────────────────────
  for (let index = 0; index < images.length; index++) {
    const image = images[index];

    if (image._webFile) {
      // Web: append actual File object — blob URI kaam nahi karta
      formData.append("images", image._webFile, image.fileName);
    } else {
      // Native (Android/iOS)
      const { uri, fileName, type } = image;
      const resolvedName = fileName || `image_${index}.jpg`;
      let resolvedMime = type;
      if (!resolvedMime) {
        const ext = resolvedName.split(".").pop()?.toLowerCase();
        resolvedMime =
          ext === "png" ? "image/png"
          : ext === "webp" ? "image/webp"
          : "image/jpeg";
      }
      formData.append("images", { uri, name: resolvedName, type: resolvedMime });
    }
  }

  // ─── Append fields ─────────────────────────────────────────
  formData.append("ageGroup", ageGroup);
  formData.append("gender", gender);
  formData.append("backgroundColor", backgroundColor || "#FFFFFF");
  formData.append("modelStyle", modelStyle || "ecommerce");
  formData.append("pose", pose || "standing_front");
  formData.append("generations", String(generations || 1));

  const response = await apiClient.post("/generate-models", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || "Generation failed.");
  }

  return response.data.images;
};

export const checkHealth = async () => {
  const response = await apiClient.get("/health");
  return response.data;
};