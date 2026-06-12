# AI Fashion Model Generator — Backend Documentation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Image Upload:** Multer (memory storage)
- **AI Providers:** OpenAI GPT-image-1 / Replicate IDM-VTON / Fashn.ai
- **Rate Limiting:** express-rate-limit
- **Deploy Target:** Railway / Render

---

## Folder Structure

```
backend/
├── providers/
│   ├── openai.js          # GPT-image-1 integration
│   ├── replicate.js       # IDM-VTON integration
│   └── fashn.js           # Fashn.ai integration
│
├── services/
│   └── aiService.js       # Provider switcher + prompt builder
│
├── routes/
│   └── generate.js        # POST /generate-models route
│
├── middlewares/
│   ├── upload.js          # Multer config (memory storage)
│   ├── validate.js        # Input validation
│   └── rateLimit.js       # 10 req/min per IP
│
├── .env                   # Your actual keys (never commit)
├── .env.example           # Template to share safely
├── server.js              # Express app entry point
└── package.json
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Fill in your API key in .env
OPENAI_API_KEY=sk-...

# 4. Start dev server
npm run dev

# 5. Start production server
npm start
```

---

## Environment Variables

```env
PORT=5000

# Switch provider: openai | replicate | fashn
AI_PROVIDER=openai

OPENAI_API_KEY=your_openai_key_here
REPLICATE_API_KEY=your_replicate_key_here
FASHN_API_KEY=your_fashn_key_here

MAX_FILE_SIZE_MB=10
RATE_LIMIT_PER_MINUTE=10
```

> **To switch AI provider:** Change only `AI_PROVIDER` in `.env`. Zero code changes needed.

---

## API Reference

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "provider": "openai",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### Generate Models

```
POST /generate-models
Content-Type: multipart/form-data
```

**Request Fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `images` | File(s) | ✅ Yes | 1–4 clothing images (JPG/PNG/WEBP, max 10MB each) |
| `ageGroup` | string | ✅ Yes | `kid` \| `adult` \| `senior` |
| `gender` | string | ✅ Yes | `male` \| `female` |
| `backgroundColor` | string | No | Hex color e.g. `#FFFFFF` (default: `#FFFFFF`) |
| `modelStyle` | string | No | `ecommerce` \| `fashion` \| `luxury` \| `casual` \| `traditional` (default: `ecommerce`) |
| `pose` | string | No | `standing_front` \| `standing_angle` \| `walking` \| `crossed_arms` (default: `standing_front`) |
| `generations` | number | No | `1` \| `2` \| `4` \| `8` (default: `1`) |

**Success Response `200`:**
```json
{
  "success": true,
  "images": [
    { "url": "https://..." },
    { "url": "https://..." }
  ]
}
```

**Error Response `400 / 500`:**
```json
{
  "success": false,
  "message": "Something went wrong. Please try again."
}
```

---

## Middleware Flow

Every request to `POST /generate-models` passes through this chain:

```
Request
  │
  ▼
Rate Limiter          → 429 if over 10 req/min
  │
  ▼
Multer Upload         → 400 if wrong format / too large / too many files
  │
  ▼
Validate              → 400 if required fields missing or invalid values
  │
  ▼
Route Handler         → calls aiService.generateModels()
  │
  ▼
aiService             → loads correct provider from AI_PROVIDER
  │
  ▼
Provider (openai /    → calls AI API, returns image URLs
replicate / fashn)
  │
  ▼
Response              → { success: true, images: [...] }
```

---

## Provider Details

### OpenAI (GPT-image-1)
- **Model:** `gpt-image-1`
- **Output:** URL or base64 (handled automatically)
- **Generations:** Supports `n` param natively
- **Best for:** MVP, fast results, reliable uptime

### Replicate (IDM-VTON)
- **Model:** `cuuupid/idm-vton`
- **Output:** Direct URL
- **Generations:** Runs in parallel via `Promise.allSettled`
- **Best for:** Garment accuracy, try-on realism

### Fashn.ai
- **API:** REST with polling
- **Output:** Array of URLs after job completes
- **Polling:** Every 3s, max 30 attempts (90s timeout)
- **Best for:** Premium quality, fashion-specific tuning

---

## Prompt Construction

Prompt is built dynamically in `services/aiService.js` using the `buildPrompt()` function:

```
Create a photorealistic {ageGroup} {gender} fashion model.
Use all uploaded reference images to accurately recreate
the clothing, outfit details, textures, colors, patterns,
and styling.

Model Style: {modelStyle}
Pose: {pose}
Background: solid color {backgroundColor}

Requirements:
- Full body visible from head to toe
- Professional studio photography lighting
- Realistic human proportions
- Premium ecommerce catalogue quality
- High detail on fabric texture and clothing fit
- Photorealistic, not illustrated or artistic
- Clean background matching the specified color
```

---

## Error Messages

| Scenario | HTTP | Message |
|---|---|---|
| No image uploaded | 400 | At least one clothing image is required. |
| Wrong file format | 400 | Please upload JPG, PNG or WEBP only. |
| File too large | 400 | File size must be under 10MB |
| Too many files | 400 | Maximum 4 images allowed. |
| Invalid ageGroup | 400 | Invalid age group. Choose from: kid, adult, senior |
| Invalid gender | 400 | Invalid gender. Choose from: male, female |
| Invalid modelStyle | 400 | Invalid model style. Choose from: ... |
| Invalid pose | 400 | Invalid pose. Choose from: ... |
| Invalid hex color | 400 | Invalid background color. Use hex format like #FFFFFF |
| Rate limit hit | 429 | Too many requests. Please wait a minute and try again. |
| AI failure / timeout | 500 | Something went wrong. Please try again. |

---

## Security Rules

- OpenAI API key lives **only in `.env`** — never in React Native app
- All AI calls go **through Node.js backend only**
- Rate limiting: **10 requests per minute per IP**
- File validation before any AI call:
  - MIME type check (not just extension)
  - File size check (max 10MB)
  - File count check (max 4)
- `.env` is in `.gitignore` — never committed

---

## Deployment (Render)

1. Push code to GitHub (without `.env`)
2. Create new **Web Service** on Render
3. Set **Build Command:** `npm install`
4. Set **Start Command:** `npm start`
5. Add Environment Variables in Render dashboard (same as `.env`)
6. Deploy

> Free tier note: Render free tier spins down after 15 min of inactivity. First request may be slow (~30s cold start). Upgrade to paid for production use.

---

## Adding a New Provider

1. Create `backend/providers/yourprovider.js`
2. Export a `generate(prompt, imageBuffers, count)` function that returns `Array<{ url: string }>`
3. Add it to the `providers` map in `services/aiService.js`
4. Set `AI_PROVIDER=yourprovider` in `.env`

That's it. No other files change.