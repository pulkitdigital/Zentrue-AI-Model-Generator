const Replicate = require("replicate");

const client = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

const MODEL_ID = "black-forest-labs/flux-dev";

const generate = async (prompt, imageBuffers, count) => {
  const results = [];

  const promises = Array.from({ length: count }, () =>
    client.run(MODEL_ID, {
      input: {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: "2:3",        // portrait — full body ke liye
        output_format: "jpg",
        output_quality: 90,
        guidance: 3.5,
        num_inference_steps: 28,
      },
    })
  );

  const outputs = await Promise.allSettled(promises);

  console.log("[replicate] raw outputs:", JSON.stringify(outputs));

  for (const result of outputs) {
    if (result.status === "fulfilled" && result.value) {
      const val = result.value;
      // FLUX returns array of URLs or ReadableStream
      if (Array.isArray(val) && val.length > 0) {
        results.push({ url: val[0] });
      } else if (typeof val === "string") {
        results.push({ url: val });
      } else if (val?.url) {
        results.push({ url: val.url });
      }
    } else if (result.status === "rejected") {
      console.error("[replicate] Run failed:", result.reason?.message);
    }
  }

  return results;
};

module.exports = { generate };