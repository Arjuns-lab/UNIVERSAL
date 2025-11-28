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
  Gauge,
  SlidersHorizontal,
  Info
} from './ui/Icons';
import { downloadVideo, saveVideoMetadata } from '../services/downloadService';

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
  onBack: () => void;
}

const QUALITIES = ['Auto', '4K Ultra HD', '1080p HD', '720p', '480p'];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const AUDIO_MODES = [
  { name: 'Standard', desc: 'Balanced sound' },
  { name: 'Bass Boost', desc: 'Deep lows for action' },
  { name: 'Vocal Boost', desc: 'Clearer dialogue' },
  { name: 'Treble Boost', desc: 'Crisp highs' }
];

// Mock subtitle cues for demonstration purposes
const MOCK_CUES: Record<string, { start: number; end: number; text: string }[]> = {
  'English': [
    { start: 1, end: 4, text: "[Atmospheric Music Builds]" },
    { start: 5, end: 8, text: "Welcome to Universal Movies Hub." },
    { start: 9, end: 12, text: "Where stories come to life in stunning detail." },
    { start: 13, end: 17, text: "Experience cinema like never before, right from your home." },
    { start: 19, end: 23, text: "[Explosion Sound] Look out!" },
    { start: 24, end: 27, text: "That was a close call." },
  ],
  'Spanish': [
    { start: 1, end: 4, text: "[Música Atmosférica Aumenta]" },
    { start: 5, end: 8, text: "Bienvenido a Universal Movies Hub." },
    { start: 9, end: 12, text: "Donde las historias cobran vida con un detalle impresionante." },
    { start: 13, end: 17, text: "Experimenta el cine como nunca antes, desde tu hogar." },
    { start: 19, end: 23, text: "[Sonido de Explosión] ¡Cuidado!" },
  ],
  'French': [
    { start: 1, end: 4, text: "[Musique Atmosphérique]" },
    { start: 5, end: 8, text: "Bienvenue sur Universal Movies Hub." },
    { start: 9, end: 12, text: "Où les histoires prennent vie." },
    { start: 13, end: 17, text: "Vivez le cinéma comme jamais auparavant." },
  ],
  'German': [
    { start: 1, end: 4, text: "[Atmosphärische Musik]" },
    { start: 5, end: 8, text: "Willkommen beim Universal Movies Hub." },
    { start: 9, end: 12, text: "Wo Geschichten lebendig werden." },
    { start: 13, end: 17, text: "Erleben Sie Kino wie nie zuvor." },
  ],
  'Italian': [
    { start: 1, end: 4, text: "[Musica d'atmosfera]" },
    { start: 5, end: 8, text: "Benvenuti a Universal Movies Hub." },
    { start: 9, end: 12, text: "Dove le storie prendono vita." },
    { start: 13, end: 17, text: "Vivi il cinema come mai prima d'ora." },
  ],
  'Portuguese': [
    { start: 1, end: 4, text: "[Música Atmosférica]" },
    { start: 5, end: 8, text: "Bem-vindo ao Universal Movies Hub." },
    { start: 9, end: 12, text: "Onde as histórias ganham vida." },
    { start: 13, end: 17, text: "Experimente o cinema como nunca antes." },
  ],
  'Japanese': [
    { start: 1, end: 4, text: "[雰囲気のある音楽]" },
    { start: 5, end: 8, text: "ユニバーサル・ムービーズ・ハブへようこそ。" },
    { start: 9, end: 12, text: "物語が鮮明に生き返る場所。" },
    { start: 13, end: 17, text: "これまでにない映画体験を。" },
  ],
  'Korean': [
    { start: 1, end: 4, text: "[분위기 있는 음악]" },
    { start: 5, end: 8, text: "Universal Movies Hub에 오신 것을 환영합니다." },
    { start: 9, end: 12, text: "이야기가 생생하게 살아나는 곳." },
    { start: 13, end: 17, text: "전에 없던 영화 같은 경험을 즐기세요." },
  ],
  'Chinese': [
    { start: 1, end: 4, text: "[大气的音乐]" },
    { start: 5, end: 8, text: "欢迎来到环球影视中心。" },
    { start: 9, end: 12, text: "在这里，故事栩栩如生。" },
    { start: 13, end: 17, text: "体验前所未有的电影。" },
  ],
  'Russian': [
    { start: 1, end: 4, text: "[Атмосферная музыка]" },
    { start: 5, end: 8, text: "Добро пожаловать в Universal Movies Hub." },
    { start: 9, end: 12, text: "Где истории оживают." },
    { start: 13, end: 17, text: "Наслаждайтесь кино как никогда раньше." },
  ],
  'Hindi': [
    { start: 1, end: 4, text: "[वायुमंडलीय संगीत]" },
    { start: 5, end: 8, text: "यूनिवर्सल मूवीज हब में आपका स्वागत है।" },
    { start: 9, end: 12, text: "जहां कहानियां जीवंत हो उठती हैं।" },
    { start: 13, end: 17, text: "सिनेमा का ऐसा अनुभव पहले कभी नहीं किया।" },
  ]
};

