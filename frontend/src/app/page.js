'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import AgentCard from '../components/AgentCard';
import ProposalCard from '../components/ProposalCard';
import PaymentStream from '../components/PaymentStream.jsx';

export default function AgentDAO() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Waiting to connect...');
  
  const [daoState, setDaoState] = useState({
    agents: [],
    proposals: [],
    treasury: 0,
    payments: [],
    stats: null
  });

  const wsRef = useRef(null);
  
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

    // Connect to WebSocket
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
      console.log('✅ Connected to AgentDAO');
      setIsConnected(true);
      setStatusMessage('Connected to AgentDAO');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setStatusMessage('Connection error');
    };

    ws.onclose = () => {
      console.log('🔌 Disconnected from AgentDAO');
      setIsConnected(false);
      setStatusMessage('Disconnected');
      
      // Attempt reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  };

  const handleWebSocketMessage = (message) => {
    console.log('📨 Message:', message.type, message.data);

    switch (message.type) {
      case 'SIMULATION_START':
      case 'STATUS':
        setStatusMessage(message.data.message);
        break;

      case 'DAO_INITIALIZED':
        setStatusMessage('DAO Initialized');
        break;

      case 'AGENT_CREATED':
      case 'AGENT_JOINED':
        setDaoState(prev => {
          const existingIndex = prev.agents.findIndex(a => a.id === message.data.agent?.id || a.id === message.data.id);
          const newAgent = message.data.agent || message.data;
          
          if (existingIndex >= 0) {
            const updated = [...prev.agents];
            updated[existingIndex] = newAgent;
            return { ...prev, agents: updated };
          }
          
          return {
            ...prev,
            agents: [...prev.agents, newAgent],
            treasury: message.data.treasury || prev.treasury
          };
        });
        break;

      case 'PROPOSAL_CREATED':
        setDaoState(prev => ({
          ...prev,
          proposals: [...prev.proposals, message.data]
        }));
        break;

      case 'VOTE_CAST':
        setDaoState(prev => ({
          ...prev,
          proposals: prev.proposals.map(p => 
            p.id === message.data.proposal.id 
              ? { ...p, ...message.data.proposal }
              : p
          )
        }));
        setStatusMessage(`${message.data.agent} voted ${message.data.vote.toUpperCase()}`);
        break;

      case 'PROPOSAL_EXECUTED':
        setDaoState(prev => ({
          ...prev,
          proposals: prev.proposals.map(p => 
            p.id === message.data.proposalId 
              ? { ...p, status: message.data.status }
              : p
          )
        }));
        setStatusMessage(`Proposal ${message.data.passed ? 'PASSED' : 'REJECTED'}`);
        break;

      case 'PAYMENT':
        setDaoState(prev => ({
          ...prev,
          payments: [...prev.payments, { ...message.data, id: Date.now() + Math.random() }]
        }));
        break;

      case 'SIMULATION_COMPLETE':
        setIsSimulationRunning(false);
        setStatusMessage('Simulation Complete!');
        setDaoState(prev => ({
          ...prev,
          stats: message.data.stats,
          agents: message.data.agents,
          proposals: message.data.proposals
        }));
        break;

      case 'AGENT_THINKING':
        setStatusMessage(`${message.data.agentName} is thinking...`);
        break;
    }
  };

  const startSimulation = async () => {
    if (!isConnected || isSimulationRunning) return;
    
    setIsSimulationRunning(true);
    setStatusMessage('Starting simulation...');
    
    // Reset state
    setDaoState({
      agents: [],
      proposals: [],
      treasury: 0,
      payments: [],
      stats: null
    });

    try {
      const response = await fetch('http://localhost:3000/api/start-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start simulation');
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      setStatusMessage('Error starting simulation');
      setIsSimulationRunning(false);
    }
  };

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
      <div className="relative z-10 ml-80 p-8">
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
            className="flex items-center justify-center gap-6 mb-8"
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

          {/* Start Button */}
          <motion.button
            onClick={startSimulation}
            disabled={!isConnected || isSimulationRunning}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
              isConnected && !isSimulationRunning
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white cursor-pointer shadow-lg shadow-green-500/50'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={isConnected && !isSimulationRunning ? { scale: 1.05 } : {}}
            whileTap={isConnected && !isSimulationRunning ? { scale: 0.95 } : {}}
          >
            {isSimulationRunning ? '⏳ Simulation Running...' : '▶️ Start Simulation'}
          </motion.button>

          {/* Status Message */}
          <motion.div 
            className="mt-4 text-sm text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {statusMessage}
          </motion.div>
        </motion.header>

        {/* Agent Cards */}
        {daoState.agents.length > 0 && (
          <motion.div 
            className="max-w-7xl mx-auto mb-32"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {daoState.agents.map((agent, index) => (
                <AgentCard key={agent.id} agent={agent} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Proposals */}
        {daoState.proposals.length > 0 && (
          <motion.div 
            className="max-w-5xl mx-auto mb-32"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Active Proposals</h2>
              <p className="text-gray-400">Agents are voting autonomously</p>
            </div>

            <div className="space-y-6">
              {daoState.proposals.map((proposal, index) => (
                <ProposalCard key={proposal.id} proposal={proposal} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Stream */}
        <PaymentStream payments={daoState.payments} />

      {/* Bottom Stats Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/50 border-t border-white/10 p-4 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Treasury</div>
              <div className="text-2xl font-bold text-yellow-400">
                {daoState.stats?.treasuryBalance?.toFixed(3) || daoState.treasury.toFixed(3)} SOL
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Active Agents</div>
              <div className="text-2xl font-bold text-cyan-400">{daoState.agents.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">x402 Payments</div>
              <div className="text-2xl font-bold text-purple-400">
                {daoState.stats?.x402Payments?.completed || daoState.payments.length}
              </div>
            </div>
          </div>
          
          <motion.div
            className={`px-4 py-2 rounded-full border ${
              isConnected ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'
            }`}
            animate={isConnected ? {
              boxShadow: [
                '0 0 20px rgba(34, 197, 94, 0.3)',
                '0 0 40px rgba(34, 197, 94, 0.5)',
                '0 0 20px rgba(34, 197, 94, 0.3)',
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <span className={`font-mono text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              ● {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}