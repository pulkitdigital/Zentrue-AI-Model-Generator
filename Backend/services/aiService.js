// ─── Provider Loader ──────────────────────────────────────────
const getProvider = () => {
  const providerName = (process.env.AI_PROVIDER || "openai").toLowerCase();

  const providers = {
    openai: require("../providers/openai"),
    replicate: require("../providers/replicate"),
    fashn: require("../providers/fashn"),
  };

  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unknown AI_PROVIDER: "${providerName}". Choose from: openai, replicate, fashn`);
  }

  console.log(`[aiService] Using provider: ${providerName}`);
  return provider;
};

// ─── Prompt Builder ───────────────────────────────────────────
const buildPrompt = ({ ageGroup, gender, modelStyle, pose, backgroundColor }) => {
  const style = modelStyle || "ecommerce";
  const poseLabel = (pose || "standing_front").replace(/_/g, " ");
  const bg = backgroundColor || "#FFFFFF";

  const prompt = `Create a photorealistic ${ageGroup} ${gender} fashion model.
Use all uploaded reference images to accurately recreate the clothing, outfit details, textures, colors, patterns, and styling.

Model Style: ${style}
Pose: ${poseLabel}
Background: solid color ${bg}

Requirements:
- Full body visible from head to toe
- Professional studio photography lighting
- Realistic human proportions
- Premium ecommerce catalogue quality
- High detail on fabric texture and clothing fit
- Photorealistic, not illustrated or artistic
- Clean background matching the specified color`;

  return prompt;
};

// ─── Main Generate Function ───────────────────────────────────
const generateModels = async ({ files, ageGroup, gender, backgroundColor, modelStyle, pose, generations }) => {
  const provider = getProvider();

  const imageBuffers = files.map((f) => f.buffer);
  const count = parseInt(generations) || 1;

  const prompt = buildPrompt({ ageGroup, gender, backgroundColor, modelStyle, pose });
  console.log("[aiService] Prompt:\n", prompt);

  const images = await provider.generate(prompt, imageBuffers, count);

  if (!images || images.length === 0) {
    throw new Error("AI returned no images. Please try again.");
  }

  return images;
};

module.exports = { generateModels };