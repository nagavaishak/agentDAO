const x402Payment = require('../utils/x402Payment');
const { sendTransaction } = require('../utils/solana');
const YeagerAPI = require('../integrations/yeager');

class DAO {
  constructor(treasuryWallet, connection) {
    this.treasuryWallet = treasuryWallet;
    this.connection = connection;
    this.members = new Map(); // agentId -> { agent, stake, joinedAt }
    this.proposals = new Map(); // proposalId -> proposal
    this.votes = new Map(); // proposalId -> Map(agentId -> vote)
    this.proposalCounter = 0;
    this.treasury = 0;
    
    // Initialize x402 payment system
    this.x402 = new x402Payment(connection);
    
    // Initialize Yeager API for agent service calls
    this.yeagerAPI = new YeagerAPI();
    
    console.log(`🏛️  DAO initialized with treasury: ${treasuryWallet.publicKey.toString()}`);
    console.log('💳 x402 Payment System: ACTIVE');
  }

  /**
   * Agent joins the DAO by paying membership stake via x402
   */
  async joinDAO(agent, stakeAmount) {
    if (this.members.has(agent.id)) {
      console.log(`⚠️  Agent "${agent.name}" is already a member!`);
      return false;
    }

    console.log(`\n👤 Agent "${agent.name}" attempting to join DAO...`);

    // Create x402 payment requirement
    const paymentReq = this.x402.createPaymentRequirement(
      stakeAmount,
      `DAO Membership Stake for ${agent.name}`,
      'dao-membership'
    );

    // Make payment
    const result = await this.x402.makePayment(
      paymentReq,
      agent.wallet,
      this.treasuryWallet.publicKey
    );

    if (result.success) {
      // Verify payment
      const verification = await this.x402.verifyPayment(paymentReq.id);
      
      if (verification.verified) {
        this.members.set(agent.id, {
          agent: agent,
          stake: stakeAmount,
          joinedAt: new Date(),
          votingPower: stakeAmount
        });

        this.treasury += stakeAmount;

        console.log(`✅ Agent "${agent.name}" joined DAO via x402!`);
        console.log(`💰 Treasury balance: ${this.treasury} SOL`);
        return true;
      }
    }

    console.log(`❌ Agent "${agent.name}" failed to join DAO`);
    return false;
  }

  /**
   * Agent creates a proposal via x402 payment
   */
  async createProposal(agent, title, description, requestedAmount, creationFee) {
    if (!this.members.has(agent.id)) {
      console.log(`⚠️  Agent "${agent.name}" is not a DAO member!`);
      return null;
    }

    console.log(`\n📝 Agent "${agent.name}" creating proposal...`);

    // Create x402 payment requirement
    const paymentReq = this.x402.createPaymentRequirement(
      creationFee,
      `Proposal Creation Fee: "${title}"`,
      'proposal-creation'
    );

    // Make payment
    const result = await this.x402.makePayment(
      paymentReq,
      agent.wallet,
      this.treasuryWallet.publicKey
    );

    if (!result.success) {
      console.log(`❌ Proposal creation failed - payment unsuccessful`);
      return null;
    }

    this.treasury += creationFee;

    this.proposalCounter++;
    const proposalId = this.proposalCounter;

    const proposal = {
      id: proposalId,
      title: title,
      description: description,
      proposer: agent.id,
      requestedAmount: requestedAmount,
      status: 'active',
      votesFor: 0,
      votesAgainst: 0,
      createdAt: new Date(),
      executedAt: null
    };

    this.proposals.set(proposalId, proposal);
    this.votes.set(proposalId, new Map());

    console.log(`✅ Proposal #${proposalId} created via x402: "${title}"`);
    console.log(`💰 Proposal fee paid: ${creationFee} SOL`);

    return proposal;
  }

  /**
   * Agent votes on a proposal via x402 payment
   */
  async vote(agent, proposalId, voteChoice, votingFee) {
    if (!this.members.has(agent.id)) {
      console.log(`⚠️  Agent "${agent.name}" is not a DAO member!`);
      return false;
    }

    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      console.log(`⚠️  Proposal #${proposalId} does not exist!`);
      return false;
    }

    if (proposal.status !== 'active') {
      console.log(`⚠️  Proposal #${proposalId} is not active!`);
      return false;
    }

    const proposalVotes = this.votes.get(proposalId);
    if (proposalVotes.has(agent.id)) {
      console.log(`⚠️  Agent "${agent.name}" has already voted!`);
      return false;
    }

    console.log(`\n🗳️  Agent "${agent.name}" voting on Proposal #${proposalId}...`);

