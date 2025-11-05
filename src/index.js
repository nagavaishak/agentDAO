require('dotenv').config();
const { Connection, Keypair } = require('@solana/web3.js');
const Agent = require('./agents/Agent');
const DAO = require('./dao/DAO');
const { airdropSOL, getBalance, loadOrCreateWallet, sleep } = require('./utils/solana');

async function main() {
  console.log('🚀 Starting AgentDAO - The First Autonomous AI Government\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // Connect to Solana Devnet
  const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    'confirmed'
  );
  console.log('🌐 Connected to Solana Devnet\n');

  // Create DAO Treasury Wallet
  const treasuryWallet = loadOrCreateWallet('dao_treasury');
  console.log(`🏛️  DAO Treasury: ${treasuryWallet.publicKey.toString()}\n`);

  // Airdrop SOL to treasury
  await airdropSOL(connection, treasuryWallet.publicKey, 5);
  await sleep(2000);

  // Initialize DAO
  const dao = new DAO(treasuryWallet, connection);
  console.log('\n═══════════════════════════════════════════════════════\n');

  // Create 5 AI Agents with different personalities
  console.log('🤖 Creating AI Agents...\n');
  
  const agents = [
    new Agent(
      'Alice_Progressive',
      'You are progressive and favor innovation. You support proposals that push boundaries and take calculated risks.'
    ),
    new Agent(
      'Bob_Conservative', 
      'You are conservative and cautious. You prefer stable, proven approaches and are skeptical of radical changes.'
    )
  ];

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Airdrop SOL to all agents
console.log('💰 Using pre-funded wallets...\n');
// for (const agent of agents) {
//   await airdropSOL(connection, agent.wallet.publicKey, 3);
//   await sleep(1000);
// }

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Agents join the DAO
  console.log('👥 Agents joining DAO...\n');
  const joinStake = parseFloat(process.env.JOINING_STAKE_USDC) || 0.5;
  
  for (const agent of agents) {
    await dao.joinDAO(agent, joinStake);
    await sleep(1000);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Agent 1 creates a proposal
  console.log('📋 PROPOSAL CREATION PHASE\n');
  
  const proposal1 = await dao.createProposal(
    agents[0],
    'Build AI Research Lab',
    'Allocate funds to establish an AI research laboratory for advancing autonomous agent capabilities.',
    0.8,
    parseFloat(process.env.PROPOSAL_COST_USDC) || 0.01
  );
  await sleep(1000);

  const proposal2 = await dao.createProposal(
    agents[3],
    'Community Education Program',
    'Fund educational initiatives to teach humans about AI agent economies.',
    0.6,
    parseFloat(process.env.PROPOSAL_COST_USDC) || 0.01
  );
  await sleep(1000);

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Agents vote autonomously
  console.log('🗳️  VOTING PHASE - Agents Making Autonomous Decisions\n');
  
  const voteCost = parseFloat(process.env.VOTING_COST_USDC) || 0.001;
  
  // Vote on Proposal 1
  console.log('\n📊 Voting on Proposal #1: "Build AI Research Lab"\n');
  
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    
    // Agent makes autonomous decision
    const context = `The DAO is voting on: "${proposal1.title}". Description: ${proposal1.description}. Treasury has ${dao.treasury} SOL. This proposal requests ${proposal1.requestedAmount} SOL.`;
    const options = ['Vote FOR this proposal', 'Vote AGAINST this proposal'];
    
    const decision = await agent.makeDecision(context, options);
    const voteChoice = decision.includes('1') ? 'for' : 'against';
    
    await dao.vote(agent, proposal1.id, voteChoice, voteCost);
    await sleep(1500);
  }

  await sleep(2000);

  // Vote on Proposal 2
  console.log('\n📊 Voting on Proposal #2: "Community Education Program"\n');
  
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    
    const context = `The DAO is voting on: "${proposal2.title}". Description: ${proposal2.description}. Treasury has ${dao.treasury} SOL. This proposal requests ${proposal2.requestedAmount} SOL.`;
    const options = ['Vote FOR this proposal', 'Vote AGAINST this proposal'];
    
    const decision = await agent.makeDecision(context, options);
    const voteChoice = decision.includes('1') ? 'for' : 'against';
    
    await dao.vote(agent, proposal2.id, voteChoice, voteCost);
    await sleep(1500);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Execute proposals
  console.log('⚖️  EXECUTION PHASE\n');
  
  await dao.executeProposal(proposal1.id);
  await sleep(2000);
  
  await dao.executeProposal(proposal2.id);
  await sleep(2000);

  console.log('\n═══════════════════════════════════════════════════════\n');

  // Display final statistics
  console.log('📊 FINAL DAO STATISTICS\n');
  
  const stats = dao.getStats();
  console.log(`Total Agents: ${stats.totalAgents}`);
  console.log(`Total Proposals: ${stats.totalProposals}`);
  console.log(`Active Proposals: ${stats.activeProposals}`);
  console.log(`Passed Proposals: ${stats.passedProposals}`);
  console.log(`Rejected Proposals: ${stats.rejectedProposals}`);
  console.log(`Treasury Balance: ${stats.treasuryBalance} SOL`);
  
  console.log('\n💳 x402 PAYMENT STATISTICS\n');
  console.log(`Total x402 Payments: ${stats.x402Payments.total}`);
  console.log(`Completed: ${stats.x402Payments.completed}`);
  console.log(`Pending: ${stats.x402Payments.pending}`);
  console.log(`Failed: ${stats.x402Payments.failed}`);
  console.log(`Total Volume: ${stats.x402Payments.totalVolume.toFixed(3)} SOL`);
  
  console.log('\n📋 x402 PAYMENT HISTORY\n');
  const paymentHistory = dao.x402.listPayments();
  paymentHistory.slice(0, 10).forEach((payment, idx) => {
    console.log(`${idx + 1}. ${payment.description}`);
    console.log(`   Amount: ${payment.amount} SOL | Status: ${payment.status.toUpperCase()}`);
  });
  
  console.log('\n👥 AGENT STATISTICS\n');
  const agentStats = dao.getAgents();
  agentStats.forEach(agent => {
    console.log(`\n${agent.name}:`);
    console.log(`  Reputation: ${agent.reputation}`);
    console.log(`  Voting Power: ${agent.votingPower}`);
    console.log(`  Proposals Created: ${agent.proposalsCreated}`);
    console.log(`  Votes Cast: ${agent.votesCast}`);
  });

  console.log('\n═══════════════════════════════════════════════════════\n');
  console.log('✅ AgentDAO Simulation Complete!\n');
  console.log('🎉 The first autonomous AI government has spoken!\n');
  console.log('💳 All transactions powered by x402 Protocol\n');
}

// Run the simulation
main().catch(console.error);