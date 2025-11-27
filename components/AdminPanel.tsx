import React, { useState } from 'react';
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
  ArrowLeft
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
  
  // Form State
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    title: '',
    description: '',
    genres: [],
    year: 2024,
    duration: '',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Default for demo
  });

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    const movie: Movie = {
      id: Date.now().toString(),
      title: newMovie.title || 'Untitled',
      description: newMovie.description || '',
      posterUrl: `https://picsum.photos/300/450?random=${Date.now()}`,
      bannerUrl: `https://picsum.photos/1200/600?random=${Date.now()}`,
      videoUrl: newMovie.videoUrl || '',
      duration: newMovie.duration || '2h',
      year: newMovie.year || 2024,
      rating: 'PG',
      genres: newMovie.genres || ['Drama'],
      views: 0
    };
    onAddMovie(movie);
    setIsModalOpen(false);
    setNewMovie({ title: '', description: '', genres: [], year: 2024, duration: '' });
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
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center transition-colors"
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
                        <img src={movie.posterUrl} className="w-8 h-12 object-cover rounded mr-3" alt="" />
                        {movie.title}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{movie.genres.join(', ')}</td>
                      <td className="px-6 py-4 text-gray-300">{movie.year}</td>
                      <td className="px-6 py-4 text-gray-300">{movie.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right space-x-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-muted w-full max-w-lg rounded-xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add New Movie</h3>
            <form onSubmit={handleAddMovie} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-muted border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                  value={newMovie.title}
                  onChange={e => setNewMovie({...newMovie, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                  <input 
                    type="number" 
                    className="w-full bg-muted border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                    value={newMovie.year}
                    onChange={e => setNewMovie({...newMovie, year: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2h 15m"
                    className="w-full bg-muted border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                    value={newMovie.duration}
                    onChange={e => setNewMovie({...newMovie, duration: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Genres (comma separated)</label>
                <input 
                  type="text" 
                  className="w-full bg-muted border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                  placeholder="Action, Drama"
                  onChange={e => setNewMovie({...newMovie, genres: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea 
                  rows={3}
                  className="w-full bg-muted border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                  value={newMovie.description}
                  onChange={e => setNewMovie({...newMovie, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                  Upload Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};