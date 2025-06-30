import React, { useEffect, useRef, useState } from 'react';
import { Film, BookOpen, Music } from 'lucide-react';

const ICONS = [Film, BookOpen, Music];
const ICON_COUNT = 4;
const TOTAL_ICONS = ICONS.length * ICON_COUNT;
const ICON_SIZE = 48;
const AREA_WIDTH = 1200;
const AREA_HEIGHT = 400;
const REPULSION_RADIUS = 120;
const REPULSION_STRENGTH = 80;
const FLOAT_SPEED = 0.5;

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const FloatingIcons: React.FC = () => {
  const [icons, setIcons] = useState(() => {
    // Randomize initial positions and directions
    let arr = [];
    for (let i = 0; i < TOTAL_ICONS; i++) {
      arr.push({
        x: getRandom(0, AREA_WIDTH - ICON_SIZE),
        y: getRandom(0, AREA_HEIGHT - ICON_SIZE),
        dx: getRandom(-FLOAT_SPEED, FLOAT_SPEED),
        dy: getRandom(-FLOAT_SPEED, FLOAT_SPEED),
        type: i % ICONS.length,
        id: i
      });
    }
    return arr;
  });
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById('floating-icons-area')?.getBoundingClientRect();
      if (rect) {
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setIcons(prevIcons => prevIcons.map(icon => {
        let { x, y, dx, dy } = icon;
        // Repulsion from mouse
        const dist = Math.hypot(x + ICON_SIZE/2 - mouse.current.x, y + ICON_SIZE/2 - mouse.current.y);
        if (dist < REPULSION_RADIUS) {
          const angle = Math.atan2(y + ICON_SIZE/2 - mouse.current.y, x + ICON_SIZE/2 - mouse.current.x);
          dx += Math.cos(angle) * (REPULSION_STRENGTH / (dist + 20));
          dy += Math.sin(angle) * (REPULSION_STRENGTH / (dist + 20));
        }
        // Move
        x += dx;
        y += dy;
        // Gentle float
        dx *= 0.98;
        dy *= 0.98;
        // Bounce off edges
        if (x < 0 || x > AREA_WIDTH - ICON_SIZE) dx = -dx;
        if (y < 0 || y > AREA_HEIGHT - ICON_SIZE) dy = -dy;
        x = Math.max(0, Math.min(AREA_WIDTH - ICON_SIZE, x));
        y = Math.max(0, Math.min(AREA_HEIGHT - ICON_SIZE, y));
        return { ...icon, x, y, dx, dy };
      }));
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div
      id="floating-icons-area"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: AREA_HEIGHT,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {icons.map(icon => {
        const IconComp = ICONS[icon.type];
        return (
          <IconComp
            key={icon.id}
            size={ICON_SIZE}
            style={{
              position: 'absolute',
              left: icon.x,
              top: icon.y,
              opacity: 0.18,
              color: '#fff',
              filter: 'drop-shadow(0 2px 8px #a855f7)',
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingIcons; 