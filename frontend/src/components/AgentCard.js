'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp } from 'lucide-react';

export default function AgentCard({ agent, index }) {
  // Personality-based color schemes
  const personalityColors = {
    Progressive: {
      primary: 'from-cyan-500 to-blue-500',
      glow: 'rgba(6, 182, 212, 0.5)',
      border: 'border-cyan-500/50',
      text: 'text-cyan-400'
    },
    Conservative: {
      primary: 'from-orange-500 to-red-500',
      glow: 'rgba(249, 115, 22, 0.5)',
      border: 'border-orange-500/50',
      text: 'text-orange-400'
    },
    Neutral: {
      primary: 'from-gray-500 to-slate-500',
      glow: 'rgba(100, 116, 139, 0.5)',
      border: 'border-gray-500/50',
      text: 'text-gray-400'
    },
    Visionary: {
      primary: 'from-purple-500 to-pink-500',
      glow: 'rgba(168, 85, 247, 0.5)',
      border: 'border-purple-500/50',
      text: 'text-purple-400'
    },
    Pragmatic: {
      primary: 'from-green-500 to-emerald-500',
      glow: 'rgba(34, 197, 94, 0.5)',
      border: 'border-green-500/50',
      text: 'text-green-400'
    }
  };

  const getPersonalityType = (name) => {
    if (name.includes('Progressive')) return 'Progressive';
    if (name.includes('Conservative')) return 'Conservative';
    if (name.includes('Neutral')) return 'Neutral';
    if (name.includes('Visionary')) return 'Visionary';
    if (name.includes('Pragmatic')) return 'Pragmatic';
    return 'Neutral';
  };

  const personality = getPersonalityType(agent.name);
  const colors = personalityColors[personality];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: colors.glow }}
      />

      {/* Card */}
      <div className={`relative backdrop-blur-xl bg-white/5 rounded-2xl border ${colors.border} p-6 overflow-hidden`}>
        {/* Personality Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors.primary} text-xs font-bold text-white`}>
            {personality}
          </div>
        </div>

        {/* Agent Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.primary} flex items-center justify-center text-3xl relative`}
            animate={{
              boxShadow: [
                `0 0 20px ${colors.glow}`,
                `0 0 40px ${colors.glow}`,
                `0 0 20px ${colors.glow}`,
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className="w-8 h-8 text-white" />
            
            {/* Status Pulse */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
          </motion.div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              {agent.name.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              {agent.wallet.substring(0, 8)}...
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {/* Voting Power */}
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-gray-500 uppercase">Power</span>
            </div>
            <div className={`text-lg font-bold ${colors.text}`}>
              {agent.votingPower}
            </div>
          </div>

          {/* Reputation */}
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-gray-500 uppercase">Rep</span>
            </div>
            <div className="text-lg font-bold text-green-400">
              {agent.reputation}
            </div>
          </div>

          {/* Votes Cast */}
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-gray-500 uppercase">Votes</span>
            </div>
            <div className="text-lg font-bold text-white">
              {agent.votesCast}
            </div>
          </div>
        </div>

        {/* Activity Indicator */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Proposals Created</span>
            <span className={`font-bold ${colors.text}`}>{agent.proposalsCreated}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}