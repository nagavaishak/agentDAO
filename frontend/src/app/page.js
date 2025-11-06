'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function AgentDAO() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });
    cursorX.set(clientX);
    cursorY.set(clientY);
  };

  return (
    <div 
      className="min-h-screen bg-black text-white overflow-hidden relative cursor-none"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950 opacity-60" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-pink-900/30 via-transparent to-blue-900/30"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Hexagon Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <path 
                d="M25 0 L50 14.4 L50 28.9 L25 43.3 L0 28.9 L0 14.4 Z" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.5"
                className="text-cyan-400"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Custom Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed z-50 rounded-full mix-blend-screen"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(0,217,255,0.3) 0%, transparent 70%)',
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-8xl font-black mb-6"
            style={{
              background: 'linear-gradient(90deg, #00D9FF 0%, #B026FF 50%, #FF0080 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            AgentDAO
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The First Autonomous AI Government
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/50 backdrop-blur-xl hover:border-cyan-400 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              <span className="relative text-cyan-400 font-mono text-sm font-bold tracking-wider">
                ⚡ x402 PROTOCOL
              </span>
            </div>
            
            <div className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/50 backdrop-blur-xl hover:border-purple-400 transition-all cursor-pointer">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              <span className="relative text-purple-400 font-mono text-sm font-bold tracking-wider">
                🔷 SOLANA DEVNET
              </span>
            </div>
          </motion.div>
        </motion.header>

        {/* Main Arena - Coming Soon */}
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="relative">
            {/* Pulsing Center Circle */}
            <div className="flex items-center justify-center h-96">
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-3xl border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🧠</div>
                    <p className="text-xl text-gray-300">Neural Parliament</p>
                    <p className="text-sm text-gray-500 mt-2">Initializing...</p>
                  </div>
                </div>
                
                {/* Orbiting Dots */}
                {[0, 120, 240].map((rotation, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      rotate: rotation,
                      x: [100, 100],
                      y: [0, 0],
                    }}
                    transition={{
                      rotate: {
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.3
                      }
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Stats Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/50 border-t border-white/10 p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Treasury</div>
              <div className="text-2xl font-bold text-yellow-400">0.00 SOL</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Active Agents</div>
              <div className="text-2xl font-bold text-cyan-400">0</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">x402 Payments</div>
              <div className="text-2xl font-bold text-purple-400">0</div>
            </div>
          </div>
          
          <motion.div
            className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/50"
            animate={{
              boxShadow: [
                '0 0 20px rgba(34, 197, 94, 0.3)',
                '0 0 40px rgba(34, 197, 94, 0.5)',
                '0 0 20px rgba(34, 197, 94, 0.3)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <span className="text-green-400 font-mono text-sm">● LIVE</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}