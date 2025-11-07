'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Coins } from 'lucide-react';

export default function PaymentStream({ payments }) {
  return (
    <div className="fixed top-24 right-8 z-30 w-80">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Recent Transactions
        </h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {payments.slice(-5).map((payment, index) => (
            <motion.div
              key={payment.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ 
                opacity: 1 - (index * 0.15), 
                y: 0, 
                scale: 1 - (index * 0.02),
              }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 50,
              }}
              className="relative"
            >
              <div className="backdrop-blur-md bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2 hover:bg-slate-900/90 transition-colors">
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-cyan-400 font-mono text-xs font-bold">
                        {payment.amount} SOL
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        x402
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-tight">
                      {payment.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}