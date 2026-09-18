import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyToken, extractToken } from '../utils/auth.js';
import { nanoid } from 'nanoid';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = extractToken(req.headers.authorization as string);
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fileName, contentType, folderName } = req.body;

    if (!fileName || !contentType || !folderName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${nanoid(10)}.${fileExtension}`;
    const filePath = `projects/${folderName}/${uniqueFileName}`;

    // Generate presigned URL for upload (valid for 10 minutes)
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });

    // Only meaningful for a public bucket; private buckets are read through signed links
    const publicUrl = process.env.R2_PUBLIC_URL ? `${process.env.R2_PUBLIC_URL}/${filePath}` : '';

    return res.status(200).json({
      success: true,
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      filePath: filePath,
    });
  } catch (error) {
    console.error('Generate upload URL error:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}
