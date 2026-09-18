/**
 * Sets the CORS rules a browser upload needs on the media bucket.
 * Uses the B2 native API (the S3 interface refuses buckets that already
 * carry native CORS rules).
 *
 *   B2_KEY_ID=... B2_APP_KEY=... node scripts/b2-cors.mjs
 *
 * Optional: B2_BUCKET (default ursubau-portfolio).
 *
 * Changing bucket settings needs a key with the writeBuckets capability — a key
 * restricted to one bucket usually lacks it. If that is the case, use the account's
 * master application key, or create a key with access to "All" buckets.
 */
const keyId = process.env.B2_KEY_ID;
const appKey = process.env.B2_APP_KEY;
const bucketName = process.env.B2_BUCKET || 'ursubau-portfolio';

if (!keyId || !appKey) {
  console.error('Missing B2_KEY_ID / B2_APP_KEY.\nUsage: B2_KEY_ID=... B2_APP_KEY=... node scripts/b2-cors.mjs');
  process.exit(1);
}

const corsRules = [
  {
    corsRuleName: 'browserUploads',
    allowedOrigins: ['*'],
    allowedOperations: ['s3_get', 's3_head', 's3_put'],
    allowedHeaders: ['*'],
    exposeHeaders: ['etag'],
    maxAgeSeconds: 3600,
  },
];

const fail = (message, hint) => {
  console.error(`Failed: ${message}`);
  if (hint) console.error(`\n${hint}`);
  process.exit(1);
};

// 1. Authorize
const auth = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
  headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${appKey}`).toString('base64')}` },
});
if (!auth.ok) fail(`authorize returned ${auth.status} – ${await auth.text()}`, 'Check that the key ID and application key are correct.');
const { authorizationToken, apiInfo, accountId } = await auth.json();
const apiUrl = apiInfo.storageApi.apiUrl;
const capabilities = apiInfo.storageApi.capabilities || [];

if (!capabilities.includes('writeBuckets')) {
  fail(
    `this key cannot change bucket settings (capabilities: ${capabilities.join(', ')})`,
    'Use the account master application key, or create one with access to "All" buckets:\n' +
    'Backblaze → Application Keys → Add a New Application Key, leave the bucket selector on All.'
  );
}

// 2. Find the bucket
const list = await fetch(`${apiUrl}/b2api/v3/b2_list_buckets`, {
  method: 'POST',
  headers: { Authorization: authorizationToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({ accountId, bucketName }),
});
if (!list.ok) fail(`list_buckets returned ${list.status} – ${await list.text()}`);
const bucket = (await list.json()).buckets?.[0];
if (!bucket) fail(`no bucket named "${bucketName}" on this account`, 'Pass the right name via B2_BUCKET=...');

// 3. Apply the rules
const update = await fetch(`${apiUrl}/b2api/v3/b2_update_bucket`, {
  method: 'POST',
  headers: { Authorization: authorizationToken, 'Content-Type': 'application/json' },
  body: JSON.stringify({ accountId, bucketId: bucket.bucketId, corsRules }),
});
if (!update.ok) fail(`update_bucket returned ${update.status} – ${await update.text()}`);

console.log(`CORS rules applied to ${bucketName}:`);
console.log(JSON.stringify((await update.json()).corsRules, null, 2));
console.log('\nBucket uploads from the browser are now allowed. Retry the upload in /admin.');
