// const OpenAI = require("openai");

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const generate = async (prompt, imageBuffers, count) => {
//   const results = [];

//   const primaryImageBuffer = imageBuffers[0];

//   const imageFile = await OpenAI.toFile(primaryImageBuffer, "clothing.png", {
//     type: "image/png",
//   });

//   const response = await client.images.edit({  // ✅ generate → edit
//     model: "gpt-image-1",
//     image: imageFile,                          // ✅ image pass ho rahi hai
//     prompt: prompt,
//     n: count,
//     size: "1024x1024",
//     quality: "low",                            // ✅ credits bachenge
//   });

//   for (const img of response.data) {
//     if (img.url) {
//       results.push({ url: img.url });
//     } else if (img.b64_json) {
//       results.push({ url: `data:image/png;base64,${img.b64_json}` });
//     }
//   }

//   return results;
// };

// module.exports = { generate };














const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Step 1: Clothing analyse karo
const analyzeClothing = async (imageBuffer) => {
  const base64Image = imageBuffer.toString("base64");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: `Analyze this clothing item image carefully and respond in pure JSON only. No extra text, no markdown.
{
  "clothingType": "top" | "bottom" | "full_outfit" | "shoes" | "accessories",
  "shotType": "upper_body" | "lower_body" | "full_body" | "feet",
  "category": "shirt" | "t-shirt" | "jacket" | "coat" | "dress" | "pants" | "jeans" | "shorts" | "skirt" | "shoes" | "kurta" | "saree" | "lehenga" | "suit" | "other",
  "color": "exact color description",
  "pattern": "solid" | "striped" | "checkered" | "printed" | "embroidered" | "other",
  "fabric": "cotton" | "silk" | "denim" | "wool" | "polyester" | "linen" | "other",
  "details": "describe key details like collar type, sleeve length, buttons, embroidery, print, logo, etc",
  "fitType": "slim fit" | "regular fit" | "loose fit" | "oversized"
}`,
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  try {
    const text = response.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    console.log("[openai] Clothing analysis:", parsed);
    return parsed;
  } catch {
    console.log("[openai] Analysis parse failed, using defaults");
    return {
      clothingType: "top",
      shotType: "upper_body",
      category: "shirt",
      color: "as shown in image",
      pattern: "as shown in image",
      fabric: "as shown in image",
      details: "as shown in uploaded image",
      fitType: "regular fit",
    };
  }
};

// Step 2: Best prompt banao
const buildSmartPrompt = (info, { ageGroup, gender, modelStyle, pose, backgroundColor }) => {
  const style = modelStyle || "ecommerce";
  const bg = backgroundColor || "#FFFFFF";
  const poseLabel = (pose || "standing_front").replace(/_/g, " ");

  const shotMap = {
    upper_body: "upper body shot from waist up, model's torso and face clearly visible, focus on the upper garment",
    lower_body: "lower body shot from waist down to feet, focus on the bottom garment",
    full_body: "full body shot from head to toe, entire outfit visible",
    feet: "lower leg and feet shot, focus on the footwear",
  };

  const shot = shotMap[info.shotType] || shotMap.upper_body;

  return `TASK: Generate a professional ${style} fashion catalogue photo of a ${ageGroup} ${gender} model wearing the EXACT clothing item shown in the uploaded reference image.

CLOTHING TO RECREATE:
- Item: ${info.category}
- Color: ${info.color}
- Pattern: ${info.pattern}
- Fabric: ${info.fabric}
- Fit: ${info.fitType}
- Key details: ${info.details}

CRITICAL RULES:
- The clothing MUST be identical to the uploaded image — same color, same pattern, same design, same fabric texture, same fit, same every detail
- Do NOT change, modify, or improve the clothing in any way
- Do NOT add or remove any design elements
- Reproduce every visible detail exactly as shown

PHOTO SPECIFICATIONS:
- Shot type: ${shot}
- Model pose: ${poseLabel}
- Background: pure solid ${bg} color, no shadows, no gradients
- Lighting: professional studio lighting, soft and even
- Camera: sharp focus on garment, shallow depth of field
- Quality: ultra high resolution, photorealistic, not illustrated

OUTPUT STYLE: Premium ${style} catalogue photography, similar to top fashion ecommerce brands.`;
};

const generate = async (prompt, imageBuffers, count, options = {}) => {
  const results = [];
  const primaryImageBuffer = imageBuffers[0];

  // Step 1: Clothing analyse karo
  console.log("[openai] Analyzing clothing...");
  const clothingInfo = await analyzeClothing(primaryImageBuffer);

  // Step 2: Smart prompt banao
  const smartPrompt = buildSmartPrompt(clothingInfo, options);
  console.log("[openai] Smart prompt built for:", clothingInfo.category);

  // Step 3: Image generate karo
  const imageFile = await OpenAI.toFile(primaryImageBuffer, "clothing.png", {
    type: "image/png",
  });

  const response = await client.images.edit({
    model: "gpt-image-2",
    image: imageFile,
    prompt: smartPrompt,
    n: count,
    size: "1024x1024",
    quality: "low",
  });

  for (const img of response.data) {
    if (img.url) {
      results.push({ url: img.url });
    } else if (img.b64_json) {
      results.push({ url: `data:image/png;base64,${img.b64_json}` });
    }
  }

  return results;
};

module.exports = { generate };