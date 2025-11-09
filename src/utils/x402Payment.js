const { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const { v4: uuidv4 } = require('uuid');

class X402Payment {
  constructor(connection, network = 'solana-devnet') {
    this.connection = connection;
    this.network = network;
    this.paymentRequests = new Map(); // Store payment requests
  }

  // Create a payment requirement (402 response)
  createPaymentRequirement(amount, description, resource) {
    const paymentId = uuidv4();
    
    const paymentRequirement = {
      id: paymentId,
      protocol: 'x402',
      version: '1.0',
      network: this.network,
      amount: amount, // in SOL
      description: description,
      resource: resource,
      timestamp: Date.now(),
      expiresAt: Date.now() + (60 * 1000), // 1 minute expiry
      status: 'pending'
    };

    this.paymentRequests.set(paymentId, paymentRequirement);
    
    console.log(`\n💳 x402 Payment Request Created:`);
    console.log(`   ID: ${paymentId.substring(0, 8)}...`);
    console.log(`   Amount: ${amount} SOL`);
    console.log(`   Description: ${description}`);
    
    return paymentRequirement;
  }

  // Agent makes payment via x402
  async makePayment(paymentRequirement, payerWallet, recipientPublicKey) {
    try {
      console.log(`\n💸 Processing x402 Payment...`);
      console.log(`   From: ${payerWallet.publicKey.toString().substring(0, 8)}...`);
      console.log(`   To: ${recipientPublicKey.toString().substring(0, 8)}...`);
      console.log(`   Amount: ${paymentRequirement.amount} SOL`);

      // Check if payment request is still valid
      if (paymentRequirement.status !== 'pending') {
        throw new Error('Payment request already processed');
      }

      if (Date.now() > paymentRequirement.expiresAt) {
        throw new Error('Payment request expired');
      }

      // Create Solana transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payerWallet.publicKey,
          toPubkey: recipientPublicKey,
          lamports: paymentRequirement.amount * LAMPORTS_PER_SOL,
        })
      );

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [payerWallet]);
      await this.connection.confirmTransaction(signature);

      // Update payment status
      paymentRequirement.status = 'completed';
      paymentRequirement.signature = signature;
      paymentRequirement.completedAt = Date.now();

      console.log('   ✅ Payment Completed!');
      console.log(`   Signature: ${signature}`); 

      return {
        success: true,
        signature: signature,
        paymentId: paymentRequirement.id
      };

    } catch (error) {
      paymentRequirement.status = 'failed';
      paymentRequirement.error = error.message;
      
      console.error(`   ❌ Payment Failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment was made
  async verifyPayment(paymentId) {
    const paymentRequirement = this.paymentRequests.get(paymentId);
    
    if (!paymentRequirement) {
      return { verified: false, reason: 'Payment request not found' };
    }

    if (paymentRequirement.status === 'completed') {
      // Verify on-chain
      try {
        const tx = await this.connection.getTransaction(paymentRequirement.signature);
        
        if (tx && tx.meta && !tx.meta.err) {
          console.log(`   ✅ Payment Verified On-Chain`);
          return { 
            verified: true, 
            signature: paymentRequirement.signature,
            amount: paymentRequirement.amount
          };
        }
      } catch (error) {
        console.error(`   ⚠️ Verification failed: ${error.message}`);
      }
    }

    return { verified: false, reason: 'Payment not completed or invalid' };
  }

  // Get payment statistics
  getPaymentStats() {
    const requests = Array.from(this.paymentRequests.values());
    
    return {
      total: requests.length,
      completed: requests.filter(r => r.status === 'completed').length,
      pending: requests.filter(r => r.status === 'pending').length,
      failed: requests.filter(r => r.status === 'failed').length,
      totalVolume: requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.amount, 0)
    };
  }

  // List all payment requests
  listPayments() {
    return Array.from(this.paymentRequests.values()).map(req => ({
      id: req.id,
      amount: req.amount,
      description: req.description,
      status: req.status,
      timestamp: new Date(req.timestamp).toISOString(),
      signature: req.signature || null
    }));
  }
}

module.exports = X402Payment;