    // Create x402 payment requirement
    const paymentReq = this.x402.createPaymentRequirement(
      votingFee,
      `Vote on Proposal #${proposalId} by ${agent.name}`,
      'vote'
    );

    // Make payment
    const result = await this.x402.makePayment(
      paymentReq,
      agent.wallet,
      this.treasuryWallet.publicKey
    );

    if (!result.success) {
      console.log(`❌ Vote failed - payment unsuccessful`);
      return false;
    }

    this.treasury += votingFee;

    // Record vote with voting power
    const member = this.members.get(agent.id);
    const votingPower = member.votingPower;

    proposalVotes.set(agent.id, {
      choice: voteChoice,
      power: votingPower,
      timestamp: new Date()
    });

    // Update proposal vote counts
    if (voteChoice === 'for') {
      proposal.votesFor += votingPower;
    } else {
      proposal.votesAgainst += votingPower;
    }

    console.log(`✅ Vote recorded via x402: ${voteChoice.toUpperCase()}`);
    console.log(`📊 Current votes - For: ${proposal.votesFor}, Against: ${proposal.votesAgainst}`);

    return true;
  }

  /**
   * Execute a proposal if it has passed
   */
  async executeProposal(proposalId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      console.log(`⚠️  Proposal #${proposalId} does not exist!`);
      return false;
    }

    if (proposal.status !== 'active') {
      console.log(`⚠️  Proposal #${proposalId} is not active!`);
      return false;
    }

    console.log(`\n⚖️  Executing Proposal #${proposalId}...`);

    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    // Calculate quorum based on total voting power, not member count
    const totalVotingPower = Array.from(this.members.values())
      .reduce((sum, m) => sum + m.votingPower, 0);
    const quorumMet = totalVotes >= (totalVotingPower * 0.5); // 50% of voting power

    if (!quorumMet) {
      proposal.status = 'failed';
      console.log(`❌ Proposal #${proposalId} FAILED - Quorum not met`);
      return false;
    }

    const passed = proposal.votesFor > proposal.votesAgainst;

    if (passed) {
      proposal.status = 'passed';
      
      // Execute the proposal (transfer funds if needed)
      if (proposal.requestedAmount > 0 && proposal.requestedAmount <= this.treasury) {
        this.treasury -= proposal.requestedAmount;
        console.log(`✅ Proposal #${proposalId} PASSED`);
        console.log(`💰 Transferred ${proposal.requestedAmount} SOL from treasury`);
        console.log(`💰 Treasury balance: ${this.treasury} SOL`);
      } else {
        console.log(`✅ Proposal #${proposalId} PASSED (no fund transfer)`);
      }

      proposal.executedAt = new Date();
      return true;
    } else {
      proposal.status = 'rejected';
      console.log(`❌ Proposal #${proposalId} REJECTED`);
      return false;
    }
  }

  /**
   * Agent calls Yeager API to execute proposal tasks
   * THIS IS THE NEW YEAGER INTEGRATION
   */
  async executeProposalViaYeager(agent, proposal, serviceName = 'proposal-evaluation') {
    console.log(`\n🤖 Agent "${agent.name}" executing proposal via Yeager API...`);
    
    const payment = 0.1; // 0.1 USDC for service
    
    try {
      const result = await this.yeagerAPI.callService(
        agent,
        serviceName,
        proposal.title,
        payment
      );
      
      return result;
    } catch (error) {
      console.error('❌ Yeager API call failed:', error.message);
      return null;
    }
  }

  /**
   * Get list of available Yeager services
   */
  getYeagerServices() {
    return this.yeagerAPI.listServices();
  }

  /**
   * Get all DAO members
   */
  getMembers() {
    return Array.from(this.members.values()).map(m => ({
      id: m.agent.id,
      name: m.agent.name,
      stake: m.stake,
      votingPower: m.votingPower,
      joinedAt: m.joinedAt
    }));
  }

  /**
   * Get all agents with their details
   */
  getAgents() {
    return Array.from(this.members.values()).map(m => m.agent.toJSON());
  }

  /**
   * Get all proposals
   */
  getProposals() {
    return Array.from(this.proposals.values());
  }

  /**
   * Get DAO statistics
   */
  getStats() {
    return {
      totalMembers: this.members.size,
      treasuryBalance: this.treasury,
      totalProposals: this.proposals.size,
      activeProposals: Array.from(this.proposals.values()).filter(p => p.status === 'active').length,
      x402Payments: {
        total: this.x402.paymentRequests.size,
        completed: Array.from(this.x402.paymentRequests.values()).filter(p => p.status === 'completed').length,
        failed: Array.from(this.x402.paymentRequests.values()).filter(p => p.status === 'failed').length
      }
    };
  }
}

module.exports = DAO;