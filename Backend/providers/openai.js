const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate fashion model images using OpenAI GPT-image-1
 * @param {string} prompt - The constructed prompt
 * @param {Buffer[]} imageBuffers - Array of uploaded image buffers
 * @param {number} count - Number of images to generate
 * @returns {Promise<Array<{url: string}>>}
 */
const generate = async (prompt, imageBuffers, count) => {
  const results = [];

  // GPT-image-1 supports image editing (inpainting/variation with reference)
  // We use the first image as the primary reference
  const primaryImageBuffer = imageBuffers[0];

  // Convert buffer to File object (required by OpenAI SDK)
  const imageFile = await OpenAI.toFile(primaryImageBuffer, "clothing.png", {
    type: "image/png",
  });

  // Generate `count` images — OpenAI supports n param
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt: prompt,
    n: count,
    size: "1024x1024",
    quality: "standard",
  });

  for (const img of response.data) {
    if (img.url) {
      results.push({ url: img.url });
    } else if (img.b64_json) {
      // GPT-image-1 may return base64 — convert to data URI
      results.push({ url: `data:image/png;base64,${img.b64_json}` });
    }
  }

  return results;
};

module.exports = { generate };