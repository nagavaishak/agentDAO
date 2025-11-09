'use client';

import { motion } from 'framer-motion';
import { FileText, DollarSign, Users, CheckCircle, XCircle } from 'lucide-react';

export default function ProposalCard({ proposal, index }) {
  const statusColors = {
    active: {
      bg: 'from-blue-500/20 to-purple-500/20',
      border: 'border-blue-500/50',
      badge: 'bg-blue-500',
      text: 'text-blue-400'
    },
    passed: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/50',
      badge: 'bg-green-500',
      text: 'text-green-400'
    },
    rejected: {
      bg: 'from-red-500/20 to-pink-500/20',
      border: 'border-red-500/50',
      badge: 'bg-red-500',
      text: 'text-red-400'
    }
  };

  const colors = statusColors[proposal.status] || statusColors.active;
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 50;
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className="relative group"
    >
      {/* Spotlight Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Card */}
      <div className={`relative backdrop-blur-xl bg-gradient-to-br ${colors.bg} rounded-3xl border-2 ${colors.border} p-8 overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Header */}
        <div className="relative flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center`}
              animate={{
                boxShadow: proposal.status === 'active' 
                  ? ['0 0 20px rgba(59, 130, 246, 0.5)', '0 0 40px rgba(59, 130, 246, 0.8)', '0 0 20px rgba(59, 130, 246, 0.5)']
                  : 'none'
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className={`w-7 h-7 ${colors.text}`} />
            </motion.div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500">Proposal #{proposal.number}</span>
                <div className={`px-2 py-0.5 rounded-full ${colors.badge} text-xs font-bold text-white uppercase`}>
                  {proposal.status}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {proposal.title}
              </h3>
            </div>
          </div>

          {/* Creator */}
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Created by</div>
            <div className="text-sm font-bold text-purple-400">{proposal.creatorName}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          {proposal.description}
        </p>

        {/* Requested Amount */}
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-black/30 border border-white/10 w-fit">
          <DollarSign className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-gray-400">Requesting</span>
          <span className="text-xl font-bold text-yellow-400">{proposal.requestedAmount} SOL</span>
        </div>

        {/* Vote Battle Arena */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-green-400">FOR: {proposal.votesFor}</span>
            <span className="text-gray-500">{totalVotes} Total Votes</span>
            <span className="text-red-400">AGAINST: {proposal.votesAgainst}</span>
          </div>

          {/* Vote Progress Bar */}
          <div className="relative h-8 rounded-full overflow-hidden bg-black/50 border border-white/10">
            {/* FOR Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${forPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-400"
              style={{
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
              }}
            />

            {/* AGAINST Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${againstPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-pink-400"
              style={{
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
              }}
            />

            {/* Center Line */}
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/30" />

            {/* Percentages */}
            <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold text-white">
              <span>{forPercentage.toFixed(1)}%</span>
              <span>{againstPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Voters */}
        <div className="mt-6 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">{proposal.voters?.length || 5} agents voted</span>
        </div>

        {/* Result Badge for Completed Proposals */}
        {proposal.status !== 'active' && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute top-4 right-4"
          >
            {proposal.status === 'passed' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-bold">
                <CheckCircle className="w-5 h-5" />
                <span>PASSED</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white font-bold">
                <XCircle className="w-5 h-5" />
                <span>REJECTED</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}