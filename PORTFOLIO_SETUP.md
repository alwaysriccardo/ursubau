# Portfolio Setup (Ursu Bau GmbH)

The portfolio section and the admin panel at `/admin` store images/videos in an
S3-compatible cloud bucket. The code works with **Backblaze B2** (free, no credit card)
or **Cloudflare R2** (free tier, but requires a payment method on the account).
The environment variables keep the `R2_` prefix for both providers.

Never commit keys or passwords to this repository — set them only in Vercel.

---

## Option A – Backblaze B2 (free 10 GB, no credit card)

1. Sign up at https://www.backblaze.com/sign-up/cloud-storage
   - Pick the **EU Central** region during sign-up (it cannot be changed later).
   - Verify your email address (needed before a bucket can be public).
2. **Buckets → Create a Bucket**
   - Name: `ursubau-portfolio` (must be globally unique – add a suffix if taken)
   - Files in bucket: **Public**
   - Encryption / Object Lock: leave off
3. Note the **Endpoint** shown on the bucket card, e.g. `s3.eu-central-003.backblazeb2.com`.
4. **Bucket Settings → CORS Rules** → "Share everything in this bucket with all HTTPS origins",
   apply to **both** B2 Native API and S3 Compatible API. Save.
   If uploads later fail with a CORS error, set the rules with the B2 CLI instead
   (`pip install b2`, then `b2 account authorize`):
   ```bash
   b2 bucket update --cors-rules '[{"corsRuleName":"uploads","allowedOrigins":["*"],"allowedHeaders":["*"],"allowedOperations":["s3_get","s3_head","s3_put"],"exposeHeaders":["ETag"],"maxAgeSeconds":3600}]' ursubau-portfolio allPublic
   ```
5. **Application Keys → Add a New Application Key**
   - Name: `ursubau-website`, Access: only `ursubau-portfolio`, Type: **Read and Write**
   - Copy `keyID` and `applicationKey` immediately (the key is shown only once).

Vercel values for B2 (replace the endpoint with yours):

| Variable | Value |
|---|---|
| `R2_ENDPOINT` | `https://s3.eu-central-003.backblazeb2.com` |
| `R2_BUCKET_NAME` | `ursubau-portfolio` |
| `R2_ACCESS_KEY_ID` | the `keyID` |
| `R2_SECRET_ACCESS_KEY` | the `applicationKey` |
| `R2_PUBLIC_URL` | `https://ursubau-portfolio.s3.eu-central-003.backblazeb2.com` |

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
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` |

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
