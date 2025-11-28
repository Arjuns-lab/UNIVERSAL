import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Users, 
  Film, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit,
  LogOut,
  Image as ImageIcon,
  FileVideo,
  CloudUpload,
  X,
  Play
} from 'lucide-react';
import { Movie, AnalyticsData } from '../types';

interface AdminPanelProps {
  movies: Movie[];
  analytics: AnalyticsData[];
  onAddMovie: (movie: Movie) => void;
  onDeleteMovie: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ movies, analytics, onAddMovie, onDeleteMovie }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File Refs
  const posterInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    title: '',
    description: '',
    genres: [],
    year: 2024,
    duration: '',
    videoUrl: '', 
    posterUrl: '',
    bannerUrl: ''
  });

  // Previews
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'banner' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);

    if (type === 'poster') {
      setPosterPreview(objectUrl);
      setNewMovie(prev => ({ ...prev, posterUrl: objectUrl }));
    } else if (type === 'banner') {
      setBannerPreview(objectUrl);
      setNewMovie(prev => ({ ...prev, bannerUrl: objectUrl }));
    } else if (type === 'video') {
      setVideoName(file.name);
      setVideoSize(formatFileSize(file.size));
      setVideoPreview(objectUrl);
      setNewMovie(prev => ({ ...prev, videoUrl: objectUrl }));
    }
  };

  const clearFile = (type: 'poster' | 'banner' | 'video') => {
    if (type === 'poster') {
        setPosterPreview(null);
        setNewMovie(prev => ({ ...prev, posterUrl: '' }));
        if (posterInputRef.current) posterInputRef.current.value = '';
    } else if (type === 'banner') {
        setBannerPreview(null);
        setNewMovie(prev => ({ ...prev, bannerUrl: '' }));
        if (bannerInputRef.current) bannerInputRef.current.value = '';
    } else if (type === 'video') {
        setVideoPreview(null);
        setVideoName(null);
        setVideoSize(null);
        setNewMovie(prev => ({ ...prev, videoUrl: '' }));
        if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setNewMovie({ title: '', description: '', genres: [], year: 2024, duration: '', videoUrl: '', posterUrl: '', bannerUrl: '' });
    setPosterPreview(null);
    setBannerPreview(null);
    setVideoPreview(null);
    setVideoName(null);
    setVideoSize(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (posterInputRef.current) posterInputRef.current.value = '';
    if (bannerInputRef.current) bannerInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate Upload Process
    setIsUploading(true);
    
    // Determine simulation speed based on file size
    const file = videoInputRef.current?.files?.[0];
    const fileSizeMB = file ? file.size / (1024 * 1024) : 50; 
    
    const uploadSpeedMBps = 50;
    const estimatedSeconds = Math.max(1, fileSizeMB / uploadSpeedMBps);
    const tickRateMs = 100;
    const totalTicks = (estimatedSeconds * 1000) / tickRateMs;
    const progressPerTick = 100 / totalTicks;

    let progress = 0;
    const interval = setInterval(() => {
      progress += progressPerTick;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          const movie: Movie = {
            id: Date.now().toString(),
            title: newMovie.title || 'Untitled',
            description: newMovie.description || '',
            posterUrl: newMovie.posterUrl || `https://picsum.photos/300/450?random=${Date.now()}`,
            bannerUrl: newMovie.bannerUrl || `https://picsum.photos/1200/600?random=${Date.now()}`,
            videoUrl: newMovie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: newMovie.duration || '2h',
            year: newMovie.year || 2024,
            rating: 'PG',
            genres: newMovie.genres || ['Drama'],
            views: 0
          };
          onAddMovie(movie);
          setIsModalOpen(false);
          resetForm();
        }, 500);
      }
      setUploadProgress(Math.min(progress, 100));
    }, tickRateMs);
  };

  // Helper to detect if a file is likely to be problematic in a raw video tag
  const isPlaybackRisky = (filename: string | null) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'mkv' || ext === 'ts' || ext === 'm2ts';
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-muted hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tighter">ADMIN PANEL</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-white'}`}
          >
            <TrendingUp size={18} className="mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('movies')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'movies' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-white'}`}
          >
            <Film size={18} className="mr-3" />
            Movies
          </button>
          <button className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-white transition-colors">
            <Users size={18} className="mr-3" />
            Users
          </button>
        </nav>
        
        <div className="p-4 border-t border-muted">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            Exit Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-6">Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Views', val: '2.4M', icon: TrendingUp, color: 'text-blue-500' },
                { label: 'Active Users', val: '45.2k', icon: Users, color: 'text-green-500' },
                { label: 'Total Movies', val: movies.length, icon: Film, color: 'text-purple-500' },
                { label: 'Revenue', val: '$124k', icon: DollarSign, color: 'text-yellow-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-muted p-6 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-white mt-2">{stat.val}</h3>
                    </div>
                    <stat.icon className={`${stat.color}`} size={24} />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-muted p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-6">User Growth</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }}
                      />
                      <Line type="monotone" dataKey="users" stroke="#e50914" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-muted p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-6">Views Analysis</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#171717', border: '1px solid #333' }}
                      />
                      <Bar dataKey="views" fill="#e50914" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'movies' && (
          <div>
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">Movie Management</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-lg shadow-red-900/20"
              >
                <Plus size={20} className="mr-2" />
                Add Movie
              </button>
            </div>

            <div className="bg-card border border-muted rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Genre</th>
                    <th className="px-6 py-4">Year</th>
                    <th className="px-6 py-4">Views</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center">
                        <img src={movie.posterUrl} className="w-8 h-12 object-cover rounded mr-3 bg-gray-800" alt="" />
                        {movie.title}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{movie.genres.join(', ')}</td>
                      <td className="px-6 py-4 text-gray-300">{movie.year}</td>
                      <td className="px-6 py-4 text-gray-300">{movie.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                           onClick={() => navigate(`/watch/${movie.id}`)}
                           className="text-green-400 hover:text-green-300 p-1" 
                           title="Play Movie"
                        >
                           <Play size={18} />
                        </button>
                        <button className="text-blue-400 hover:text-blue-300 p-1"><Edit size={18} /></button>
                        <button 
                          onClick={() => onDeleteMovie(movie.id)}
                          className="text-red-500 hover:text-red-400 p-1"
                        ><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-muted w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-muted flex justify-between items-center bg-muted/20">
              <h3 className="text-2xl font-bold text-white">Upload New Movie</h3>
              <button 
                 onClick={() => { setIsModalOpen(false); resetForm(); }}
                 className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddMovie} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Inception"
                      className="w-full bg-muted/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                      value={newMovie.title}
                      onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                      <input 
                        type="number" 
                        className="w-full bg-muted/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                        value={newMovie.year}
                        onChange={e => setNewMovie({...newMovie, year: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2h 15m"
                        className="w-full bg-muted/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                        value={newMovie.duration}
                        onChange={e => setNewMovie({...newMovie, duration: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Genres (comma separated)</label>
                    <input 
                      type="text" 
                      className="w-full bg-muted/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                      placeholder="Action, Sci-Fi, Thriller"
                      onChange={e => setNewMovie({...newMovie, genres: e.target.value.split(',').map(s => s.trim())})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea 
                      rows={5}
                      className="w-full bg-muted/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Enter movie plot..."
                      value={newMovie.description}
                      onChange={e => setNewMovie({...newMovie, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Right Column: Media */}
                <div className="space-y-6">
                  
                  {/* Poster Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Poster Image</label>
                    <div 
                      onClick={() => !posterPreview && posterInputRef.current?.click()}
                      className={`border-2 border-dashed ${posterPreview ? 'border-primary' : 'border-gray-700 hover:border-primary hover:bg-muted/30'} rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center h-48 relative overflow-hidden group`}
                    >
                      {posterPreview ? (
                        <>
                          <img src={posterPreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearFile('poster'); }}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-10"
                            title="Remove Poster"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto text-gray-500 group-hover:text-primary mb-2" size={32} />
                          <p className="text-sm text-gray-400">Click to upload poster</p>
                          <p className="text-xs text-gray-600 mt-1">Recommended 2:3 ratio</p>
                        </div>
                      )}
                      <input type="file" ref={posterInputRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'poster')} />
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Banner Image</label>
                    <div 
                      onClick={() => !bannerPreview && bannerInputRef.current?.click()}
                      className={`border-2 border-dashed ${bannerPreview ? 'border-primary' : 'border-gray-700 hover:border-primary hover:bg-muted/30'} rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center h-32 relative overflow-hidden group`}
                    >
                      {bannerPreview ? (
                        <>
                          <img src={bannerPreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearFile('banner'); }}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors z-10"
                            title="Remove Banner"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="mx-auto text-gray-500 group-hover:text-primary mb-2" size={32} />
                          <p className="text-sm text-gray-400">Click to upload banner</p>
                        </div>
                      )}
                       <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'banner')} />
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Video Source</label>
                    <div className="bg-muted/30 border border-gray-700 rounded-lg p-4">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3 overflow-hidden">
                             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <FileVideo size={20} />
                             </div>
                             <div className="flex-1 truncate">
                                <p className="text-sm font-medium text-white truncate">{videoName || "No video selected"}</p>
                                <p className="text-xs text-gray-500 flex items-center">
                                  {videoSize ? (
                                    <span className="text-green-400">{videoSize}</span>
                                  ) : "MP4, MKV, WebM, TS (No Size Limit)"}
                                </p>
                             </div>
                          </div>
                          
                          {videoName ? (
                             <button 
                               type="button"
                               onClick={() => clearFile('video')}
                               className="text-gray-400 hover:text-red-500 transition-colors p-1"
                               title="Remove Video"
                             >
                               <Trash2 size={18} />
                             </button>
                          ) : (
                             <button 
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className="text-xs bg-muted hover:bg-gray-700 text-white px-3 py-1.5 rounded-md transition-colors"
                              >
                                Select File
                              </button>
                          )}
                       </div>
                       <input 
                        type="file" 
                        ref={videoInputRef} 
                        hidden 
                        accept="video/mp4,video/x-m4v,video/x-matroska,.mkv,video/webm,.ts,.m2ts,.mov,video/*" 
                        onChange={e => handleFileChange(e, 'video')} 
                       />
                       
                       {/* Video Preview */}
                       {videoPreview && (
                         <div className="mt-3 rounded-lg overflow-hidden bg-black border border-gray-800 relative">
                           {isPlaybackRisky(videoName) ? (
                              <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
                                <FileVideo size={32} className="mb-2" />
                                <p className="text-xs">Preview unavailable for this format.</p>
                                <p className="text-[10px] text-gray-600">File will upload correctly.</p>
                              </div>
                           ) : (
                             <video 
                               src={videoPreview} 
                               controls 
                               className="w-full h-32 object-contain"
                             />
                           )}
                         </div>
                       )}

                       {/* Upload Fallback URL */}
                       <div className="relative mt-2">
                          <input 
                            type="text" 
                            placeholder="Or paste video URL"
                            className={`w-full bg-black/20 border border-gray-700 rounded-md py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:border-primary ${videoName ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={!videoName ? newMovie.videoUrl : ''}
                            disabled={!!videoName}
                            onChange={e => setNewMovie({...newMovie, videoUrl: e.target.value})}
                          />
                       </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Upload Progress Overlay */}
              {isUploading && (
                <div className="mt-6 bg-muted/50 rounded-lg p-4 border border-gray-700">
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300 flex items-center"><CloudUpload size={16} className="mr-2" /> Uploading assets...</span>
                      <span className="text-primary font-bold">{Math.round(uploadProgress)}%</span>
                   </div>
                   <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                   </div>
                   <div className="mt-2 text-xs text-gray-500 text-center">
                     Do not close this window until the upload is complete.
                   </div>
                </div>
              )}

              {/* Actions */}
              {!isUploading && (
                <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-muted">
                  <button 
                    type="button"
                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                    className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newMovie.title}
                    className="px-6 py-2.5 text-sm font-bold bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Upload Movie
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};