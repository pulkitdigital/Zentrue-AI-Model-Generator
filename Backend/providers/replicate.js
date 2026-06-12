const Replicate = require("replicate");

const client = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// IDM-VTON — best for garment-preserving virtual try-on
const MODEL_ID = "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f";

/**
 * Generate fashion model images using Replicate IDM-VTON
 * @param {string} prompt - The constructed prompt
 * @param {Buffer[]} imageBuffers - Array of uploaded image buffers
 * @param {number} count - Number of images to generate
 * @returns {Promise<Array<{url: string}>>}
 */
const generate = async (prompt, imageBuffers, count) => {
  const results = [];

  // Convert primary clothing image buffer to base64
  const garmentBase64 = imageBuffers[0].toString("base64");
  const garmentDataUri = `data:image/png;base64,${garmentBase64}`;

  // Run `count` times (Replicate runs one at a time)
  const promises = Array.from({ length: count }, () =>
    client.run(MODEL_ID, {
      input: {
        garm_img: garmentDataUri,
        category: "upper_body",
        description: prompt,
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: Math.floor(Math.random() * 999999),
      },
    })
  );

  const outputs = await Promise.allSettled(promises);

  for (const result of outputs) {
    if (result.status === "fulfilled" && result.value) {
      const url = Array.isArray(result.value) ? result.value[0] : result.value;
      results.push({ url });
    }
  }

  return results;
};

module.exports = { generate };