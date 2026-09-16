import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFromR2, uploadToR2 } from '../utils/r2Client.js';
import { verifyToken, extractToken } from '../utils/auth.js';
import { nanoid } from 'nanoid';

// Vercel has a 4.5MB request limit, so we'll handle file uploads via multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse multipart form data
    const formData = await parseFormData(req);
    const { projectId, file, fileName, contentType, caption } = formData;

    if (!projectId || !file || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch existing portfolio
    const portfolioData = await getFromR2('portfolio.json');
    if (!portfolioData) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const dataString = await streamToString(portfolioData);
    const portfolio = JSON.parse(dataString);

    // Find the project
    const project = portfolio.projects.find((p: any) => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${nanoid(10)}.${fileExtension}`;
    const filePath = `projects/${project.folderName}/${uniqueFileName}`;

    // Determine media type
    const mediaType = contentType?.startsWith('video/') ? 'video' : 'image';

    // Upload file to R2
    const fileUrl = await uploadToR2(filePath, file, contentType || 'application/octet-stream');

    // Add media to project
    const newMedia = {
      url: fileUrl,
      type: mediaType,
      caption: caption || '',
      uploadedAt: new Date().toISOString(),
    };

    project.media.push(newMedia);

    // Set cover image if this is the first media item
    if (!project.coverImage && mediaType === 'image') {
      project.coverImage = fileUrl;
    }

    // Save updated portfolio.json
    await uploadToR2(
      'portfolio.json',
      Buffer.from(JSON.stringify(portfolio, null, 2)),
      'application/json'
    );

    return res.status(200).json({
      success: true,
      media: newMedia,
      fileUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}

async function parseFormData(req: VercelRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const body = JSON.parse(buffer.toString());
        
        // Decode base64 file
        const fileBuffer = Buffer.from(body.file, 'base64');
        
        resolve({
          projectId: body.projectId,
          file: fileBuffer,
          fileName: body.fileName,
          contentType: body.contentType,
          caption: body.caption,
        });
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
