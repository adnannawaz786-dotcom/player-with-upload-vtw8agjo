import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

// Initialize Web Audio Context
let audioContext = null;

const initializeAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Audio Context Provider
export const AudioContextProvider = ({ children }) => {
  const [context, setContext] = React.useState(null);
  const [analyser, setAnalyser] = React.useState(null);
  const [currentTrack, setCurrentTrack] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playlist, setPlaylist] = React.useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);

  React.useEffect(() => {
    const ctx = initializeAudioContext();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.connect(ctx.destination);
    
    setContext(ctx);
    setAnalyser(analyserNode);
  }, []);

  const value = {
    audioContext: context,
    analyser,
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    playlist,
    setPlaylist,
    currentTrackIndex,
    setCurrentTrackIndex,
    volume,
    setVolume,
    duration,
    setDuration,
    currentTime,
    setCurrentTime
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Create Audio Context
export const AudioContext = React.createContext();

// Custom hook to use audio context
export const useAudioContext = () => {
  const context = React.useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioContextProvider');
  }
  return context;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Audio Player Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-white/80 mb-6">The audio player encountered an error. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize React application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AudioContextProvider>
        <App />
      </AudioContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
)