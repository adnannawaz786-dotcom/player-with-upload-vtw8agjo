// Audio context management and analysis utilities
class AudioContextManager {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = null;
    this.source = null;
    this.gainNode = null;
    this.isInitialized = false;
  }

  // Initialize audio context and analyzer
  async initialize() {
    try {
      // Create audio context with fallback for older browsers
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      // Create analyzer node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // Connect analyzer to gain node
      this.analyser.connect(this.gainNode);

      // Set up data array for frequency data
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  // Connect audio element to analyzer
  connectAudioElement(audioElement) {
    if (!this.isInitialized) {
      console.warn('Audio context not initialized');
      return false;
    }

    try {
      // Disconnect previous source if exists
      if (this.source) {
        this.source.disconnect();
      }

      // Create new source from audio element
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);

      return true;
    } catch (error) {
      console.error('Failed to connect audio element:', error);
      return false;
    }
  }

  // Get frequency data for visualization
  getFrequencyData() {
    if (!this.analyser || !this.dataArray) {
      return new Uint8Array(128); // Return empty array as fallback
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  // Get time domain data for waveform visualization
  getTimeDomainData() {
    if (!this.analyser) {
      return new Uint8Array(128);
    }

    const timeData = new Uint8Array(this.bufferLength);
    this.analyser.getByteTimeDomainData(timeData);
    return timeData;
  }

  // Set volume (0-1)
  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Get current volume
  getVolume() {
    return this.gainNode ? this.gainNode.gain.value : 1;
  }

  // Resume audio context (required for user interaction)
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        return true;
      } catch (error) {
        console.error('Failed to resume audio context:', error);
        return false;
      }
    }
    return true;
  }

  // Get audio context state
  getContextState() {
    return this.audioContext ? this.audioContext.state : 'closed';
  }

  // Cleanup resources
  cleanup() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.dataArray = null;
    this.bufferLength = null;
    this.isInitialized = false;
  }

  // Get average frequency for simple visualizations
  getAverageFrequency() {
    const frequencyData = this.getFrequencyData();
    const sum = frequencyData.reduce((acc, value) => acc + value, 0);
    return sum / frequencyData.length;
  }

  // Get frequency data in ranges (bass, mid, treble)
  getFrequencyRanges() {
    const frequencyData = this.getFrequencyData();
    const length = frequencyData.length;
    
    const bassEnd = Math.floor(length * 0.1);
    const midEnd = Math.floor(length * 0.4);
    
    const bass = frequencyData.slice(0, bassEnd);
    const mid = frequencyData.slice(bassEnd, midEnd);
    const treble = frequencyData.slice(midEnd);

    return {
      bass: bass.reduce((acc, val) => acc + val, 0) / bass.length,
      mid: mid.reduce((acc, val) => acc + val, 0) / mid.length,
      treble: treble.reduce((acc, val) => acc + val, 0) / treble.length
    };
  }

  // Check if audio is playing (based on frequency activity)
  isAudioActive() {
    const averageFreq = this.getAverageFrequency();
    return averageFreq > 5; // Threshold for detecting audio activity
  }

  // Get normalized frequency data (0-1 range)
  getNormalizedFrequencyData() {
    const frequencyData = this.getFrequencyData();
    return Array.from(frequencyData).map(value => value / 255);
  }

  // Get peak frequency
  getPeakFrequency() {
    const frequencyData = this.getFrequencyData();
    return Math.max(...frequencyData);
  }

  // Apply audio filters (basic EQ simulation)
  applyEqualizer(bass = 0, mid = 0, treble = 0) {
    if (!this.audioContext || !this.source) return;

    try {
      // Create filter nodes
      const lowFilter = this.audioContext.createBiquadFilter();
      const midFilter = this.audioContext.createBiquadFilter();
      const highFilter = this.audioContext.createBiquadFilter();

      // Configure filters
      lowFilter.type = 'lowshelf';
      lowFilter.frequency.value = 200;
      lowFilter.gain.value = bass;

      midFilter.type = 'peaking';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 1;
      midFilter.gain.value = mid;

      highFilter.type = 'highshelf';
      highFilter.frequency.value = 3000;
      highFilter.gain.value = treble;

      // Connect filters in series
      this.source.disconnect();
      this.source.connect(lowFilter);
      lowFilter.connect(midFilter);
      midFilter.connect(highFilter);
      highFilter.connect(this.analyser);

    } catch (error) {
      console.error('Failed to apply equalizer:', error);
    }
  }
}

// Create singleton instance
const audioContextManager = new AudioContextManager();

// Utility functions for audio processing
export const initializeAudio = () => audioContextManager.initialize();

export const connectAudio = (audioElement) => 
  audioContextManager.connectAudioElement(audioElement);

export const getFrequencyData = () => audioContextManager.getFrequencyData();

export const getTimeDomainData = () => audioContextManager.getTimeDomainData();

export const getFrequencyRanges = () => audioContextManager.getFrequencyRanges();

export const getNormalizedFrequencyData = () => 
  audioContextManager.getNormalizedFrequencyData();

export const setVolume = (volume) => audioContextManager.setVolume(volume);

export const getVolume = () => audioContextManager.getVolume();

export const resumeAudioContext = () => audioContextManager.resumeContext();

export const getAverageFrequency = () => audioContextManager.getAverageFrequency();

export const getPeakFrequency = () => audioContextManager.getPeakFrequency();

export const isAudioActive = () => audioContextManager.isAudioActive();

export const getContextState = () => audioContextManager.getContextState();

export const applyEqualizer = (bass, mid, treble) => 
  audioContextManager.applyEqualizer(bass, mid, treble);

export const cleanupAudio = () => audioContextManager.cleanup();

// Export the manager instance for direct access if needed
export default audioContextManager;