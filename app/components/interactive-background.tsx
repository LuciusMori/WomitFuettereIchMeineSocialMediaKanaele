"use client";

import { useEffect } from "react";

export function InteractiveBackground() {
  useEffect(() => {
    const container = document.getElementById('particles-container');
    if (!container) return;

    // Create floating particles
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';
      
      // Random size and color
      const size = Math.random() * 6 + 2;
      const colors = [
        'bg-indigo-400/30',
        'bg-purple-400/30', 
        'bg-pink-400/30',
        'bg-blue-400/30',
        'bg-cyan-400/30'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.className += ` ${color}`;
      
      // Random starting position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Animation
      particle.style.animation = `float ${5 + Math.random() * 10}s ease-in-out infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 15000);
    };

    // Create initial particles
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createParticle(), i * 200);
    }

    // Continue creating particles
    const interval = setInterval(createParticle, 1000);

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Create particle at mouse position
      if (Math.random() > 0.9) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-1 h-1 bg-indigo-500/50 rounded-full pointer-events-none';
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.animation = 'ping 1s cubic-bezier(0, 0, 0.2, 1)';
        
        container.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 1000);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null;
}
