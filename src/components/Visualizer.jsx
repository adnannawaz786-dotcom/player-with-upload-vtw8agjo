import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { generateSunsetGradient, interpolateColors } from '../utils/colorUtils';

const Visualizer = ({ audioElement, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const sourceRef = useRef(null);
  const dataArrayRef = useRef(null);
  const [visualizerType, setVisualizerType] = useState('bars');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!audioElement || isInitialized) return;

    const initializeAudio = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyzer = audioContext.createAnalyser();
        
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.8;
        
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyzer);
        analyzer.connect(audioContext.destination);
        
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
        sourceRef.current = source;
        dataArrayRef.current = dataArray;
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    };

    initializeAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioElement, isInitialized]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!analyzerRef.current || !dataArrayRef.current) return;

      analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      const sunsetColors = generateSunsetGradient();
      gradient.addColorStop(0, `${sunsetColors[0]}20`);
      gradient.addColorStop(0.5, `${sunsetColors[1]}15`);
      gradient.addColorStop(1, `${sunsetColors[2]}10`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (isPlaying && audioContextRef.current?.state === 'running') {
        switch (visualizerType) {
          case 'bars':
            drawBars(ctx, width, height);
            break;
          case 'wave':
            drawWave(ctx, width, height);
            break;
          case 'circle':
            drawCircle(ctx, width, height);
            break;
          case 'particles':
            drawParticles(ctx, width, height);
            break;
          default:
            drawBars(ctx, width, height);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isInitialized, isPlaying, visualizerType]);

  const drawBars = (ctx, width, height) => {
    const bufferLength = dataArrayRef.current.length;
    const barWidth = width / bufferLength * 2;
    let x = 0;
    const sunsetColors = generateSunsetGradient();

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArrayRef.current[i] / 255) * height * 0.8;
      
      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      const colorIndex = Math.floor((i / bufferLength) * sunsetColors.length);
      const color = sunsetColors[colorIndex] || sunsetColors[0];
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, `${color}60`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
    }
  };

  const drawWave = (ctx, width, height) => {
    const bufferLength = dataArrayRef.current.length;
    const sliceWidth = width / bufferLength;
    let x = 0;
    const sunsetColors = generateSunsetGradient();

    ctx.lineWidth = 3;
    ctx.strokeStyle = sunsetColors[1];
    ctx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArrayRef.current[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = sunsetColors[1];
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const drawCircle = (ctx, width, height) => {
    const bufferLength = dataArrayRef.current.length;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    const sunsetColors = generateSunsetGradient();

    for (let i = 0; i < bufferLength; i++) {
      const angle = (i / bufferLength) * Math.PI * 2;
      const amplitude = dataArrayRef.current[i] / 255;
      const barLength = amplitude * radius;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barLength);
      const y2 = centerY + Math.sin(angle) * (radius + barLength);
      
      const colorIndex = Math.floor((i / bufferLength) * sunsetColors.length);
      const color = sunsetColors[colorIndex] || sunsetColors[0];
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const drawParticles = (ctx, width, height) => {
    const bufferLength = dataArrayRef.current.length;
    const sunsetColors = generateSunsetGradient();
    
    for (let i = 0; i < bufferLength; i++) {
      const amplitude = dataArrayRef.current[i] / 255;
      if (amplitude > 0.1) {
        const x = (i / bufferLength) * width;
        const y = height - (amplitude * height * 0.8);
        const size = amplitude * 8;
        
        const colorIndex = Math.floor((i / bufferLength) * sunsetColors.length);
        const color = sunsetColors[colorIndex] || sunsetColors[0];
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  };

  const visualizerTypes = [
    { id: 'bars', name: 'Bars', icon: '▬' },
    { id: 'wave', name: 'Wave', icon: '〰' },
    { id: 'circle', name: 'Circle', icon: '◯' },
    { id: 'particles', name: 'Particles', icon: '✦' }
  ];

  return (
    <motion.div 
      className="relative h-64 w-full rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Visualizer Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {visualizerTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => setVisualizerType(type.id)}
            className={`p-2 rounded-lg backdrop-blur-md border transition-all duration-200 ${
              visualizerType === type.id
                ? 'bg-orange-500/30 border-orange-400/50 text-orange-200'
                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={type.name}
          >
            <span className="text-sm">{type.icon}</span>
          </motion.button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Overlay gradient for glassmorphism effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />

      {/* Status indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-white/60 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-4xl mb-2">🎵</div>
            <div className="text-sm">Play music to see visualization</div>
          </motion.div>
        </div>
      )}

      {/* Loading state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-white/60 text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="text-sm">Initializing audio visualizer...</div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Visualizer;