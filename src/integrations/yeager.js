/**
 * Yeager API Integration for AgentDAO
 * Allows agents to autonomously purchase services via HTTP-402 payments
 */
const { LAMPORTS_PER_SOL } = require('@solana/web3.js');

class YeagerAPI {
  constructor() {
    this.baseUrl = process.env.YEAGER_API_URL || 'https://api.yeager.ai';
    this.services = {
      'data-analysis': { cost: 0.1, description: 'Market data analysis' },
      'proposal-evaluation': { cost: 0.05, description: 'Proposal feasibility check' },
      'research': { cost: 0.15, description: 'Deep research on topic' }
    };
  }

  /**
   * Agent autonomously calls Yeager API to execute a service
   * @param {Agent} agent - The agent making the call
   * @param {string} serviceName - Service to execute
   * @param {string} taskDetails - Details of the task
   * @param {number} payment - Payment amount in USDC
   */
  async callService(agent, serviceName, taskDetails, payment, x402System, treasuryPublicKey) {
    console.log('\n🔌 YEAGER API INTEGRATION');
    console.log(`👤 Agent: ${agent.name}`);
    console.log(`🛠️  Service: ${serviceName}`);
    console.log(`💰 Payment: ${payment} USDC via x402`);
    console.log(`📋 Task: ${taskDetails}`);

    // CREATE REAL X402 PAYMENT
    if (x402System && treasuryPublicKey) {
      const paymentReq = x402System.createPaymentRequirement(
        payment,
        `Yeager API: ${serviceName} for ${agent.name}`,
        'yeager-api-service'
      );

      const paymentResult = await x402System.makePayment(
        paymentReq,
        agent.wallet,
        treasuryPublicKey
      );

      if (!paymentResult.success) {
        console.error('❌ Yeager payment failed');
        return null;
      }
    }

    // Simulate API latency
    await this.sleep(2000);

    const service = this.services[serviceName] || this.services['data-analysis'];
    
    const result = {
      success: true,
      agent: agent.name,
      service: serviceName,
      cost: payment,
      result: this.generateServiceResult(serviceName, taskDetails),
      timestamp: new Date().toISOString(),
      transactionId: `yeager-${Date.now()}`
    };

    console.log(`✅ Yeager API Response:`);
    console.log(`   ${result.result}`);
    console.log(`   Cost: ${result.cost} USDC`);
    
    return result;
  }

  /**
   * Generate realistic service results based on service type
   */
  generateServiceResult(serviceName, taskDetails) {
    const results = {
      'data-analysis': `Analysis complete: ${taskDetails} shows 78% feasibility. Market conditions favorable. Risk score: Medium (4/10). Recommendation: PROCEED with caution.`,
      'proposal-evaluation': `Evaluation complete: ${taskDetails} has strong merit. Expected ROI: 145% over 6 months. Community support: HIGH. Risk factors: 2 identified.`,
      'research': `Research complete: ${taskDetails} - 15 relevant sources analyzed. Key findings: Innovation potential HIGH, technical feasibility MEDIUM, resource requirements MODERATE.`
    };

    return results[serviceName] || results['data-analysis'];
  }

  /**
   * List available Yeager services
   */
  listServices() {
    return this.services;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = YeagerAPI;
