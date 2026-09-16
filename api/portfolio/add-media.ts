import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFromR2, uploadToR2 } from '../utils/r2Client.js';
import { verifyToken, extractToken } from '../utils/auth.js';

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

    const { projectId, publicUrl, mediaType, caption } = req.body;

    if (!projectId || !publicUrl || !mediaType) {
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

    // Add media to project
    const newMedia = {
      url: publicUrl,
      type: mediaType,
      caption: caption || '',
      uploadedAt: new Date().toISOString(),
    };

    project.media.push(newMedia);

    // Set cover image if this is the first media item
    if (!project.coverImage && mediaType === 'image') {
      project.coverImage = publicUrl;
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
    });
  } catch (error) {
    console.error('Add media error:', error);
    return res.status(500).json({ error: 'Failed to add media' });
  }
}

async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
