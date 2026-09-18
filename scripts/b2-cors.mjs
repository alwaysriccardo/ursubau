/**
 * Sets the CORS rules a browser upload needs on the media bucket.
 * Run once, after creating the bucket:
 *
 *   B2_KEY_ID=... B2_APP_KEY=... node scripts/b2-cors.mjs
 *
 * Optional overrides: B2_BUCKET (default ursubau-portfolio),
 * B2_ENDPOINT (default https://s3.us-east-005.backblazeb2.com).
 */
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

const keyId = process.env.B2_KEY_ID;
const appKey = process.env.B2_APP_KEY;
const Bucket = process.env.B2_BUCKET || 'ursubau-portfolio';
const endpoint = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';

if (!keyId || !appKey) {
  console.error('Missing B2_KEY_ID / B2_APP_KEY.\nUsage: B2_KEY_ID=... B2_APP_KEY=... node scripts/b2-cors.mjs');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId: keyId, secretAccessKey: appKey },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const CORSRules = [
  {
    AllowedOrigins: ['*'],
    AllowedMethods: ['GET', 'PUT', 'HEAD'],
    AllowedHeaders: ['*'],
    ExposeHeaders: ['ETag'],
    MaxAgeSeconds: 3600,
  },
];

try {
  await client.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: { CORSRules } }));
  const check = await client.send(new GetBucketCorsCommand({ Bucket }));
  console.log(`CORS rules applied to ${Bucket}:`);
  console.log(JSON.stringify(check.CORSRules, null, 2));
} catch (error) {
  console.error(`Failed: ${error.name} – ${error.message}`);
  if (String(error.name).match(/AccessDenied|Unauthorized|InvalidAccessKeyId/i)) {
    console.error(
      '\nThe application key is probably not allowed to change bucket settings.\n' +
      'Create a key with access to ALL buckets (Application Keys → Add a New Application Key,\n' +
      'leave the bucket selector on "All"), then run this again with that key.'
    );
  }
  process.exit(1);
}
