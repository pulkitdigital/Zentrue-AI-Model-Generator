const axios = require("axios");

const FASHN_BASE_URL = "https://api.fashn.ai/v1";

/**
 * Generate fashion model images using Fashn.ai
 * @param {string} prompt - The constructed prompt
 * @param {Buffer[]} imageBuffers - Array of uploaded image buffers
 * @param {number} count - Number of images to generate
 * @returns {Promise<Array<{url: string}>>}
 */
const generate = async (prompt, imageBuffers, count) => {
  const results = [];

  // Convert primary image to base64
  const garmentBase64 = imageBuffers[0].toString("base64");
  const garmentDataUri = `data:image/png;base64,${garmentBase64}`;

  // Fashn.ai run endpoint
  const runResponse = await axios.post(
    `${FASHN_BASE_URL}/run`,
    {
      model_image: "https://fashn.ai/examples/model.jpg", // Default model — replace with user model if added later
      garment_image: garmentDataUri,
      category: "tops",
      nsfw_filter: true,
      num_samples: count,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const predictionId = runResponse.data?.id;
  if (!predictionId) throw new Error("Fashn.ai did not return a prediction ID");

  // ─── Poll until complete ─────────────────────────────────────
  let attempts = 0;
  const MAX_ATTEMPTS = 30;
  const POLL_INTERVAL_MS = 3000;

  while (attempts < MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const statusResponse = await axios.get(`${FASHN_BASE_URL}/status/${predictionId}`, {
      headers: { Authorization: `Bearer ${process.env.FASHN_API_KEY}` },
    });

    const { status, output, error } = statusResponse.data;

    if (status === "completed" && output) {
      for (const url of output) {
        results.push({ url });
      }
      break;
    }

    if (status === "failed" || error) {
      throw new Error(`Fashn.ai generation failed: ${error || "Unknown error"}`);
    }

    attempts++;
  }

  if (results.length === 0) {
    throw new Error("Fashn.ai timed out. Please try again.");
  }

  return results;
};

module.exports = { generate };