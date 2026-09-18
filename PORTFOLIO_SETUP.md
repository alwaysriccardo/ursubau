# Portfolio Setup (Ursu Bau GmbH)

The portfolio section and the admin panel at `/admin` store images/videos in an
S3-compatible cloud bucket. The code works with **Backblaze B2** (free, no credit card)
or **Cloudflare R2** (free tier, but requires a payment method on the account).
The environment variables keep the `R2_` prefix for both providers.

Never commit keys or passwords to this repository — set them only in Vercel.

---

## Option A – Backblaze B2, private bucket (free 10 GB, no credit card)

A **private** bucket is free without card verification (public buckets require a $1 card
check). The site reads media through temporary signed links, so private works fine:
leave `R2_PUBLIC_URL` unset and the API signs every media URL on the fly (valid 24h).

1. Sign up at https://www.backblaze.com/sign-up/cloud-storage, pick a European region
   (it cannot be changed later) and verify your email.
2. **Buckets → Create a Bucket**
   - Name: `ursubau-portfolio` (globally unique – add a suffix if taken)
   - Files in bucket: **Private**
   - Encryption / Object Lock: off
3. Note the **Endpoint** on the bucket card, e.g. `s3.eu-central-003.backblazeb2.com`.
4. **Bucket Settings → CORS Rules** → share with all HTTPS origins, for both the B2 and
   S3 APIs. If uploads fail with a CORS error, set the rules with the B2 CLI
   (`pip install b2`, then `b2 account authorize`):
   ```bash
   b2 bucket update --cors-rules '[{"corsRuleName":"uploads","allowedOrigins":["*"],"allowedHeaders":["*"],"allowedOperations":["s3_get","s3_head","s3_put"],"exposeHeaders":["ETag"],"maxAgeSeconds":3600}]' ursubau-portfolio allPrivate
   ```
5. **Application Keys → Add a New Application Key**: name `ursubau-website`, access only
   `ursubau-portfolio`, type **Read and Write**. Copy `keyID` and `applicationKey` now.

| Variable | Value |
|---|---|
| `R2_ENDPOINT` | `https://s3.eu-central-003.backblazeb2.com` (your endpoint) |
| `R2_BUCKET_NAME` | `ursubau-portfolio` |
| `R2_ACCESS_KEY_ID` | the `keyID` |
| `R2_SECRET_ACCESS_KEY` | the `applicationKey` |
| `R2_PUBLIC_URL` | **do not set** (private bucket → signed links) |

## Option B – Cloudflare R2 (if an account with a payment method already exists)

1. Cloudflare dashboard → **R2 → Create bucket** → `ursubau-portfolio`.
2. Bucket → **Settings → Public access → R2.dev subdomain → Allow**. Copy the `https://pub-….r2.dev` URL.
3. Bucket → **Settings → CORS policy**:
   ```json
   [{ "AllowedOrigins": ["*"], "AllowedMethods": ["GET", "PUT", "HEAD"], "AllowedHeaders": ["*"], "ExposeHeaders": ["ETag"], "MaxAgeSeconds": 3600 }]
   ```
4. **R2 → Manage API Tokens → Create API token** → Object Read & Write, only this bucket.

| Variable | Value |
|---|---|
| `R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_BUCKET_NAME` | `ursubau-portfolio` |
| `R2_ACCESS_KEY_ID` | token Access Key ID |
| `R2_SECRET_ACCESS_KEY` | token Secret Access Key |
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` (public bucket only) |

---

## Vercel

1. https://vercel.com/new → import the GitHub repo `alwaysriccardo/ursubau` (framework: Vite).
2. **Settings → Environment Variables** (all environments) – the storage variables above plus:

| Variable | Value |
|---|---|
| `ADMIN_USERNAME` | `ursubaugmbh` |
| `ADMIN_PASSWORD` | the admin password |
| `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |

3. **Deployments → ⋯ → Redeploy** so the variables take effect.

## Using the admin panel

1. Open `https://<your-domain>/admin` and log in.
2. Click `+` to create a project (title + optional subtitle).
3. Select the project → **Upload Media** → choose images/videos.
4. The first image becomes the cover. Projects appear in the "Portfolio" section of the homepage.

## Upload limits

- No limit imposed by the site: files go browser → bucket directly (Vercel's 4.5 MB
  request limit does not apply).
- Single file: up to 5 GB (S3 single-part upload limit).
- Upload window: the upload link is valid 1 hour; the transfer must finish within it.
- Free plan: 10 GB stored in total, and free downloads up to 3x stored volume per month.
- Practical advice: resize photos to ~1600px (<300 KB) and keep videos under ~100 MB,
  or link them from TikTok/YouTube instead of hosting them here.
