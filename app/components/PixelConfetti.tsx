'use client';

// Pixel Fireworks Component
// A pixel art style fireworks/confetti celebration effect
import { useEffect, useState } from 'react';

interface PixelConfettiProps {
  show: boolean;
  darkMode: boolean;
}

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
  life: number;
  maxLife: number;
  type: 'square' | 'ascii' | 'pixel'; // Add type for different appearances
  character?: string; // For ASCII particles
};

export default function PixelConfetti({ show, darkMode }: PixelConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Generate random colors appropriate for the theme but more minimal
  const getRandomColor = () => {
    // Use the minimal neo-brutalist color scheme
    const colors = darkMode ? 
      ['#ffffff', '#f5f0e5'] : // White and sepia in dark mode
      ['#000000', '#333333']; // Black and dark gray in light mode
      
    // Occasionally add a single accent color for minimal visual interest
    if (Math.random() > 0.8) {
      if (darkMode) {
        colors.push('#ffcc00'); // Gold accent for dark mode
      } else {
        colors.push('#ff6b6b'); // Red accent for light mode
      }
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Generate a random ASCII character for the fireworks display
  const getRandomCharacter = () => {
    // Use more minimal set of characters
    const characters = ['■', '□', '▪', '▫', '▲', '▼', '+', '×'];
    return characters[Math.floor(Math.random() * characters.length)];
  };

  // Get random particle type - bias toward squares and pixels for minimalism
  const getRandomType = () => {
    // Higher probability for square and pixel types
    const types: ('square' | 'ascii' | 'pixel')[] = ['square', 'square', 'pixel', 'pixel', 'ascii'];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Create a new batch of particles
  const createParticles = () => {
    const newParticles: Particle[] = [];
    const center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    
    // Create fewer burst points for a more minimal effect
    const burstPoints = [
      { x: center.x, y: center.y },
      { x: center.x - 120, y: center.y - 80 },
      { x: center.x + 120, y: center.y - 100 },
    ];
    
    for (const burstPoint of burstPoints) {
      // Reduce number of particles per burst for a more minimal effect
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        const size = Math.floor(Math.random() * 2) * 2 + 2; // Smaller sizes for minimalism
        const life = 0;
        const maxLife = 40 + Math.random() * 80; // Slightly shorter lifespan
        const type = getRandomType();
        
        newParticles.push({
          id: Date.now() + Math.random(),
          x: burstPoint.x,
          y: burstPoint.y,
          size,
          color: getRandomColor(),
          speed,
          angle,
          life,
          maxLife,
          type,
          character: type === 'ascii' ? getRandomCharacter() : undefined,
        });
      }
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Update particle positions and lifecycle
  const updateParticles = () => {
    setParticles(prev => 
      prev
        .map(particle => {
          // Apply gravity effect
          const gravity = 0.1;
          const newAngle = particle.angle + (particle.life > 10 ? gravity * 0.01 : 0);
          
          return {
            ...particle,
            x: particle.x + Math.cos(particle.angle) * particle.speed,
            y: particle.y + Math.sin(particle.angle) * particle.speed + (particle.life > 20 ? gravity : 0),
            life: particle.life + 1,
            angle: newAngle,
            speed: particle.speed * 0.98, // Slow down over time
          };
        })
        .filter(particle => particle.life < particle.maxLife)
    );
  };

  // Initialize fireworks effect when show prop becomes true
  useEffect(() => {
    if (show) {
      // Clear any existing particles
      setParticles([]);
      
      // Create initial burst
      createParticles();
      
      // Add more bursts over time - but only a few for minimalism
      const burstInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          createParticles();
        }
      }, 1500);
      
      // Add a cleanup timeout to ensure all particles are removed after the animation
      const cleanupTimeout = setTimeout(() => {
        setParticles([]);
        clearInterval(burstInterval);
      }, 8000); // Cleanup after 8 seconds
      
      // Clean up interval and timeout
      return () => {
        clearInterval(burstInterval);
        clearTimeout(cleanupTimeout);
      };
    } else {
      // When show becomes false, immediately clear particles
      setParticles([]);
    }
  }, [show]);

  // Animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    
    const animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, [particles]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30" style={{ imageRendering: 'pixelated' }}>
      {particles.map(particle => {
        if (particle.type === 'ascii') {
          // ASCII character particles
          return (
            <div
              key={particle.id}
              className="absolute pixel-confetti-particle flex items-center justify-center"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                fontSize: `${particle.size * 2}px`,
                color: particle.color,
                opacity: 1 - particle.life / particle.maxLife,
                transform: 'translate(-50%, -50%) rotate(0deg)',
                textShadow: `0 0 ${particle.size}px ${particle.color}`,
                fontFamily: 'monospace',
              }}
            >
              {particle.character}
            </div>
          );
        } else if (particle.type === 'pixel') {
          // Pixel art pattern particles
          const pixelSize = Math.max(1, Math.floor(particle.size / 2));
          return (
            <div
              key={particle.id}
              className="absolute pixel-confetti-particle"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size * 2}px`,
                height: `${particle.size * 2}px`,
                opacity: 1 - particle.life / particle.maxLife,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div style={{ 
                width: `${pixelSize}px`, 
                height: `${pixelSize}px`, 
                backgroundColor: particle.color,
                position: 'absolute',
                top: 0,
                left: 0,
                boxShadow: `
                  ${pixelSize}px 0 0 ${particle.color},
                  0 ${pixelSize}px 0 ${particle.color},
                  ${pixelSize}px ${pixelSize}px 0 ${particle.color}
                `
              }} />
            </div>
          );
        } else {
          // Default square particles
          return (
            <div
              key={particle.id}
              className="absolute pixel-confetti-particle"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: 1 - particle.life / particle.maxLife,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        }
      })}
    </div>
  );
} 