const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { v4: uuidv4 } = require('uuid');
const X402Payment = require('../utils/x402Payment');

class DAO {
  constructor(treasuryWallet, connection) {
    this.treasuryWallet = treasuryWallet;
    this.connection = connection;
    this.agents = [];
    this.proposals = [];
    this.proposalCount = 0;
    this.treasury = 0;
    
    // Initialize x402 payment system
    this.x402 = new X402Payment(connection, 'solana-devnet');
    
    console.log(`🏛️  DAO initialized with treasury: ${treasuryWallet.publicKey.toString()}`);
    console.log(`💳 x402 Payment System: ACTIVE`);
  }

  // Agent joins the DAO by staking via x402
  async joinDAO(agent, stakeAmount) {
    try {
      console.log(`\n👤 Agent "${agent.name}" attempting to join DAO...`);
      
      // Check if agent already exists
      if (this.agents.find(a => a.id === agent.id)) {
        console.log(`⚠️  Agent "${agent.name}" is already a member!`);
        return false;
      }

      // Create x402 payment requirement
      const paymentReq = this.x402.createPaymentRequirement(
        stakeAmount,
        `DAO Membership Stake for ${agent.name}`,
        'dao/join'
      );

      // Agent makes payment via x402
      const paymentResult = await this.x402.makePayment(
        paymentReq,
        agent.wallet,
        this.treasuryWallet.publicKey
      );

      if (!paymentResult.success) {
        console.log(`❌ Payment failed: ${paymentResult.error}`);
        return false;
      }

      // Verify payment
      const verification = await this.x402.verifyPayment(paymentReq.id);
      
      if (!verification.verified) {
        console.log(`❌ Payment verification failed`);
        return false;
      }

      // Add agent to DAO
      agent.votingPower = stakeAmount;
      this.agents.push(agent);
      this.treasury += stakeAmount;
      
      console.log(`✅ Agent "${agent.name}" joined DAO via x402!`);
      console.log(`💰 Treasury balance: ${this.treasury} SOL`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error joining DAO:`, error.message);
      return false;
    }
  }

  // Agent creates a proposal (costs money via x402)
  async createProposal(agent, title, description, requestedAmount, proposalCost) {
    try {
      console.log(`\n📝 Agent "${agent.name}" creating proposal...`);
      
      // Check if agent is member
      if (!this.agents.find(a => a.id === agent.id)) {
        console.log(`⚠️  Agent "${agent.name}" is not a DAO member!`);
        return null;
      }

      // Create x402 payment requirement for proposal fee
      const paymentReq = this.x402.createPaymentRequirement(
        proposalCost,
        `Proposal Creation Fee: "${title}"`,
        'dao/proposal/create'
      );

      // Agent pays proposal creation fee via x402
      const paymentResult = await this.x402.makePayment(
        paymentReq,
        agent.wallet,
        this.treasuryWallet.publicKey
      );

      if (!paymentResult.success) {
        console.log(`❌ Payment failed: ${paymentResult.error}`);
        return null;
      }

      // Create proposal
      const proposal = {
        id: uuidv4(),
        number: ++this.proposalCount,
        creator: agent.id,
        creatorName: agent.name,
        title,
        description,
        requestedAmount,
        votesFor: 0,
        votesAgainst: 0,
        voters: [],
        status: 'active', // active, passed, rejected
        createdAt: Date.now(),
        paymentSignature: paymentResult.signature
      };

      this.proposals.push(proposal);
      agent.proposalsCreated++;
      this.treasury += proposalCost;
      
      console.log(`✅ Proposal #${proposal.number} created via x402: "${title}"`);
      console.log(`💰 Proposal fee paid: ${proposalCost} SOL`);
      
      return proposal;
      
    } catch (error) {
      console.error(`❌ Error creating proposal:`, error.message);
      return null;
    }
  }

  // Agent votes on a proposal (costs money via x402)
  async vote(agent, proposalId, voteChoice, voteCost) {
    try {
      const proposal = this.proposals.find(p => p.id === proposalId);
      
      if (!proposal) {
        console.log(`⚠️  Proposal not found!`);
        return false;
      }

      if (proposal.status !== 'active') {
        console.log(`⚠️  Proposal is not active!`);
        return false;
      }

      // Check if already voted
      if (proposal.voters.includes(agent.id)) {
        console.log(`⚠️  Agent "${agent.name}" already voted!`);
        return false;
      }

      console.log(`\n🗳️  Agent "${agent.name}" voting on Proposal #${proposal.number}...`);

      // Create x402 payment requirement for voting fee
      const paymentReq = this.x402.createPaymentRequirement(
        voteCost,
        `Vote on Proposal #${proposal.number} by ${agent.name}`,
        `dao/proposal/${proposalId}/vote`
      );

      // Agent pays voting fee via x402
      const paymentResult = await this.x402.makePayment(
        paymentReq,
        agent.wallet,
        this.treasuryWallet.publicKey
      );

      if (!paymentResult.success) {
        console.log(`❌ Payment failed: ${paymentResult.error}`);
        return false;
      }

      // Record vote
      if (voteChoice === 'for') {
        proposal.votesFor += agent.votingPower;
      } else {
        proposal.votesAgainst += agent.votingPower;
      }
      
      proposal.voters.push(agent.id);
      agent.votescast++;
      this.treasury += voteCost;
      
      console.log(`✅ Vote recorded via x402: ${voteChoice.toUpperCase()}`);
      console.log(`📊 Current votes - For: ${proposal.votesFor}, Against: ${proposal.votesAgainst}`);
      
      return true;
      
    } catch (error) {
      console.error(`❌ Error voting:`, error.message);
      return false;
    }
  }

  // Execute proposal if it passes (payout via x402)
  async executeProposal(proposalId) {
    const proposal = this.proposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      console.log(`⚠️  Proposal not found!`);
      return false;
    }

    if (proposal.status !== 'active') {
      console.log(`⚠️  Proposal already finalized!`);
      return false;
    }

    console.log(`\n⚖️  Executing Proposal #${proposal.number}...`);

    // Check if proposal passed (simple majority)
    if (proposal.votesFor > proposal.votesAgainst) {
      proposal.status = 'passed';
      
      // Pay out requested amount if treasury has enough
      if (this.treasury >= proposal.requestedAmount) {
        const creator = this.agents.find(a => a.id === proposal.creator);
        
        try {
          // Create x402 payment for proposal payout
          const paymentReq = this.x402.createPaymentRequirement(
            proposal.requestedAmount,
            `Proposal #${proposal.number} Payout to ${creator.name}`,
            `dao/proposal/${proposalId}/payout`
          );

          // DAO pays creator via x402
          const paymentResult = await this.x402.makePayment(
            paymentReq,
            this.treasuryWallet,
            creator.wallet.publicKey
          );

          if (paymentResult.success) {
            this.treasury -= proposal.requestedAmount;
            creator.incrementReputation(5);
            
            console.log(`✅ Proposal #${proposal.number} PASSED!`);
            console.log(`💸 Paid ${proposal.requestedAmount} SOL to ${creator.name} via x402`);
            console.log(`💰 Treasury balance: ${this.treasury} SOL`);
          }
          
        } catch (error) {
          console.error(`❌ Error paying proposal:`, error.message);
        }
      } else {
        console.log(`⚠️  Insufficient treasury funds!`);
      }
      
    } else {
      proposal.status = 'rejected';
      console.log(`❌ Proposal #${proposal.number} REJECTED`);
      
      const creator = this.agents.find(a => a.id === proposal.creator);
      creator.decrementReputation(1);
    }

    return proposal.status === 'passed';
  }

  getProposals() {
    return this.proposals;
  }

  getAgents() {
    return this.agents.map(a => a.toJSON());
  }

  async getTreasuryBalance() {
    const balance = await this.connection.getBalance(this.treasuryWallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  getStats() {
    const paymentStats = this.x402.getPaymentStats();
    
    return {
      totalAgents: this.agents.length,
      totalProposals: this.proposals.length,
      activeProposals: this.proposals.filter(p => p.status === 'active').length,
      passedProposals: this.proposals.filter(p => p.status === 'passed').length,
      rejectedProposals: this.proposals.filter(p => p.status === 'rejected').length,
      treasuryBalance: this.treasury,
      x402Payments: paymentStats
    };
  }
}

module.exports = DAO;