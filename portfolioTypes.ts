export interface MediaItem {
  key?: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  folderName: string;
  coverImage: string;
  coverKey?: string;
  media: MediaItem[];
  order: number;
  createdAt: string;
}

export interface Portfolio {
  projects: Project[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  username: string;
}
