import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  // Only add checksums when required, so presigned uploads work with R2 and Backblaze B2
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (key: string, body: Buffer, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  
  await r2Client.send(command);
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

export const getFromR2 = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  
  const response = await r2Client.send(command);
  return response.Body;
};

// Public URL when the bucket is public, otherwise a temporary signed link (private bucket)
export const buildMediaUrl = async (key: string, expiresIn = 172800): Promise<string> => {
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  // Anchor the signature to the start of the current day so every visitor gets the
  // identical URL for 24h and the browser cache actually hits (a fresh signature per
  // request would re-download every image on every visit). Valid for 48h from then.
  const signingDate = new Date();
  signingDate.setUTCHours(0, 0, 0, 0);
  return getSignedUrl(r2Client, command, { expiresIn, signingDate });
};

export const deleteFromR2 = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  
  await r2Client.send(command);
};

export default r2Client;
