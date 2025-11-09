require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs'); 

// Import DAO components from parent directory
const { Connection, Keypair } = require('@solana/web3.js');
const Agent = require('../src/agents/Agent');
const DAO = require('../src/dao/DAO');
const { loadOrCreateWallet, sleep } = require('../src/utils/solana');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store active WebSocket clients
const clients = new Set();

// Broadcast to all connected clients
function broadcast(event) {
  const message = JSON.stringify(event);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  console.log('📡 Broadcast:', event.type);
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔌 New client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    clients.delete(ws);
  });

  // Send initial connection confirmation
  ws.send(JSON.stringify({ type: 'CONNECTED', data: { message: 'Connected to AgentDAO' } }));
});

// Global DAO state
let daoInstance = null;
let isSimulationRunning = false;

// API: Start simulation
app.post('/api/start-simulation', async (req, res) => {
  if (isSimulationRunning) {
    return res.status(400).json({ error: 'Simulation already running' });
  }

  isSimulationRunning = true;
  res.json({ message: 'Simulation started' });

  try {
    await runSimulation();
  } catch (error) {
    console.error('Simulation error:', error);
    broadcast({ type: 'ERROR', data: { message: error.message } });
  } finally {
    isSimulationRunning = false;
  }
});

// API: Get current DAO state
app.get('/api/dao-state', (req, res) => {
  if (!daoInstance) {
    return res.json({
      agents: [],
      proposals: [],
      treasury: 0,
      payments: []
    });
  }

  res.json({
    agents: daoInstance.getAgents(),
    proposals: daoInstance.getProposals(),
    stats: daoInstance.getStats(),
    payments: daoInstance.x402.listPayments()
  });
});

