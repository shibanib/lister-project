'use client';

import { useEffect, useState } from 'react';

interface RainingConfettiProps {
  show: boolean;
  darkMode: boolean;
}

type Fleck = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  horizontalSpeed: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  type: 'square' | 'fleck';
  maxLife: number;
  life: number;
};

export default function RainingConfetti({ show, darkMode }: RainingConfettiProps) {
  const [flecks, setFlecks] = useState<Fleck[]>([]);
  
  // Generate color based on theme
  const getRandomColor = () => {
    // Use the website's color scheme
    const colors = darkMode ? 
      ['#ffffff', '#f5f0e5', '#eeeeee', '#f8f8f8'] : // Whites and sepia in dark mode
      ['#000000', '#222222', '#333333', '#555555']; // Blacks and grays in light mode
      
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get random fleck type
  const getRandomType = () => {
    const types: ('square' | 'fleck')[] = ['square', 'fleck'];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Create new flecks
  const createFlecks = () => {
    if (!show) return;
    
    const newFlecks: Fleck[] = [];
    const screenWidth = window.innerWidth;
    
    // Create 7-12 flecks per batch
    const count = 7 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < count; i++) {
      const size = 2 + Math.floor(Math.random() * 4); // 2-5px size
      
      // Add more randomness to position to avoid straight lines
      const xOffset = Math.random() * 20 - 10; // -10 to +10 px offset
      
      newFlecks.push({
        id: Date.now() + Math.random(),
        x: Math.random() * screenWidth + xOffset,
        y: -size * 2, // Start just above viewport
        size,
        color: getRandomColor(),
        speed: 2 + Math.random() * 5, // Increased speed range from 1-3 to 2-7
        horizontalSpeed: Math.random() * 1 - 0.5, // -0.5 to +0.5 px per frame
        rotation: Math.random() * 360,
        rotationSpeed: -1 + Math.random() * 2,
        opacity: 0.7 + Math.random() * 0.3,
        type: getRandomType(),
        maxLife: 200 + Math.random() * 100, // Doubled lifespan
        life: 0
      });
    }
    
    setFlecks(prev => [...prev, ...newFlecks]);
  };

  // Update fleck positions
  const updateFlecks = () => {
    setFlecks(prev => 
      prev
        .map(fleck => {
          // Add a bit of randomness to the movement
          const jitter = Math.random() * 0.4 - 0.2; // Small random movement
          
          return {
            ...fleck,
            x: fleck.x + fleck.horizontalSpeed + jitter,
            y: fleck.y + fleck.speed + (Math.random() * 0.5),
            rotation: fleck.rotation + fleck.rotationSpeed,
            life: fleck.life + 1,
            // Fade out as life increases, but slower (only in last 30% of life)
            opacity: fleck.life > fleck.maxLife * 0.7 
              ? fleck.opacity * (1 - ((fleck.life - (fleck.maxLife * 0.7)) / (fleck.maxLife * 0.3)))
              : fleck.opacity,
          };
        })
        // Remove when below viewport or life exceeds maxLife
        .filter(fleck => 
          fleck.y < window.innerHeight * 1.5 && // Allow flecks to go further below viewport before removal
          fleck.life < fleck.maxLife
        )
    );
  };

  // Initialize and manage confetti
  useEffect(() => {
    if (show) {
      // Clear existing flecks
      setFlecks([]);
      
      // Create initial flecks
      createFlecks();
      
      // Continuous creation interval - longer duration (6 seconds)
      const creationInterval = setInterval(createFlecks, 200);
      
      // Automatically stop creating new confetti after 6 seconds
      const stopTimer = setTimeout(() => {
        clearInterval(creationInterval);
      }, 6000);
      
      // Clean up when component unmounts or show becomes false
      return () => {
        clearInterval(creationInterval);
        clearTimeout(stopTimer);
      };
    } else {
      // When show becomes false, keep existing flecks but stop creating new ones
      // They will naturally fade out or fall offscreen
    }
  }, [show]);

  // Animation loop
  useEffect(() => {
    if (flecks.length === 0) return;
    
    const animationFrame = requestAnimationFrame(updateFlecks);
    return () => cancelAnimationFrame(animationFrame);
  }, [flecks]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {flecks.map(fleck => {
        if (fleck.type === 'square') {
          // Square confetti
          return (
            <div
              key={fleck.id}
              className="absolute"
              style={{
                left: `${fleck.x}px`,
                top: `${fleck.y}px`,
                width: `${fleck.size}px`,
                height: `${fleck.size}px`,
                backgroundColor: fleck.color,
                opacity: fleck.opacity,
                transform: `rotate(${fleck.rotation}deg)`,
              }}
            />
          );
        } else {
          // Irregular fleck with more randomness
          return (
            <div
              key={fleck.id}
              className="absolute"
              style={{
                left: `${fleck.x}px`,
                top: `${fleck.y}px`,
                width: `${fleck.size * (1.2 + Math.random() * 0.5)}px`, // More variable width
                height: `${fleck.size}px`,
                backgroundColor: fleck.color,
                opacity: fleck.opacity,
                transform: `rotate(${fleck.rotation}deg) skew(${15 + Math.random() * 25}deg)`,
                borderRadius: `${Math.random() > 0.6 ? (Math.random() * 50) + '%' : '0'}`,
              }}
            />
          );
        }
      })}
    </div>
  );
} 