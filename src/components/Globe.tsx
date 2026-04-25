import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';

interface GlobeProps {
  onRegionSelect?: (region: string) => void;
  selectedRegion?: string | null;
}

const REGION_COORDS: Record<string, [number, number]> = {
  north_america: [-110.9747, 32.2226], // Tucson, AZ
  europe: [9.1859, 45.4654], // Milan/Europe hub
  asia: [106.2782, 38.4664], // Ningxia, China
  india: [80.2707, 13.0827], // Chennai, India
};

const Globe: React.FC<GlobeProps> = ({ onRegionSelect, selectedRegion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<[number, number, number]>([0, -20, 0]);
  const [world, setWorld] = useState<any>(null);

  useEffect(() => {
    fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
      .then(response => response.json())
      .then(data => setWorld(feature(data, data.objects.countries)));
  }, []);

  useEffect(() => {
    if (!world) return;
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const width = canvas.width;
      const height = canvas.height;

      // Update rotation
      rotationRef.current[0] += 0.2; // Slow rotation
      
      const projection = d3.geoOrthographic()
        .scale(width / 2.2)
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3.geoPath(projection, context);

      context.clearRect(0, 0, width, height);

      // Background Sphere
      context.beginPath();
      context.arc(width / 2, height / 2, width / 2.2, 0, 2 * Math.PI);
      context.fillStyle = '#0a1a15';
      context.fill();

      // Render land
      context.beginPath();
      path(world);
      context.fillStyle = '#1A4D3E';
      context.fill();
      context.strokeStyle = '#ffffff10';
      context.lineWidth = 0.5;
      context.stroke();

      // Render Graticule
      const graticule = d3.geoGraticule();
      context.beginPath();
      path(graticule());
      context.strokeStyle = '#ffffff05';
      context.stroke();

      // Render Points
      Object.entries(REGION_COORDS).forEach(([key, coords]) => {
        const [lon, lat] = coords;
        const p = projection([lon, lat]);
        if (p) {
          const isVisible = d3.geoDistance([lon, lat], [-rotationRef.current[0], -rotationRef.current[1]]) < Math.PI / 2;
          
          if (isVisible) {
            context.beginPath();
            context.arc(p[0], p[1], key === selectedRegion ? 6 : 3, 0, 2 * Math.PI);
            context.fillStyle = key === selectedRegion ? '#E26D5C' : '#ffffff80';
            context.shadowBlur = key === selectedRegion ? 15 : 0;
            context.shadowColor = '#E26D5C';
            context.fill();
            context.shadowBlur = 0;

            if (key === selectedRegion) {
               context.beginPath();
               context.arc(p[0], p[1], 12, 0, 2 * Math.PI);
               context.strokeStyle = '#E26D5C40';
               context.stroke();
            }
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedRegion, world]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
       <canvas 
         ref={canvasRef} 
         width={500} 
         height={500} 
         className="max-w-full h-auto cursor-grab active:cursor-grabbing"
       />
    </div>
  );
};

export default Globe;
