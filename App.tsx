
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import { MOCK_MOVIES, MOCK_ANALYTICS } from './constants';
import { Movie, User, ViewMode } from './types';
import { 
  Play, 
  Info, 
  Search, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Bot,
  X,
  ArrowLeft,
  Trash2,
  WifiOff
} from './components/ui/Icons';
import { VideoPlayer } from './components/VideoPlayer';
import { AdminPanel } from './components/AdminPanel';
import { getMovieRecommendation } from './services/geminiService';
import { getDownloadedVideos, removeDownloadedVideo, getVideoFromCache } from './services/downloadService';

// --- Sub-Components defined here to simplify file structure for the prompt ---

const MovieCard: React.FC<{ movie: Movie; onClick: () => void }> = ({ movie, onClick }) => (
  <div 
    onClick={onClick}
    className="group relative h-40 min-w-[280px] cursor-pointer transition duration-200 ease-out md:h-52 md:min-w-[360px] md:hover:scale-105"
  >
    <img
      src={movie.bannerUrl}
      className="rounded-sm object-cover md:rounded w-full h-full"
      alt={movie.title}
    />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <h3 className="text-sm font-bold md:text-lg">{movie.title}</h3>
      <p className="text-[10px] text-green-400">{movie.rating} • {movie.duration}</p>
      <div className="mt-2 flex space-x-2">
        <button className="rounded-full bg-white p-1 hover:bg-gray-200">
          <Play size={12} className="text-black" fill="black" />
        </button>
        <button className="rounded-full border border-gray-400 p-1 hover:bg-gray-800">
          <Info size={12} className="text-white" />
        </button>
      </div>
    </div>
  </div>
);

const MovieRow: React.FC<{ title: string; movies: Movie[]; onMovieClick: (m: Movie) => void }> = ({ title, movies, onMovieClick }) => (
  <div className="h-56 space-y-0.5 md:space-y-2 px-4 md:px-12 my-8">
    <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
      {title}
    </h2>
    <div className="group relative md:-ml-2">
      <div className="flex items-center space-x-2.5 overflow-x-scroll md:p-2 hide-scrollbar">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
        ))}
      </div>
    </div>
  </div>
);

// --- Pages ---

