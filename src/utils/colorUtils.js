// Color utility functions for generating sunset-themed gradients and visualizer colors

/**
 * Sunset color palette with various shades and tints
 */
export const SUNSET_COLORS = {
  primary: {
    orange: '#FF6B35',
    pink: '#FF8E9B',
    purple: '#A8E6CF',
    yellow: '#FFD23F',
    red: '#FF3333',
    coral: '#FF7F7F'
  },
  gradients: {
    warm: ['#FF6B35', '#FF8E9B', '#FFD23F'],
    cool: ['#FF8E9B', '#A8E6CF', '#87CEEB'],
    vibrant: ['#FF3333', '#FF6B35', '#FFD23F'],
    soft: ['#FFB6C1', '#FFA07A', '#F0E68C']
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(255, 107, 53, 0.3)'
  }
};

/**
 * Convert HSL values to RGB
 */
export const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= h && h < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= h && h < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= h && h < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= h && h < 5/6) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

/**
 * Convert RGB values to hex color
 */
export const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Generate a sunset color based on frequency data
 */
export const getFrequencyColor = (frequency, amplitude) => {
  // Map frequency to hue (0-360)
  const hue = Math.floor((frequency / 255) * 60 + 10); // Orange to yellow range
  
  // Map amplitude to saturation and lightness
  const saturation = Math.floor(70 + (amplitude / 255) * 30); // 70-100%
  const lightness = Math.floor(50 + (amplitude / 255) * 40); // 50-90%
  
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  return rgbToHex(r, g, b);
};

/**
 * Generate gradient colors for visualizer bars
 */
export const generateVisualizerColors = (dataArray) => {
  return dataArray.map((value, index) => {
    const normalizedIndex = index / dataArray.length;
    
    // Create sunset gradient effect
    if (normalizedIndex < 0.3) {
      // Yellow to orange
      const ratio = normalizedIndex / 0.3;
      const [r, g, b] = hslToRgb(45 - ratio * 15, 85, 60 + value / 255 * 30);
      return rgbToHex(r, g, b);
    } else if (normalizedIndex < 0.7) {
      // Orange to pink
      const ratio = (normalizedIndex - 0.3) / 0.4;
      const [r, g, b] = hslToRgb(30 - ratio * 15, 80, 55 + value / 255 * 35);
      return rgbToHex(r, g, b);
    } else {
      // Pink to purple
      const ratio = (normalizedIndex - 0.7) / 0.3;
      const [r, g, b] = hslToRgb(15 + ratio * 285, 75, 50 + value / 255 * 40);
      return rgbToHex(r, g, b);
    }
  });
};

/**
 * Create a radial gradient for circular visualizations
 */
export const createRadialGradient = (ctx, centerX, centerY, radius) => {
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  
  gradient.addColorStop(0, 'rgba(255, 210, 63, 0.8)'); // Yellow center
  gradient.addColorStop(0.3, 'rgba(255, 107, 53, 0.7)'); // Orange
  gradient.addColorStop(0.6, 'rgba(255, 142, 155, 0.6)'); // Pink
  gradient.addColorStop(1, 'rgba(168, 230, 207, 0.4)'); // Light blue-green
  
  return gradient;
};

/**
 * Create a linear gradient for waveform visualizations
 */
export const createLinearGradient = (ctx, x1, y1, x2, y2) => {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  
  gradient.addColorStop(0, '#FF6B35'); // Orange
  gradient.addColorStop(0.25, '#FFD23F'); // Yellow
  gradient.addColorStop(0.5, '#FF8E9B'); // Pink
  gradient.addColorStop(0.75, '#A8E6CF'); // Light green
  gradient.addColorStop(1, '#87CEEB'); // Sky blue
  
  return gradient;
};

/**
 * Generate colors for particle effects
 */
export const getParticleColors = () => {
  const colors = [
    '#FF6B35', // Orange
    '#FF8E9B', // Pink
    '#FFD23F', // Yellow
    '#FF7F7F', // Coral
    '#FFA07A', // Light salmon
    '#FFB6C1'  // Light pink
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Interpolate between two colors
 */
export const interpolateColor = (color1, color2, factor) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return rgbToHex(r, g, b);
};

/**
 * Convert hex color to RGB object
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Get glassmorphism background with sunset colors
 */
export const getGlassmorphismBackground = (opacity = 0.1) => {
  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: `0 8px 32px 0 rgba(255, 107, 53, 0.3)`,
  };
};

/**
 * Generate dynamic color based on audio intensity
 */
export const getDynamicColor = (intensity, baseHue = 30) => {
  const hue = baseHue + (intensity * 0.5); // Slight hue shift based on intensity
  const saturation = 70 + (intensity * 0.3); // Increase saturation with intensity
  const lightness = 50 + (intensity * 0.4); // Increase brightness with intensity
  
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  return rgbToHex(r, g, b);
};

/**
 * Create CSS gradient string for backgrounds
 */
export const createCSSGradient = (direction = 'to right', colors = SUNSET_COLORS.gradients.warm) => {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
};