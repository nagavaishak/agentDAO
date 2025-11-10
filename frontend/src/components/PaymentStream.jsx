'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ExternalLink } from 'lucide-react';

function PaymentStream({ payments }) {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-80 border-r border-white/10 bg-black/30 backdrop-blur-xl z-40 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
          <Coins className="w-5 h-5 text-cyan-400" />
          Live Transactions
        </h3>
        <p className="text-xs text-gray-500 mt-1">x402 Protocol</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <AnimatePresence mode="popLayout">
          {payments.map(function(payment, index) {
            return (
              <motion.div key={payment.id} layout initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1"></div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-cyan-400 font-mono text-sm font-bold">{payment.amount} SOL</span>
                        <span className="text-xs text-gray-500">x402</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">{payment.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PaymentStream;
