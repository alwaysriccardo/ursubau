import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, LogOut, FolderOpen } from 'lucide-react';
import type { Portfolio, Project, MediaItem } from '../../portfolioTypes';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({ projects: [] });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectSubtitle, setNewProjectSubtitle] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadPortfolio();
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio/get');
      const data = await response.json();
      setPortfolio(data);
      if (data.projects.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0].id);
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/portfolio/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newProjectTitle,
          subtitle: newProjectSubtitle,
        }),
      });

      if (response.ok) {
        await loadPortfolio();
        setNewProjectTitle('');
        setNewProjectSubtitle('');
        setShowNewProjectForm(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedProject) return;

    const files = Array.from(e.target.files);
    setUploading(true);

    let successCount = 0;
    let failedFiles: string[] = [];

    try {
      const token = localStorage.getItem('admin_token');
      const project = portfolio.projects.find(p => p.id === selectedProject);
      
      if (!project) {
        throw new Error('Project not found');
      }

      for (const file of files) {
        try {
          console.log(`Uploading ${file.name}...`);
          
          // Step 1: Get presigned upload URL
          console.log('Step 1: Generating presigned URL...');
          const urlResponse = await fetch('/api/portfolio/generate-upload-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type,
              folderName: project.folderName,
            }),
          });

          if (!urlResponse.ok) {
            const error = await urlResponse.text();
            console.error('URL generation failed:', error);
            throw new Error('Failed to generate upload URL');
          }

          const { uploadUrl, publicUrl } = await urlResponse.json();
          console.log('Presigned URL generated:', uploadUrl.substring(0, 50) + '...');

          // Step 2: Upload directly to R2
          console.log('Step 2: Uploading to R2...');
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('R2 upload failed:', uploadResponse.status, errorText);
            throw new Error(`Failed to upload to R2 (Status: ${uploadResponse.status}). Check CORS settings!`);
          }

          console.log('R2 upload successful!');

          // Step 3: Update portfolio metadata
          console.log('Step 3: Updating metadata...');
          const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
          const metadataResponse = await fetch('/api/portfolio/add-media', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              projectId: selectedProject,
              publicUrl: publicUrl,
              mediaType: mediaType,
              caption: '',
            }),
          });

          if (!metadataResponse.ok) {
            const error = await metadataResponse.text();
            console.error('Metadata update failed:', error);
            throw new Error('Failed to update portfolio metadata');
          }

          console.log(`✅ ${file.name} uploaded successfully!`);
          successCount++;
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          failedFiles.push(file.name);
        }
      }

      if (successCount > 0) {
        await loadPortfolio();
        alert(`✅ Successfully uploaded ${successCount} file(s)!${failedFiles.length > 0 ? `\n\n❌ Failed: ${failedFiles.join(', ')}` : ''}`);
      } else {
        alert('❌ All uploads failed. Check console (F12) for details.\n\nMost common issue: CORS not configured on R2 bucket.');
      }
    } catch (error) {
      console.error('Upload process error:', error);
      alert('Upload failed: ' + (error as Error).message + '\n\nCheck browser console (F12) for details.');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const deleteMedia = async (mediaUrl: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/portfolio/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: selectedProject,
          mediaUrl,
        }),
      });

      if (response.ok) {
        await loadPortfolio();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this entire project?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/portfolio/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      if (response.ok) {
        setSelectedProject(null);
        await loadPortfolio();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const currentProject = portfolio.projects.find(p => p.id === selectedProject);

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Portfolio Admin</h1>
        <button onClick={onLogout} style={styles.logoutBtn}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      <div style={isMobile ? styles.contentMobile : styles.content}>
        {/* Projects Sidebar */}
        <aside style={isMobile ? styles.sidebarMobile : styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Projects</h2>
            <button onClick={() => setShowNewProjectForm(true)} style={styles.addBtn}>
              <Plus size={20} />
            </button>
          </div>

          {showNewProjectForm && (
            <div style={styles.newProjectForm}>
              <input
                type="text"
                placeholder="Project Title"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Subtitle (optional)"
                value={newProjectSubtitle}
                onChange={(e) => setNewProjectSubtitle(e.target.value)}
                style={styles.input}
              />
              <div style={styles.formButtons}>
                <button onClick={createProject} style={styles.saveBtn}>Create</button>
                <button onClick={() => setShowNewProjectForm(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </div>
          )}

          <div style={styles.projectsList}>
            {portfolio.projects.map((project) => (
              <div
                key={project.id}
                style={{
                  ...styles.projectItem,
                  ...(selectedProject === project.id ? styles.projectItemActive : {}),
                }}
                onClick={() => setSelectedProject(project.id)}
              >
                <FolderOpen size={18} />
                <div style={styles.projectInfo}>
                  <div style={styles.projectTitle}>{project.title}</div>
                  <div style={styles.projectSubtitle}>
                    {project.media.length} items
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  style={styles.deleteProjectBtn}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={isMobile ? styles.mainMobile : styles.main}>
          {currentProject ? (
            <>
              <div style={isMobile ? styles.mainHeaderMobile : styles.mainHeader}>
                <div style={isMobile ? {marginBottom: '16px', width: '100%'} : {}}>
                  <h2 style={isMobile ? styles.projectNameMobile : styles.projectName}>{currentProject.title}</h2>
                  {currentProject.subtitle && (
                    <p style={styles.projectDesc}>{currentProject.subtitle}</p>
                  )}
                </div>
                <label style={isMobile ? styles.uploadBtnMobile : styles.uploadBtn}>
                  <Upload size={20} />
                  <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    style={styles.fileInput}
                    disabled={uploading}
                  />
                </label>
              </div>

              <div style={isMobile ? styles.mediaGridMobile : styles.mediaGrid}>
                {currentProject.media.length === 0 ? (
                  <div style={styles.emptyState}>
                    <p>No media uploaded yet</p>
                    <p style={styles.emptyHint}>Click "Upload Media" to get started</p>
                  </div>
                ) : (
                  currentProject.media.map((media, index) => (
                    <div key={index} style={styles.mediaCard}>
                      {media.type === 'image' ? (
                        <img src={media.url} alt="" style={styles.mediaPreview} />
                      ) : (
                        <video src={media.url} style={styles.mediaPreview} controls />
                      )}
                      <button
                        onClick={() => deleteMedia(media.url)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div style={styles.noProjectSelected}>
              <p>Select a project or create a new one</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  header: {
    background: 'white',
    padding: '20px 40px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  content: {
    display: 'flex',
    height: 'calc(100vh - 81px)',
  },
  sidebar: {
    width: '300px',
    background: 'white',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  addBtn: {
    padding: '8px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newProjectForm: {
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  input: {
    padding: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
  },
  saveBtn: {
    flex: 1,
    padding: '8px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelBtn: {
    flex: 1,
    padding: '8px',
    background: '#9e9e9e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  projectsList: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  projectItem: {
    padding: '15px 20px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background 0.2s',
  },
  projectItemActive: {
    background: '#f0f7ff',
    borderLeft: '3px solid #2196F3',
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  projectSubtitle: {
    fontSize: '12px',
    color: '#666',
  },
  deleteProjectBtn: {
    padding: '6px',
    background: 'transparent',
    color: '#f44336',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto' as const,
  },
  mainHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
  },
  projectName: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  projectDesc: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  fileInput: {
    display: 'none',
  },
  mediaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  mediaCard: {
    position: 'relative' as const,
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  mediaPreview: {
    width: '100%',
    height: '250px',
    objectFit: 'cover' as const,
    display: 'block',
  },
  deleteBtn: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    padding: '8px',
    background: 'rgba(244, 67, 54, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#999',
  },
  emptyHint: {
    fontSize: '14px',
    marginTop: '10px',
  },
  noProjectSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    fontSize: '18px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '20px',
    color: '#666',
  },
  // Mobile styles
  contentMobile: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 'calc(100vh - 81px)',
  },
  sidebarMobile: {
    width: '100%',
    background: 'white',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column' as const,
    maxHeight: '40vh',
  },
  mainMobile: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto' as const,
  },
  mainHeaderMobile: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '20px',
  },
  projectNameMobile: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  uploadBtnMobile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    width: '100%',
  },
  mediaGridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
  },
};
