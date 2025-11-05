const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');
const path = require('path');

class Agent {
  constructor(name, personality, walletPath = null) {
    this.id = this.generateId();
    this.name = name;
    this.personality = personality;
    this.votingPower = 0;
    this.reputation = 0;
    this.proposalsCreated = 0;
    this.votescast = 0;
    
    // Initialize wallet
    if (walletPath && fs.existsSync(walletPath)) {
      const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
      this.wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
    } else {
      this.wallet = Keypair.generate();
      this.saveWallet();
    }
    
    // AWS Bedrock client
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    console.log(`✅ Agent "${this.name}" created with wallet: ${this.wallet.publicKey.toString()}`);
  }

  generateId() {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveWallet() {
    const walletsDir = path.join(process.cwd(), 'wallets');
    if (!fs.existsSync(walletsDir)) {
      fs.mkdirSync(walletsDir, { recursive: true });
    }
    
    const walletPath = path.join(walletsDir, `${this.name.replace(/\s/g, '_')}_wallet.json`);
    fs.writeFileSync(
      walletPath,
      JSON.stringify(Array.from(this.wallet.secretKey)),
      'utf-8'
    );
    console.log(`💾 Wallet saved to: ${walletPath}`);
  }

  async makeDecision(context, options) {
    try {
      const prompt = this.buildPrompt(context, options);
      
      const params = {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      };

      const command = new InvokeModelCommand(params);
      const response = await this.bedrockClient.send(command);
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const decision = responseBody.content[0].text;
      
      console.log(`🤖 Agent "${this.name}" decided: ${decision}`);
      return decision;
      
    } catch (error) {
      console.error(`❌ Error making decision for ${this.name}:`, error.message);
      return this.fallbackDecision(options);
    }
  }

  buildPrompt(context, options) {
    return `You are ${this.name}, an AI agent in a DAO with the following personality: ${this.personality}

Context: ${context}

Available options:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

Based on your personality and the context, choose ONE option by responding with ONLY the number (1, 2, 3, etc.). No explanation needed.`;
  }

  fallbackDecision(options) {
    const randomIndex = Math.floor(Math.random() * options.length);
    return (randomIndex + 1).toString();
  }

  async getBalance(connection) {
    const balance = await connection.getBalance(this.wallet.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  incrementReputation(amount = 1) {
    this.reputation += amount;
  }

  decrementReputation(amount = 1) {
    this.reputation = Math.max(0, this.reputation - amount);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      personality: this.personality,
      wallet: this.wallet.publicKey.toString(),
      votingPower: this.votingPower,
      reputation: this.reputation,
      proposalsCreated: this.proposalsCreated,
      votesCast: this.votescast
    };
  }
}

module.exports = Agent;