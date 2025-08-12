import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Trash2, Clock } from 'lucide-react';

const Playlist = ({ 
  tracks = [], 
  currentTrack, 
  isPlaying, 
  onTrackSelect, 
  onTrackRemove,
  onClearPlaylist 
}) => {
  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    const total = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    return formatDuration(total);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Playlist</h3>
            <p className="text-white/70 text-sm">
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} • {getTotalDuration()}
            </p>
          </div>
        </div>
        
        {tracks.length > 0 && (
          <button
            onClick={onClearPlaylist}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            title="Clear playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Track List */}
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {tracks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <Music className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/50 text-sm">No tracks in playlist</p>
              <p className="text-white/30 text-xs mt-1">Upload audio files to get started</p>
            </motion.div>
          ) : (
            tracks.map((track, index) => {
              const isCurrentTrack = currentTrack && currentTrack.id === track.id;
              const isCurrentlyPlaying = isCurrentTrack && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isCurrentTrack
                      ? 'bg-gradient-to-r from-orange-400/20 to-pink-500/20 border border-orange-400/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  onClick={() => onTrackSelect(track)}
                >
                  {/* Play/Pause Button */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isCurrentTrack 
                        ? 'bg-gradient-to-r from-orange-400 to-pink-500' 
                        : 'bg-white/10 group-hover:bg-white/20'
                    }`}>
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </div>
                    
                    {/* Playing indicator */}
                    {isCurrentlyPlaying && (
                      <motion.div
                        className="absolute -inset-1 rounded-lg border-2 border-orange-400/50"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate transition-colors duration-200 ${
                      isCurrentTrack ? 'text-white' : 'text-white/90'
                    }`}>
                      {track.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/60">
                        {formatDuration(track.duration)}
                      </span>
                      {track.size && (
                        <span className="text-xs text-white/40">
                          • {(track.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrackRemove(track.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                    title="Remove track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Track Number */}
                  <div className={`text-xs font-mono min-w-[2rem] text-right transition-colors duration-200 ${
                    isCurrentTrack ? 'text-orange-400' : 'text-white/40'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #fb923c, #ec4899);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #f97316, #e11d48);
        }
      `}</style>
    </motion.div>
  );
};

export default Playlist;