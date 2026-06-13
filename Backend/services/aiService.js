// // ─── Provider Loader ──────────────────────────────────────────
// const getProvider = () => {
//   const providerName = (process.env.AI_PROVIDER || "openai").toLowerCase();

//   const providers = {
//     openai: require("../providers/openai"),
//     replicate: require("../providers/replicate"),
//     fashn: require("../providers/fashn"),
//   };

//   const provider = providers[providerName];
//   if (!provider) {
//     throw new Error(`Unknown AI_PROVIDER: "${providerName}". Choose from: openai, replicate, fashn`);
//   }

//   console.log(`[aiService] Using provider: ${providerName}`);
//   return provider;
// };

// const buildPrompt = ({ ageGroup, gender, modelStyle, pose, backgroundColor }) => {
//   const style = modelStyle || "ecommerce";
//   const poseLabel = (pose || "standing_front").replace(/_/g, " ");
//   const bg = backgroundColor || "#FFFFFF";

//   return `You are a fashion ecommerce photographer. The uploaded image contains a specific clothing item. Generate a photorealistic ${ageGroup} ${gender} model wearing EXACTLY the same clothing item from the uploaded image — preserve the exact color, fabric texture, design, pattern, print, buttons, collar, and all details of the garment without any changes. Model pose: ${poseLabel}. Pure solid ${bg} background only. Full body visible from head to toe. Professional studio lighting. ${style} catalogue style. The garment must look identical to the uploaded reference image.`;
// };


// // ─── Main Generate Function ───────────────────────────────────
// const generateModels = async ({ files, ageGroup, gender, backgroundColor, modelStyle, pose, generations }) => {
//   const provider = getProvider();

//   const imageBuffers = files.map((f) => f.buffer);
//   const count = parseInt(generations) || 1;

//   const prompt = buildPrompt({ ageGroup, gender, backgroundColor, modelStyle, pose });
//   console.log("[aiService] Prompt:\n", prompt);

//   const images = await provider.generate(prompt, imageBuffers, count);

//   if (!images || images.length === 0) {
//     throw new Error("AI returned no images. Please try again.");
//   }

//   return images;
// };

// module.exports = { generateModels };








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

const generateModels = async ({ files, ageGroup, gender, backgroundColor, modelStyle, pose, generations }) => {
  const provider = getProvider();

  const imageBuffers = files.map((f) => f.buffer);
  const count = parseInt(generations) || 1;

  console.log("[aiService] Sending to provider with options...");

  const images = await provider.generate(null, imageBuffers, count, {
    ageGroup,
    gender,
    backgroundColor,
    modelStyle,
    pose,
  });

  if (!images || images.length === 0) {
    throw new Error("AI returned no images. Please try again.");
  }

  return images;
};

module.exports = { generateModels };