const DownloadsPage = () => {
  const [videos, setVideos] = useState(getDownloadedVideos());
  const navigate = useNavigate();

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeDownloadedVideo(id);
    setVideos(getDownloadedVideos());
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/')} className="mr-4 text-white hover:text-gray-300">
           <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center">
          <WifiOff size={28} className="mr-3 text-gray-400" />
          Offline Downloads
        </h1>
      </div>
      
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <p>No videos downloaded for offline viewing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map(v => (
            <div key={v.id} onClick={() => navigate(`/watch/offline-${v.id}`)} className="bg-card rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform border border-gray-800">
               <div className="relative h-40">
                 <img src={v.posterUrl} className="w-full h-full object-cover" alt={v.title} />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={32} className="text-white fill-white" />
                 </div>
               </div>
               <div className="p-3">
                 <h3 className="text-white font-bold text-sm truncate">{v.title}</h3>
                 <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{v.size} • {v.duration}</span>
                    <button onClick={(e) => handleRemove(e, v.id)} className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-white/10" title="Delete Download">
                      <Trash2 size={16} />
                    </button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Home = ({ movies, onPlay, user }: { movies: Movie[], onPlay: (id: string) => void, user: User }) => {
  const [featured, setFeatured] = useState<Movie>(movies[0]);
  const [scrolled, setScrolled] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    const result = await getMovieRecommendation(aiQuery, movies);
    setAiResponse(result);
    setAiLoading(false);
  };

  return (
    <div className="relative h-screen bg-gradient-to-b from-gray-900/10 to-[#010511]">
      {/* Navbar */}
      <header className={`fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 transition-all lg:px-10 lg:py-6 ${scrolled ? 'bg-[#141414]' : 'bg-transparent'}`}>
        <div className="flex items-center space-x-2 md:space-x-10">
          <h1 className="text-red-600 text-2xl font-bold cursor-pointer font-sans tracking-tight">UNIVERSAL</h1>
          <ul className="hidden space-x-4 md:flex">
            <li className="cursor-pointer text-sm font-light text-[#e5e5e5] transition duration-[.4s] hover:text-[#b3b3b3]">Home</li>
            <li className="cursor-pointer text-sm font-light text-[#e5e5e5] transition duration-[.4s] hover:text-[#b3b3b3]">TV Shows</li>
            <li className="cursor-pointer text-sm font-light text-[#e5e5e5] transition duration-[.4s] hover:text-[#b3b3b3]">Movies</li>
            <li className="cursor-pointer text-sm font-light text-[#e5e5e5] transition duration-[.4s] hover:text-[#b3b3b3]">New & Popular</li>
          </ul>
        </div>
        <div className="flex items-center space-x-4 text-sm font-light relative">
          <Search className="hidden sm:inline h-6 w-6 cursor-pointer" />
          <p className="hidden lg:inline text-[#e5e5e5]">Kids</p>
          <Bell className="h-6 w-6 cursor-pointer" />
          
          {/* User Profile Dropdown */}
          <div className="group relative">
            <div className="h-8 w-8 cursor-pointer bg-blue-600 rounded flex items-center justify-center">
               <UserIcon size={18} />
            </div>
            
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-md bg-black/95 border border-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
               <div className="py-1">
                 <div className="px-4 py-3 border-b border-gray-800">
                   <p className="text-sm text-white">Signed in as</p>
                   <p className="text-sm font-medium text-gray-400 truncate">{user.name}</p>
                 </div>
                 
                 <button
                    onClick={() => navigate('/downloads')}
                    className="text-gray-300 hover:bg-gray-800 hover:text-white block w-full text-left px-4 py-2 text-sm flex items-center transition-colors"
                 >
                    <WifiOff size={16} className="mr-2" /> Offline Downloads
                 </button>

                 {user.role === 'admin' && (
                   <button
                     onClick={() => navigate('/admin')}
                     className="text-gray-300 hover:bg-gray-800 hover:text-white block w-full text-left px-4 py-2 text-sm flex items-center transition-colors"
                   >
                     <LayoutDashboard size={16} className="mr-2" /> Admin Dashboard
                   </button>
                 )}
                 
                 <a href="#" className="text-gray-300 hover:bg-gray-800 hover:text-white block px-4 py-2 text-sm transition-colors">Account</a>
                 <a href="#" className="text-gray-300 hover:bg-gray-800 hover:text-white block px-4 py-2 text-sm transition-colors">Help Center</a>
                 <a href="#" className="text-gray-300 hover:bg-gray-800 hover:text-white block px-4 py-2 text-sm transition-colors">Sign out</a>
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-col space-y-2 py-16 md:space-y-4 lg:h-[75vh] lg:justify-end lg:pb-12 px-4 md:px-12 relative">
        <div className="absolute top-0 left-0 -z-10 h-[105vh] w-full">
           <img 
            src={featured.bannerUrl} 
            className="h-full w-full object-cover opacity-60"
            alt={featured.title}
           />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </div>

        <h1 className="text-2xl font-bold md:text-4xl lg:text-7xl drop-shadow-xl max-w-3xl">
          {featured.title}
        </h1>
        <p className="max-w-xs text-xs text-shadow-md md:max-w-lg md:text-lg lg:max-w-2xl text-gray-200">
          {featured.description}
        </p>
        <div className="flex space-x-3">
          <button 
            onClick={() => onPlay(featured.id)}
            className="flex items-center gap-x-2 rounded bg-white px-5 py-1.5 text-sm font-bold text-black transition hover:bg-[#e6e6e6] md:py-2.5 md:px-8 md:text-xl"
          >
            <Play fill="black" size={24} /> Play
          </button>
          <button className="flex items-center gap-x-2 rounded bg-[gray]/70 px-5 py-1.5 text-sm font-bold text-white transition hover:bg-[gray]/40 md:py-2.5 md:px-8 md:text-xl">
             <Info size={24} /> More Info
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="pb-40 relative z-20">
        <MovieRow title="Trending Now" movies={movies} onMovieClick={(m) => onPlay(m.id)} />
        <MovieRow title="Top Rated" movies={[...movies].reverse()} onMovieClick={(m) => onPlay(m.id)} />
        <MovieRow title="Action Thrillers" movies={movies.filter(m => m.genres.includes('Action') || m.genres.includes('Adventure'))} onMovieClick={(m) => onPlay(m.id)} />
      </div>

      {/* AI Assistant FAB */}
      <button 
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      >
        <Bot size={28} />
      </button>

      {/* AI Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4">
          <div className="w-full sm:max-w-lg bg-card border border-muted sm:rounded-2xl p-6 shadow-2xl h-[80vh] sm:h-auto flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Bot className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Movie Assistant</h3>
                  <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-muted-foreground hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-muted/30 rounded-xl p-4 mb-4 overflow-y-auto min-h-[150px]">
              {!aiResponse && !aiLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
                  <p>Tell me what you feel like watching.</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-xs bg-muted px-2 py-1 rounded-full border border-gray-700">"Sad but hopeful"</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full border border-gray-700">"90s action"</span>
                  </div>
                </div>
              )}
              {aiLoading && (
                <div className="flex items-center justify-center h-full space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
              {aiResponse && (
                <div className="prose prose-invert text-sm">
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleAiSubmit} className="relative">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask for a recommendation..."
                className="w-full bg-muted border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!aiQuery.trim() || aiLoading}
                className="absolute right-2 top-2 p-1.5 bg-purple-600 rounded-lg text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Logic ---

const App: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [user, setUser] = useState<User>({
    id: 'u1',
    name: 'Admin User',
    email: 'admin@universal.com',
    role: 'admin',
    avatar: '',
    watchlist: []
  });

  const handleAddMovie = (newMovie: Movie) => {
    setMovies([...movies, newMovie]);
  };

  const handleDeleteMovie = (id: string) => {
    setMovies(movies.filter(m => m.id !== id));
  };

  return (
    <Router>
      <div className="bg-[#0a0a0a] min-h-screen text-white font-sans antialiased">
        <Routes>
          <Route path="/" element={<Home movies={movies} onPlay={(id) => window.location.hash = `/watch/${id}`} user={user} />} />
          <Route path="/admin" element={
             user.role === 'admin' ? (
                <AdminPanel 
                  movies={movies} 
                  analytics={MOCK_ANALYTICS}
                  onAddMovie={handleAddMovie}
                  onDeleteMovie={handleDeleteMovie}
                />
             ) : (
                <Navigate to="/" />
             )
          } />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/watch/:id" element={<WatchPage movies={movies} />} />
        </Routes>
      </div>
    </Router>
  );
};

const WatchPage = ({ movies }: { movies: Movie[] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offlineSrc, setOfflineSrc] = useState<string | null>(null);

  useEffect(() => {
    if (id?.startsWith('offline-')) {
        const realId = id.replace('offline-', '');
        getVideoFromCache(realId).then(url => {
            if(url) setOfflineSrc(url);
        });
    }
  }, [id]);
  
  const movie = movies.find(m => m.id === id);

  if (id?.startsWith('offline-') && offlineSrc) {
     const vidData = getDownloadedVideos().find(v => v.id === id.replace('offline-', ''));
     return (
        <VideoPlayer 
          src={offlineSrc} 
          poster={vidData?.posterUrl || ''} 
          title={vidData?.title || 'Offline Video'}
          onBack={() => navigate('/downloads')} 
        />
     );
  }

  if (!movie) return <div className="flex h-screen items-center justify-center text-xl text-gray-500">Movie not found</div>;

  return (
    <VideoPlayer 
      src={movie.videoUrl} 
      poster={movie.posterUrl} 
      title={movie.title}
      onBack={() => navigate('/')} 
    />
  );
};

export default App;
