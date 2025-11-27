import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Settings,
  Captions,
  Check,
  Download,
  Gauge
} from './ui/Icons';

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  onBack: () => void;
}

const QUALITIES = ['Auto', '4K Ultra HD', '1080p HD', '720p', '480p'];
const SUBTITLES = ['Off', 'English', 'Spanish', 'French', 'German'];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Mock subtitle cues for demonstration purposes
const MOCK_CUES = [
  { start: 2, end: 5, text: "[Atmospheric Music]" },
  { start: 6, end: 9, text: "Welcome to Universal Movies Hub." },
  { start: 10, end: 13, text: "Experience the ultimate streaming quality." },
  { start: 14, end: 18, text: "Watch your favorite movies anytime, anywhere." },
  { start: 20, end: 24, text: "[Intense Action Sequence Starts]" },
  { start: 25, end: 28, text: "Don't blink or you'll miss it!" },
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // UI State
  const [showControls, setShowControls] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'none' | 'quality' | 'subtitles' | 'speed'>('none');
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [currentSubtitle, setCurrentSubtitle] = useState('Off');
  const [activeSubtitleText, setActiveSubtitleText] = useState('');
  const [isHoveringControls, setIsHoveringControls] = useState(false);

  // Helper to manage control visibility
  const showControlsAndScheduleHide = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Only schedule hide if video is playing, no menus are open, and mouse is NOT over controls
    if (isPlaying && activeMenu === 'none' && !isHoveringControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds of inactivity
    }
  }, [isPlaying, activeMenu, isHoveringControls]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT') return;
      
      showControlsAndScheduleHide();
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'escape':
           if (activeMenu !== 'none') setActiveMenu('none');
           else if (isFullscreen) toggleFullscreen();
           else onBack();
           break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted, activeMenu, showControlsAndScheduleHide]);

  // Mouse activity tracker
  useEffect(() => {
    const container = containerRef.current;
    
    const handleActivity = () => {
      showControlsAndScheduleHide();
    };

    if (container) {
      container.addEventListener('mousemove', handleActivity);
      container.addEventListener('click', handleActivity);
      container.addEventListener('touchstart', handleActivity);
    }
    
    // Initial schedule
    showControlsAndScheduleHide();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleActivity);
        container.removeEventListener('click', handleActivity);
        container.removeEventListener('touchstart', handleActivity);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControlsAndScheduleHide]);

  // Update controls visibility based on state changes (Pause, Menu open, Hovering controls)
  useEffect(() => {
    if (!isPlaying || activeMenu !== 'none' || isHoveringControls) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      // If playing and safe to hide, restart timer
      showControlsAndScheduleHide();
    }
  }, [isPlaying, activeMenu, isHoveringControls, showControlsAndScheduleHide]);

  // Simulate network bandwidth detection for "Auto" quality
  useEffect(() => {
    if (currentQuality === 'Auto') {
      const connection = (navigator as any).connection;
      if (connection) {
         // console.log(`Effective network type: ${connection.effectiveType}`);
      }
    }
  }, [currentQuality]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setActiveMenu('none');
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const vidDuration = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(vidDuration);
      setProgress((current / vidDuration) * 100);

      // Handle Mock Subtitles
      if (currentSubtitle !== 'Off') {
        const cue = MOCK_CUES.find(c => current >= c.start && current <= c.end);
        setActiveSubtitleText(cue ? cue.text : '');
      } else {
        setActiveSubtitleText('');
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setActiveMenu('none');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${sanitizedTitle}.mp4`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-screen bg-black group overflow-hidden font-sans select-none focus:outline-none ${!showControls && isPlaying ? 'cursor-none' : ''}`}
      tabIndex={0}
      aria-label="Video Player"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Subtitles Overlay */}
      {activeSubtitleText && (
        <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none z-10 px-4 transition-opacity duration-200">
          <span className="bg-black/60 text-white text-lg md:text-xl px-3 py-1.5 rounded-md shadow-lg backdrop-blur-sm">
            {activeSubtitleText}
          </span>
        </div>
      )}

      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onMouseEnter={() => setIsHoveringControls(true)}
        onMouseLeave={() => setIsHoveringControls(false)}
      >
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="text-white hover:text-primary transition-colors bg-black/50 rounded-full p-2 backdrop-blur-sm" aria-label="Go Back">
            <ArrowLeft size={28} />
          </button>
          <h2 className="text-white text-lg font-semibold drop-shadow-md hidden sm:block">{title}</h2>
        </div>
      </div>
      
      {/* Bottom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-6 px-6 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onMouseEnter={() => setIsHoveringControls(true)}
        onMouseLeave={() => setIsHoveringControls(false)}
      >
        
        {/* Progress Bar */}
        <div className="flex items-center space-x-3 mb-4 group/seek">
          <span className="text-xs text-gray-300 font-medium w-10 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 h-1 bg-gray-600/60 rounded-lg cursor-pointer transition-all duration-200 group-hover/seek:h-2">
             <div 
               className="absolute top-0 left-0 h-full bg-primary rounded-lg z-10" 
               style={{ width: `${progress}%` }}
             />
             <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
              aria-label="Seek slider"
            />
          </div>
          <span className="text-xs text-gray-300 font-medium w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-6">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors" aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={32} fill="white" className="hover:fill-primary" /> : <Play size={32} fill="white" className="hover:fill-primary" />}
            </button>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => skip(-10)} 
                className="text-gray-300 hover:text-white transition-colors relative group/skip flex flex-col items-center justify-center"
                aria-label="Skip backward 10 seconds"
              >
                <RotateCcw size={24} />
                <span className="absolute text-[8px] font-bold top-[6px] select-none">10</span>
              </button>
              <button 
                onClick={() => skip(10)} 
                className="text-gray-300 hover:text-white transition-colors relative group/skip flex flex-col items-center justify-center"
                aria-label="Skip forward 10 seconds"
              >
                <RotateCw size={24} />
                <span className="absolute text-[8px] font-bold top-[6px] select-none">10</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-primary" aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if(videoRef.current) videoRef.current.volume = val;
                  setIsMuted(val === 0);
                }}
                className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 h-1 bg-white rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                aria-label="Volume Control"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4 relative">
             
             {/* Speed Control */}
             <div className="relative">
                {activeMenu === 'speed' && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur border border-gray-700 rounded-lg p-2 min-w-[100px] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider">Speed</p>
                    {SPEEDS.map(speed => (
                      <button 
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded flex items-center justify-between text-gray-200 transition-colors"
                      >
                        {speed}x
                        {playbackRate === speed && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setActiveMenu(activeMenu === 'speed' ? 'none' : 'speed')} 
                  className={`transition-colors ${activeMenu === 'speed' ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
                  title="Playback Speed"
                  aria-label="Playback Speed"
                  aria-haspopup="true"
                  aria-expanded={activeMenu === 'speed'}
                >
                  <Gauge size={24} />
                </button>
             </div>

             {/* Subtitles Menu */}
             <div className="relative">
                {activeMenu === 'subtitles' && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur border border-gray-700 rounded-lg p-2 min-w-[140px] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider">Subtitles</p>
                    {SUBTITLES.map(sub => (
                      <button 
                        key={sub}
                        onClick={() => { setCurrentSubtitle(sub); setActiveMenu('none'); }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded flex items-center justify-between text-gray-200 transition-colors"
                      >
                        {sub}
                        {currentSubtitle === sub && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => setActiveMenu(activeMenu === 'subtitles' ? 'none' : 'subtitles')} 
                  className={`transition-colors ${activeMenu === 'subtitles' ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
                  title="Subtitles"
                  aria-label="Subtitles"
                  aria-haspopup="true"
                  aria-expanded={activeMenu === 'subtitles'}
                >
                  <Captions size={24} />
                </button>
             </div>

             {/* Download Button */}
             <button 
                onClick={handleDownload}
                className="text-gray-300 hover:text-white transition-colors"
                title="Download"
                aria-label="Download Video"
             >
                <Download size={24} />
             </button>

             {/* Quality Settings */}
             <div className="relative">
                {activeMenu === 'quality' && (
                  <div className="absolute bottom-14 right-0 bg-[#1a1a1a]/95 backdrop-blur border border-gray-700 rounded-lg p-2 min-w-[140px] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider">Quality</p>
                    {QUALITIES.map(q => (
                      <button 
                        key={q}
                        onClick={() => { setCurrentQuality(q); setActiveMenu('none'); }}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded flex items-center justify-between text-gray-200 transition-colors"
                      >
                        {q}
                        {currentQuality === q && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                   onClick={() => setActiveMenu(activeMenu === 'quality' ? 'none' : 'quality')}
                   className={`transition-colors ${activeMenu === 'quality' ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
                   title="Settings"
                   aria-label="Quality Settings"
                   aria-haspopup="true"
                   aria-expanded={activeMenu === 'quality'}
                >
                   <Settings size={24} />
                </button>
             </div>

             <button onClick={toggleFullscreen} className="text-white hover:text-primary ml-2 transition-colors" aria-label="Toggle Fullscreen">
               {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};