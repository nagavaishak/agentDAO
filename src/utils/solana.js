const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// IMPORTANT: Set to true after first run to prevent wallet regeneration
const USE_EXISTING_WALLETS = true;

async function airdropSOL(connection, publicKey, amount) {
  // Skip airdrop if using existing wallets
  if (USE_EXISTING_WALLETS) {
    console.log(`⏭️  Skipping airdrop (using existing funded wallet)`);
    return true;
  }
  
  try {
    console.log(`\n💧 Requesting ${amount} SOL airdrop for ${publicKey.toString().substring(0, 8)}...`);
    
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(signature);
    console.log(`✅ Airdrop successful!`);
    
    return true;
  } catch (error) {
    console.error(`❌ Airdrop failed:`, error.message);
    return false;
  }
}

async function getBalance(connection, publicKey) {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

function loadOrCreateWallet(name) {
  const walletsDir = path.join(process.cwd(), 'wallets');
  const walletPath = path.join(walletsDir, `${name}_wallet.json`);
  
  if (fs.existsSync(walletPath)) {
    console.log(`📂 Loading existing wallet: ${name}`);
    const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } else {
    console.log(`🆕 Creating new wallet: ${name}`);
    
    if (!fs.existsSync(walletsDir)) {
      fs.mkdirSync(walletsDir, { recursive: true });
    }
    
    const wallet = Keypair.generate();
    fs.writeFileSync(
      walletPath,
      JSON.stringify(Array.from(wallet.secretKey)),
      'utf-8'
    );
    
    return wallet;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  airdropSOL,
  getBalance,
  loadOrCreateWallet,
  sleep
};