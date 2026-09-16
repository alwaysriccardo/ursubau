import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFromR2, uploadToR2, deleteFromR2 } from '../utils/r2Client.js';
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

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = extractToken(req.headers.authorization as string);
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { projectId, mediaUrl } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Fetch existing portfolio
    const portfolioData = await getFromR2('portfolio.json');
    if (!portfolioData) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const dataString = await streamToString(portfolioData);
    const portfolio = JSON.parse(dataString);

    // Find the project
    const projectIndex = portfolio.projects.findIndex((p: any) => p.id === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = portfolio.projects[projectIndex];

    if (mediaUrl) {
      // Delete specific media item
      const mediaIndex = project.media.findIndex((m: any) => m.url === mediaUrl);
      if (mediaIndex === -1) {
        return res.status(404).json({ error: 'Media not found' });
      }

      // Extract file path from URL and delete from R2
      const urlPath = keyFromUrl(mediaUrl);
      await deleteFromR2(urlPath);

      // Remove from project media array
      project.media.splice(mediaIndex, 1);

      // Update cover image if we deleted it
      if (project.coverImage === mediaUrl) {
        project.coverImage = project.media.find((m: any) => m.type === 'image')?.url || '';
      }
    } else {
      // Delete entire project
      // Delete all media files from R2
      for (const media of project.media) {
        const urlPath = keyFromUrl(media.url);
        try {
          await deleteFromR2(urlPath);
        } catch (error) {
          console.error('Error deleting media:', error);
        }
      }

      // Remove project from array
      portfolio.projects.splice(projectIndex, 1);

      // Reorder remaining projects
      portfolio.projects.forEach((p: any, index: number) => {
        p.order = index;
      });
    }

    // Save updated portfolio.json
    await uploadToR2(
      'portfolio.json',
      Buffer.from(JSON.stringify(portfolio, null, 2)),
      'application/json'
    );

    return res.status(200).json({
      success: true,
      message: mediaUrl ? 'Media deleted successfully' : 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete' });
  }
}

// Strip the public bucket URL prefix to get the object key
function keyFromUrl(url: string): string {
  const prefix = `${process.env.R2_PUBLIC_URL}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : new URL(url).pathname.substring(1);
}

async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}
