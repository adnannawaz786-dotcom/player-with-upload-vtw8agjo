import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, Music } from 'lucide-react'

const Player = ({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious, 
  onTrackUpload,
  onTimeUpdate,
  onLoadedMetadata,
  audioRef
}) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
      onTimeUpdate && onTimeUpdate(audio.currentTime)
    }

    const updateDuration = () => {
      setDuration(audio.duration)
      onLoadedMetadata && onLoadedMetadata(audio.duration)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
    }
  }, [audioRef, isDragging, onTimeUpdate, onLoadedMetadata])

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleProgressDrag = (e) => {
    if (!isDragging) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = percent * duration
    
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('audio/')) {
      onTrackUpload && onTrackUpload(file)
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
    >
      {/* Track Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400/20 to-pink-500/20 flex items-center justify-center border border-white/10">
          {currentTrack?.artwork ? (
            <img 
              src={currentTrack.artwork} 
              alt="Track artwork"
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <Music className="w-8 h-8 text-white/60" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">
            {currentTrack?.name || 'No track selected'}
          </h3>
          <p className="text-white/60 text-sm truncate">
            {currentTrack?.artist || 'Unknown artist'}
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
          title="Upload track"
        >
          <Upload className="w-5 h-5 text-white" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div 
          ref={progressRef}
          className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
          onClick={handleProgressClick}
          onMouseMove={handleProgressDrag}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 8px)` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-white/60 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevious}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          disabled={!currentTrack}
        >
          <SkipBack className="w-5 h-5 text-white" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayPause}
          className="p-4 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 transition-all shadow-lg"
          disabled={!currentTrack}
        >
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Pause className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Play className="w-6 h-6 text-white ml-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          disabled={!currentTrack}
        >
          <SkipForward className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-white/60" />
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full pointer-events-none"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
        <span className="text-xs text-white/60 w-8 text-right">
          {Math.round(volume * 100)}
        </span>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  )
}

export default Player