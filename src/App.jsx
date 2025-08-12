import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Music, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';
import Player from './components/Player';
import Visualizer from './components/Visualizer';
import Playlist from './components/Playlist';

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = () => {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      
      setAudioContext(context);
      setAnalyser(analyserNode);
    };

    initAudioContext();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Connect audio element to analyser when track changes
  useEffect(() => {
    if (audioRef.current && audioContext && analyser && currentTrack) {
      if (audioSource) {
        audioSource.disconnect();
      }

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      setAudioSource(source);
    }
  }, [currentTrack, audioContext, analyser]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    const newTracks = audioFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name.replace(/\.[^/.]+$/, ''),
      file: file,
      url: URL.createObjectURL(file),
      duration: 0,
      artist: 'Unknown Artist'
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
    
    if (!currentTrack && newTracks.length > 0) {
      setCurrentTrack(newTracks[0]);
      setCurrentTrackIndex(playlist.length);
    }
  };

  const playTrack = (track, index) => {
    setCurrentTrack(track);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Resume audio context if suspended
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume();
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const previousTrack = () => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
      nextTrack();
    } else {
      setIsPlaying(false);
    }
  };

  const removeTrack = (trackId) => {
    const trackIndex = playlist.findIndex(track => track.id === trackId);
    const newPlaylist = playlist.filter(track => track.id !== trackId);
    
    setPlaylist(newPlaylist);
    
    if (currentTrack && currentTrack.id === trackId) {
      if (newPlaylist.length > 0) {
        const nextIndex = trackIndex >= newPlaylist.length ? 0 : trackIndex;
        setCurrentTrack(newPlaylist[nextIndex]);
        setCurrentTrackIndex(nextIndex);
      } else {
        setCurrentTrack(null);
        setCurrentTrackIndex(0);
        setIsPlaying(false);
      }
    } else if (trackIndex < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-white" />
            <h1 className="text-4xl font-bold text-white">SunsetPlayer</h1>
          </div>
          <p className="text-white/80 text-lg">Upload your music and enjoy the visual experience</p>
        </motion.header>

        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 cursor-pointer hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-white mb-2">Upload Your Music</h3>
              <p className="text-white/70">Click here or drag and drop your audio files</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualizer */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 h-96">
              <Visualizer 
                analyser={analyser}
                isPlaying={isPlaying}
                currentTrack={currentTrack}
              />
            </div>
          </motion.div>

          {/* Playlist */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Playlist
              playlist={playlist}
              currentTrack={currentTrack}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={playTrack}
              onTrackRemove={removeTrack}
              isPlaying={isPlaying}
            />
          </motion.div>
        </div>

        {/* Player Controls */}
        <AnimatePresence>
          {currentTrack && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/10 border-t border-white/20 p-4"
            >
              <Player
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                volume={volume}
                isMuted={isMuted}
                duration={duration}
                currentTime={currentTime}
                isShuffled={isShuffled}
                repeatMode={repeatMode}
                onPlay={togglePlay}
                onNext={nextTrack}
                onPrevious={previousTrack}
                onVolumeChange={setVolume}
                onMute={() => setIsMuted(!isMuted)}
                onShuffle={() => setIsShuffled(!isShuffled)}
                onRepeat={() => {
                  const modes = ['none', 'all', 'one'];
                  const currentIndex = modes.indexOf(repeatMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  setRepeatMode(nextMode);
                }}
                onSeek={(time) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                    setCurrentTime(time);
                  }
                }}
                audioRef={audioRef}
                onTimeUpdate={(time) => setCurrentTime(time)}
                onDurationChange={(dur) => setDuration(dur)}
                onTrackEnd={handleTrackEnd}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden audio element */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onEnded={handleTrackEnd}
            volume={isMuted ? 0 : volume}
            crossOrigin="anonymous"
          />
        )}
      </div>
    </div>
  );
}

export default App;