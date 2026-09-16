export interface MediaItem {
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