async function runSimulation() {
  console.log('\n🚀 Starting AgentDAO Simulation...\n');
  
  broadcast({ 
    type: 'SIMULATION_START', 
    data: { message: 'Initializing AgentDAO...' } 
  });

  // Connect to Solana
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );

  broadcast({ 
    type: 'STATUS', 
    data: { message: 'Connected to Solana Devnet' } 
  });

  // Define walletsPath ONCE at the top
  const walletsPath = path.join(__dirname, '..', 'wallets');

  // Load EXISTING funded treasury wallet
  const treasuryPath = path.join(walletsPath, 'dao_treasury_wallet.json');
  
  const treasuryWallet = (() => {
    if (fs.existsSync(treasuryPath)) {
      console.log('📂 Loading existing treasury wallet');
      const secretKey = JSON.parse(fs.readFileSync(treasuryPath, 'utf-8'));
      return Keypair.fromSecretKey(Uint8Array.from(secretKey));
    }
    return loadOrCreateWallet('dao_treasury');
  })();
  
  // Initialize DAO
  daoInstance = new DAO(treasuryWallet, connection);
  
  broadcast({ 
    type: 'DAO_INITIALIZED', 
    data: { 
      treasury: treasuryWallet.publicKey.toString() 
    } 
  });

  await sleep(2000);

  /// Create agents - USE EXISTING FUNDED WALLETS + NEW ONES
  const agents = [
    new Agent(
      'Alice_Progressive',
      'You are progressive and favor innovation. You support proposals that push boundaries and take calculated risks.',
      path.join(walletsPath, 'Alice_Progressive_wallet.json')
    ),
    new Agent(
      'Bob_Conservative', 
      'You are conservative and cautious. You prefer stable, proven approaches and are skeptical of radical changes.',
      path.join(walletsPath, 'Bob_Conservative_wallet.json')
    ),
    new Agent(
      'Charlie_Pragmatic',
      'You are pragmatic and data-driven. You analyze cost-benefit ratios and vote based on measurable outcomes.',
      path.join(walletsPath, 'Charlie_Pragmatic_wallet.json')
    ),
    new Agent(
      'Diana_Visionary',
      'You are a visionary idealist. You care deeply about long-term impact and ethical implications over short-term gains.',
      path.join(walletsPath, 'Diana_Visionary_wallet.json')
    ),
    new Agent(
      'Eve_Skeptic',
      'You are a healthy skeptic. You question assumptions, demand evidence, and prefer incremental progress over grand visions.',
      path.join(walletsPath, 'Eve_Skeptic_wallet.json')
    )
  ];

  for (const agent of agents) {
    broadcast({ 
      type: 'AGENT_CREATED', 
      data: agent.toJSON() 
    });
    await sleep(1000);
  }

  // Agents join DAO
  console.log('\n👥 Agents joining DAO...\n');
  broadcast({ type: 'STATUS', data: { message: 'Agents joining DAO...' } });

  const joinStake = parseFloat(process.env.JOINING_STAKE_USDC) || 0.1;
  
  for (const agent of agents) {
    const success = await daoInstance.joinDAO(agent, joinStake);
    
    if (success) {
      broadcast({ 
        type: 'AGENT_JOINED', 
        data: {
          agent: agent.toJSON(),
          treasury: daoInstance.treasury
        }
      });

      // Broadcast payment with FULL signature
      const payments = daoInstance.x402.listPayments();
      if (payments.length > 0) {
        const lastPayment = payments[payments.length - 1];
        // Get full signature from payment requirements map
        const fullPayment = Array.from(daoInstance.x402.paymentRequests.values())
          .find(p => p.id === lastPayment.id);
        
        broadcast({
          type: 'PAYMENT',
          data: {
            ...lastPayment,
            signature: fullPayment?.signature || lastPayment.signature
          }
        });
      }
    }
    
    await sleep(2000);
  }

  // Create proposal
  console.log('\n📋 Creating Proposal...\n');
  broadcast({ type: 'STATUS', data: { message: 'Creating proposal...' } });

  await sleep(2000);

  const proposal = await daoInstance.createProposal(
    agents[0],
    'Build AI Research Lab',
    'Allocate funds to establish an AI research laboratory for advancing autonomous agent capabilities.',
    0.8,
    parseFloat(process.env.PROPOSAL_COST_USDC) || 0.01
  );

  if (proposal) {
    broadcast({ 
      type: 'PROPOSAL_CREATED', 
      data: proposal 
    });

    // Broadcast payment with FULL signature
      const payments = daoInstance.x402.listPayments();
      if (payments.length > 0) {
        const lastPayment = payments[payments.length - 1];
        // Get full signature from payment requirements map
        const fullPayment = Array.from(daoInstance.x402.paymentRequests.values())
          .find(p => p.id === lastPayment.id);
        
        broadcast({
          type: 'PAYMENT',
          data: {
            ...lastPayment,
            signature: fullPayment?.signature || lastPayment.signature
          }
        });
      }
  }

  await sleep(3000);

  // Voting phase
  console.log('\n🗳️  Voting Phase...\n');
  broadcast({ type: 'STATUS', data: { message: 'Agents are voting...' } });

  const voteCost = parseFloat(process.env.VOTING_COST_USDC) || 0.001;

  for (const agent of agents) {
    broadcast({ 
      type: 'AGENT_THINKING', 
      data: { agentName: agent.name } 
    });

    const context = `The DAO is voting on: "${proposal.title}". Description: ${proposal.description}. Treasury has ${daoInstance.treasury} SOL. This proposal requests ${proposal.requestedAmount} SOL.`;
    const options = ['Vote FOR this proposal', 'Vote AGAINST this proposal'];
    
    const decision = await agent.makeDecision(context, options);
    const voteChoice = decision.includes('1') ? 'for' : 'against';

    await daoInstance.vote(agent, proposal.id, voteChoice, voteCost);

    broadcast({ 
      type: 'VOTE_CAST', 
      data: {
        agent: agent.name,
        vote: voteChoice,
        proposal: {
          id: proposal.id,
          votesFor: proposal.votesFor,
          votesAgainst: proposal.votesAgainst
        }
      }
    });

    // Broadcast payment with FULL signature
      const payments = daoInstance.x402.listPayments();
      if (payments.length > 0) {
        const lastPayment = payments[payments.length - 1];
        // Get full signature from payment requirements map
        const fullPayment = Array.from(daoInstance.x402.paymentRequests.values())
          .find(p => p.id === lastPayment.id);
        
        broadcast({
          type: 'PAYMENT',
          data: {
            ...lastPayment,
            signature: fullPayment?.signature || lastPayment.signature
          }
        });
      }

    await sleep(3000);
  }

  // Execute proposal
  console.log('\n⚖️  Executing Proposal...\n');
  broadcast({ type: 'STATUS', data: { message: 'Executing proposal...' } });

  await sleep(2000);

  const passed = await daoInstance.executeProposal(proposal.id);

  broadcast({ 
    type: 'PROPOSAL_EXECUTED', 
    data: {
      proposalId: proposal.id,
      status: proposal.status,
      passed: passed
    }
  });

  if (passed) {
    const payments = daoInstance.x402.listPayments();
    broadcast({
      type: 'PAYMENT',
      data: payments[payments.length - 1]
    });
  }

  await sleep(2000);

  // Send final stats
  const stats = daoInstance.getStats();
  broadcast({ 
    type: 'SIMULATION_COMPLETE', 
    data: {
      stats: stats,
      agents: daoInstance.getAgents(),
      proposals: daoInstance.getProposals()
    }
  });

  console.log('\n✅ Simulation Complete!\n');
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 AgentDAO API Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});