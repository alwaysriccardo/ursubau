import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFromR2 } from '../utils/r2Client.js';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch portfolio.json from R2
    const portfolioData = await getFromR2('portfolio.json');
    
    if (!portfolioData) {
      // Return empty portfolio if file doesn't exist yet
      return res.status(200).json({ projects: [] });
    }

    // Convert stream to string
    const dataString = await streamToString(portfolioData);
    const portfolio = JSON.parse(dataString);

    return res.status(200).json(portfolio);
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    
    // If file doesn't exist, return empty portfolio
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
      return res.status(200).json({ projects: [] });
    }
    
    return res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
}

async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
