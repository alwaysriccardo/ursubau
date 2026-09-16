import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFromR2, uploadToR2 } from '../utils/r2Client.js';
import { verifyToken, extractToken } from '../utils/auth.js';
import { nanoid } from 'nanoid';

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

    const { title, subtitle } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    // Generate project ID
    const projectId = `proj_${nanoid(10)}`;
    const folderName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Fetch existing portfolio
    let portfolio: any = { projects: [] };
    try {
      const portfolioData = await getFromR2('portfolio.json');
      if (portfolioData) {
        const dataString = await streamToString(portfolioData);
        portfolio = JSON.parse(dataString);
      }
    } catch (error: any) {
      // File doesn't exist yet, use empty portfolio
      console.log('Creating new portfolio.json');
    }

    // Create new project
    const newProject = {
      id: projectId,
      title,
      subtitle: subtitle || '',
      folderName,
      coverImage: '',
      media: [],
      order: portfolio.projects.length,
      createdAt: new Date().toISOString(),
    };

    // Add to portfolio
    portfolio.projects.push(newProject);

    // Save updated portfolio.json
    await uploadToR2(
      'portfolio.json',
      Buffer.from(JSON.stringify(portfolio, null, 2)),
      'application/json'
    );

    return res.status(200).json({
      success: true,
      project: newProject,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