const SUBTITLES = ['Off', ...Object.keys(MOCK_CUES)];

type ActiveMenu = 'none' | 'quality' | 'subtitles' | 'speed' | 'audio';

// Component for the Controls UI to keep the main file clean
const PlayerControls = ({
  isPlaying,
  progress,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  playbackRate,
  activeMenu,
  currentQuality,
  currentSubtitle,
  currentAudioMode,
  isDownloading,
  downloadProgress,
  title,
  showControls,
  supportsHEVC,
  onPlayToggle,
  onSeek,
  onSkip,
  onMuteToggle,
  onVolumeChange,
  onFullscreenToggle,
  onBack,
  onMenuToggle,
  onSpeedChange,
  onSubtitleChange,
  onQualityChange,
  onAudioModeChange,
  onDownload,
  formatTime,
  setIsHoveringControls
}: any) => {
  return (
    <>
      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start transition-all duration-300 ease-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        onMouseEnter={() => setIsHoveringControls(true)}
        onMouseLeave={() => setIsHoveringControls(false)}
      >
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack} 
            className="text-white hover:text-primary transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary outline-none" 
            aria-label="Go Back"
          >
            <ArrowLeft size={28} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-white text-lg font-semibold drop-shadow-md hidden sm:block tracking-wide">{title}</h2>
            {supportsHEVC && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-1.5 py-0.5 rounded w-fit mt-1 backdrop-blur-sm font-bold tracking-wider">
                HQ HEVC
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-16 pb-6 px-6 transition-all duration-300 ease-out z-20 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        onMouseEnter={() => setIsHoveringControls(true)}
        onMouseLeave={() => setIsHoveringControls(false)}
      >
        
        {/* Progress Bar */}
        <div className="flex items-center space-x-3 mb-4 group/seek">
          <span className="text-xs text-gray-300 font-medium w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div className="relative flex-1 h-1.5 bg-white/20 rounded-lg cursor-pointer transition-all duration-200 group-hover/seek:h-2.5">
             <div 
               className="absolute top-0 left-0 h-full bg-primary rounded-lg z-10 shadow-[0_0_10px_rgba(229,9,20,0.5)]" 
               style={{ width: `${progress}%` }}
             >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-md scale-0 group-hover/seek:scale-100" />
             </div>
             <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={onSeek}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="Seek slider"
            />
          </div>
          <span className="text-xs text-gray-300 font-medium w-10 tabular-nums">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={onPlayToggle} 
              className="text-white hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-full outline-none p-1" 
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onSkip(-10)} 
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none group relative active:scale-90"
                aria-label="Skip backward 10 seconds"
                title="Rewind 10s"
              >
                <RotateCcw size={24} className="group-active:-rotate-45 transition-transform" />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold pt-[1px] select-none">10</span>
              </button>
              <button 
                onClick={() => onSkip(10)} 
                className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none group relative active:scale-90"
                aria-label="Skip forward 10 seconds"
                title="Forward 10s"
              >
                <RotateCw size={24} className="group-active:rotate-45 transition-transform" />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-extrabold pt-[1px] select-none">10</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 group/volume focus-within:ring-2 focus-within:ring-primary/0 rounded-lg">
              <button 
                onClick={onMuteToggle} 
                className="text-white hover:text-primary focus-visible:ring-2 focus-visible:ring-primary rounded-lg outline-none p-1" 
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={onVolumeChange}
                className="w-0 overflow-hidden group-hover/volume:w-24 group-focus-within/volume:w-24 focus:w-24 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-primary focus:outline-none"
                aria-label="Volume Control"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
                aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)} percent`}
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4 relative">
             
             {/* Audio Mode Menu */}
             <div className="relative">
                {activeMenu === 'audio' && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 min-w-[180px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom z-30">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider">Audio Enhancements</p>
                    {AUDIO_MODES.map(mode => (
                      <button 
                        key={mode.name}
                        onClick={() => onAudioModeChange(mode.name)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded-md flex items-center justify-between text-gray-200 transition-colors group"
                      >
                        <div className="flex flex-col">
                          <span>{mode.name}</span>
                          <span className="text-[10px] text-gray-500 group-hover:text-gray-400">{mode.desc}</span>
                        </div>
                        {currentAudioMode === mode.name && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => onMenuToggle('audio')} 
                  className={`transition-colors p-2 rounded-lg ${activeMenu === 'audio' ? 'text-primary bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                  title="Audio Settings"
                  aria-label="Audio Settings"
                >
                  <SlidersHorizontal size={22} />
                </button>
             </div>

             {/* Speed Control */}
             <div className="relative">
                {activeMenu === 'speed' && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 min-w-[100px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom z-30">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider">Speed</p>
                    {SPEEDS.map(speed => (
                      <button 
                        key={speed}
                        onClick={() => onSpeedChange(speed)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded flex items-center justify-between text-gray-200 transition-colors"
                      >
                        {speed}x
                        {playbackRate === speed && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => onMenuToggle('speed')} 
                  className={`transition-colors p-2 rounded-lg ${activeMenu === 'speed' ? 'text-primary bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                  title="Playback Speed"
                  aria-label="Playback Speed"
                >
                  <Gauge size={22} />
                </button>
             </div>

             {/* Subtitles Menu */}
             <div className="relative">
                {activeMenu === 'subtitles' && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 min-w-[140px] max-h-60 overflow-y-auto hide-scrollbar shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom z-30">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider sticky top-0 bg-[#1a1a1a]/95 py-1 z-10">Subtitles</p>
                    {SUBTITLES.map(sub => (
                      <button 
                        key={sub}
                        onClick={() => onSubtitleChange(sub)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded flex items-center justify-between text-gray-200 transition-colors"
                      >
                        {sub}
                        {currentSubtitle === sub && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => onMenuToggle('subtitles')} 
                  className={`transition-colors p-2 rounded-lg ${activeMenu === 'subtitles' ? 'text-primary bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                  title="Subtitles"
                  aria-label="Subtitles"
                >
                  <Captions size={22} />
                </button>
             </div>

             {/* Download Button */}
             <div className="relative">
               {isDownloading && downloadProgress < 100 && (
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                   {Math.round(downloadProgress)}%
                 </div>
               )}
               <button 
                  onClick={onDownload}
                  disabled={isDownloading && downloadProgress < 100}
                  className={`transition-all duration-200 p-2 rounded-lg relative ${isDownloading ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                  title={isDownloading ? "Downloading..." : "Download for Offline"}
                  aria-label="Download Video"
               >
                  <Download size={22} className={isDownloading ? 'animate-pulse' : ''} />
                  {isDownloading && downloadProgress < 100 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-lg transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                  )}
               </button>
             </div>

             {/* Quality Settings */}
             <div className="relative">
                {activeMenu === 'quality' && (
                  <div className="absolute bottom-14 right-0 bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 min-w-[140px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 origin-bottom-right z-30">
                    <p className="text-xs text-gray-400 font-bold mb-2 px-2 uppercase tracking-wider">Quality</p>
                    {QUALITIES.map(q => (
                      <button 
                        key={q}
                        onClick={() => onQualityChange(q)}
                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/10 rounded flex items-center justify-between text-gray-200 transition-colors"
                      >
                        {q}
                        {currentQuality === q && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
                <button 
                   onClick={() => onMenuToggle('quality')}
                   className={`transition-colors p-2 rounded-lg ${activeMenu === 'quality' ? 'text-primary bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                   title="Settings"
                   aria-label="Quality Settings"
                >
                   <Settings size={22} />
                </button>
             </div>

             <button 
               onClick={onFullscreenToggle} 
               className="text-white hover:text-primary p-2 ml-1 transition-colors hover:scale-110 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg" 
               aria-label="Toggle Fullscreen"
             >
               {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const vocalFilterRef = useRef<BiquadFilterNode | null>(null);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [supportsHEVC, setSupportsHEVC] = useState(false);
  
  // UI State
  const [showControls, setShowControls] = useState(true);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('none');
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [currentSubtitle, setCurrentSubtitle] = useState('Off');
  const [currentAudioMode, setCurrentAudioMode] = useState('Standard');
  const [activeSubtitleText, setActiveSubtitleText] = useState('');
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  
  // Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Check Codec Support
  useEffect(() => {
    const v = document.createElement('video');
    // Check for H.265/HEVC support (common in 4K content)
    const canPlayHEVC = v.canPlayType('video/mp4; codecs="hvc1"');
    if (canPlayHEVC === 'probably' || canPlayHEVC === 'maybe') {
      setSupportsHEVC(true);
    }
  }, []);

  // Initialize Web Audio API
  const initAudioContext = () => {
    if (audioContextRef.current || !videoRef.current) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(videoRef.current);
      sourceNodeRef.current = source;

      // Create Filters
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200; // Hz
      bassFilterRef.current = bass;

      const vocal = ctx.createBiquadFilter();
      vocal.type = 'peaking';
      vocal.frequency.value = 1500; // Human voice range
      vocal.Q.value = 0.7;
      vocalFilterRef.current = vocal;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 3000;
      trebleFilterRef.current = treble;

      // Connect Graph: Source -> Bass -> Vocal -> Treble -> Destination
      source.connect(bass);
      bass.connect(vocal);
      vocal.connect(treble);
      treble.connect(ctx.destination);
      
      console.log('Audio Context Initialized');
    } catch (e) {
      console.warn('Web Audio API setup failed (likely CORS on video source):', e);
    }
  };

  const applyAudioPreset = (mode: string) => {
    setCurrentAudioMode(mode);
    setActiveMenu('none');
    
    if (!bassFilterRef.current || !vocalFilterRef.current || !trebleFilterRef.current) return;

    const ctx = audioContextRef.current;
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }

    const now = ctx?.currentTime || 0;
    const ramp = 0.5; // Smooth transition seconds

    switch (mode) {
      case 'Bass Boost':
        bassFilterRef.current.gain.linearRampToValueAtTime(10, now + ramp);
        vocalFilterRef.current.gain.linearRampToValueAtTime(0, now + ramp);
        trebleFilterRef.current.gain.linearRampToValueAtTime(-2, now + ramp);
        break;
      case 'Vocal Boost':
        bassFilterRef.current.gain.linearRampToValueAtTime(-5, now + ramp); // Cut mud
        vocalFilterRef.current.gain.linearRampToValueAtTime(8, now + ramp);
        trebleFilterRef.current.gain.linearRampToValueAtTime(2, now + ramp);
        break;
      case 'Treble Boost':
        bassFilterRef.current.gain.linearRampToValueAtTime(0, now + ramp);
        vocalFilterRef.current.gain.linearRampToValueAtTime(0, now + ramp);
        trebleFilterRef.current.gain.linearRampToValueAtTime(8, now + ramp);
        break;
      case 'Standard':
      default:
        bassFilterRef.current.gain.linearRampToValueAtTime(0, now + ramp);
        vocalFilterRef.current.gain.linearRampToValueAtTime(0, now + ramp);
        trebleFilterRef.current.gain.linearRampToValueAtTime(0, now + ramp);
        break;
    }
  };

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
      container.addEventListener('keydown', handleActivity as any); 
    }
    
    // Initial schedule
    showControlsAndScheduleHide();

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleActivity);
        container.removeEventListener('click', handleActivity);
        container.removeEventListener('touchstart', handleActivity);
        container.removeEventListener('keydown', handleActivity as any);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControlsAndScheduleHide]);

  // Update controls visibility based on state changes
  useEffect(() => {
    if (!isPlaying || activeMenu !== 'none' || isHoveringControls) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      showControlsAndScheduleHide();
    }
  }, [isPlaying, activeMenu, isHoveringControls, showControlsAndScheduleHide]);

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Attempt to init audio context and resume on interaction
    if (!audioContextRef.current) {
      initAudioContext();
    } 
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(err => console.error("Play failed:", err));
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
      if (currentSubtitle !== 'Off' && MOCK_CUES[currentSubtitle]) {
        const cues = MOCK_CUES[currentSubtitle];
        const cue = cues.find(c => current >= c.start && current <= c.end);
        setActiveSubtitleText(cue ? cue.text : '');
      } else {
        setActiveSubtitleText('');
      }
    }
  };

  const handleError = () => {
    if (videoRef.current?.error) {
      const code = videoRef.current.error.code;
      let msg = "Playback Error";
      if (code === 3) msg = "Decoding Error: This browser may not support this file type (e.g. MKV/HEVC).";
      else if (code === 4) msg = "Source Not Supported";
      setPlaybackError(msg);
      setIsPlaying(false);
    }
  };

  const handleSubtitleChange = (sub: string) => {
    setCurrentSubtitle(sub); 
    setActiveMenu('none');
    
    // Immediately update subtitle text
    if (sub === 'Off') {
      setActiveSubtitleText('');
    } else if (videoRef.current && MOCK_CUES[sub]) {
      const current = videoRef.current.currentTime;
      const cues = MOCK_CUES[sub];
      const cue = cues.find(c => current >= c.start && current <= c.end);
      setActiveSubtitleText(cue ? cue.text : '');
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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    // If local blob, just do the progress animation then "finish"
    if (src.startsWith('blob:')) {
       // Mock progress for local file
       const interval = setInterval(() => {
         setDownloadProgress(prev => {
           if (prev >= 100) {
             clearInterval(interval);
             // Store metadata so it appears in Downloads
             saveVideoMetadata({
               id: Date.now().toString(),
               title: title,
               posterUrl: poster,
               duration: formatTime(duration),
               size: 'Local File',
               downloadedAt: new Date().toISOString(),
               blobId: src // Just store the URL for now, though persistence is tricky for blobs across reloads without cache API
             });
             setTimeout(() => setIsDownloading(false), 1000);
             return 100;
           }
           return prev + 10;
         });
       }, 200);
       return;
    }

    try {
      await downloadVideo(
        src, 
        {
          id: Date.now().toString(),
          title: title,
          posterUrl: poster,
          duration: formatTime(duration),
          size: 'Unknown', // Will be updated by service if possible
          downloadedAt: new Date().toISOString()
        },
        (progress) => setDownloadProgress(progress)
      );
      // Wait a moment before resetting state
      setTimeout(() => setIsDownloading(false), 1500);
    } catch (err) {
      console.error("Download failed:", err);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
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
        onError={handleError}
        crossOrigin="anonymous" 
      />

      {/* Error Overlay */}
      {playbackError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
           <div className="bg-[#1a1a1a] p-8 rounded-xl border border-red-900/50 text-center max-w-md">
              <Info size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Playback Failed</h3>
              <p className="text-gray-400 mb-6">{playbackError}</p>
              <button 
                onClick={onBack}
                className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200"
              >
                Go Back
              </button>
           </div>
        </div>
      )}

      {/* Subtitles Overlay */}
      {activeSubtitleText && (
        <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none z-10 px-4 transition-opacity duration-200 flex justify-center">
           <span 
             className="bg-black/50 text-white text-base md:text-xl px-3 py-1.5 rounded shadow-lg backdrop-blur-[2px] max-w-[80%] leading-relaxed"
             style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
           >
            {activeSubtitleText}
          </span>
        </div>
      )}
      
      {!playbackError && (
        <PlayerControls 
          isPlaying={isPlaying}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          playbackRate={playbackRate}
          activeMenu={activeMenu}
          currentQuality={currentQuality}
          currentSubtitle={currentSubtitle}
          currentAudioMode={currentAudioMode}
          isDownloading={isDownloading}
          downloadProgress={downloadProgress}
          title={title}
          showControls={showControls}
          supportsHEVC={supportsHEVC}
          onPlayToggle={togglePlay}
          onSeek={handleSeek}
          onSkip={skip}
          onMuteToggle={toggleMute}
          onVolumeChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value);
            setVolume(val);
            if(videoRef.current) videoRef.current.volume = val;
            setIsMuted(val === 0);
          }}
          onFullscreenToggle={toggleFullscreen}
          onBack={onBack}
          onMenuToggle={(menu: ActiveMenu) => setActiveMenu(activeMenu === menu ? 'none' : menu)}
          onSpeedChange={handleSpeedChange}
          onSubtitleChange={handleSubtitleChange}
          onQualityChange={(q: string) => { setCurrentQuality(q); setActiveMenu('none'); }}
          onAudioModeChange={applyAudioPreset}
          onDownload={handleDownload}
          formatTime={formatTime}
          setIsHoveringControls={setIsHoveringControls}
        />
      )}
    </div>
  );
};
