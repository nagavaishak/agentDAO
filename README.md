# 🤖 AgentDAO - The First Autonomous AI Government

> **Where AI agents make governance decisions autonomously using x402 payments on Solana blockchain**

[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet?logo=solana)](https://solana.com)
[![x402](https://img.shields.io/badge/x402-Protocol-00D9FF)](https://x402.org)
[![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-orange?logo=amazon-aws)](https://aws.amazon.com/bedrock/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)

![AgentDAO Banner](./docs/banner.png)

---

## 🎯 What is AgentDAO?

**AgentDAO** is the world's first fully autonomous AI government where AI agents:
- 🧠 Make independent decisions using Claude 3.5 Sonnet
- 💰 Pay for actions using real x402 payments on Solana
- 🗳️ Vote on proposals based on their unique personalities
- ⚡ Execute governance without human intervention

**This is NOT a simulation.** Every payment is a real Solana transaction. Every vote is recorded on-chain. Every decision is made by AI.

---

## 🚀 Live Demo

🔗 **[Watch Demo Video](https://youtube.com/...)** *(Coming Soon)*

![Demo Screenshot](./docs/demo.gif)

---

## ✨ Key Features

### 🤖 Autonomous AI Agents
- **5 Unique Personalities:** Progressive, Conservative, Pragmatic, Visionary, Skeptic
- **AWS Bedrock Integration:** Real AI decision-making using Claude 3.5 Sonnet
- **Personality-Driven Voting:** Each agent has distinct values and voting patterns

### 💎 x402 Protocol Integration
- **Every action costs SOL:** Joining DAO, creating proposals, voting
- **Real blockchain transactions:** All verified on Solana Explorer
- **Payment transparency:** Live transaction feed with on-chain verification

### 🏛️ True DAO Governance
- **Proposal System:** Agents create proposals autonomously
- **Weighted Voting:** Voting power based on stake
- **Automatic Execution:** Proposals execute when they pass
- **Treasury Management:** Collective fund controlled by votes

### 🎨 Professional UI/UX
- **Real-time WebSocket updates:** Watch governance happen live
- **Live transaction feed:** See x402 payments flowing
- **Personality-based colors:** Visual agent identification
- **Battle-style voting bars:** Dramatic vote visualization
- **Cyberpunk aesthetic:** Modern, futuristic design

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  - Real-time visualization                                   │
│  - WebSocket connection                                      │
│  - Agent cards, proposals, payments                         │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js)                     │
│  - WebSocket server                                          │
│  - Simulation orchestration                                  │
│  - Event broadcasting                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   AI Agents  │  │  x402 System │  │     DAO      │
│   (Claude)   │  │   (Solana)   │  │  Governance  │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🛠️ Tech Stack

### Blockchain
- **Solana (Devnet):** Fast, low-cost blockchain for x402 payments
- **@solana/web3.js:** Solana JavaScript SDK
- **x402 Protocol:** Custom payment system for DAO actions

### AI/ML
- **AWS Bedrock:** Claude 3.5 Sonnet for agent decision-making
- **Anthropic Claude API:** Natural language reasoning

### Backend
- **Node.js + Express:** API server
- **WebSocket (ws):** Real-time event streaming
- **dotenv:** Environment configuration

### Frontend
- **Next.js 14:** React framework with App Router
- **Tailwind CSS:** Utility-first styling
- **Framer Motion:** Smooth animations
- **Lucide React:** Beautiful icons

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Solana CLI (optional, for wallet management)
- AWS Account with Bedrock access
- Phantom Wallet (for funding wallets)

### 1. Clone the Repository
```bash
git clone https://github.com/nagavaishak/agentDAO.git
cd agentDAO
```

### 2. Install Dependencies
```bash
# Root dependencies
npm install

# API dependencies
cd api
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**
```env
# AWS Bedrock
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com

# DAO Parameters
JOINING_STAKE_USDC=0.1
PROPOSAL_COST_USDC=0.01
VOTING_COST_USDC=0.001
```

### 4. Fund Wallets on Devnet
```bash
# Wallets are automatically created in /wallets directory
# Fund them using Solana Devnet faucet or Phantom wallet

# Example wallet addresses (yours will be different):
# Treasury: EKr5YHEPtkbCbJiJ7Z6oE3AnbKmmHnCFq5rzJQ6A9FER
# Alice: D8bjKQG7LypoEi8vSVDJavvPng99J1F8m9DvxfWuxY69
# Bob: 7mMSnCgdyogTKLGV15FbuT5uHRps7cNzPzEGZk3uohiJ
```

**Fund each wallet with ~1 SOL on Devnet:**
- Visit [Solana Devnet Faucet](https://faucet.solana.com/)
- Or use Phantom Wallet (switch to Devnet in settings)

### 5. Run the System

**Terminal 1 - API Server:**
```bash
cd api
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open browser:** `http://localhost:3001`

---

## 🎮 How to Use

1. **Click "Start Simulation"** - Agents will autonomously:
   - Join the DAO by paying membership stakes
   - Create proposals based on their personalities
   - Vote on proposals using AI reasoning
   - Execute approved proposals

2. **Watch the Magic Happen:**
   - 👈 **Left Sidebar:** Live x402 payment feed
   - 🎯 **Center:** Agents and proposals
   - 📊 **Bottom:** Treasury and stats

3. **Verify on Blockchain:**
   - Click any transaction in the feed
   - Opens Solana Explorer
   - See real on-chain confirmation

---

## 🤖 Meet the Agents

### Alice - The Progressive 🔵
*"Innovation over tradition. Let's push boundaries!"*
- Favors bold, innovative proposals
- Takes calculated risks
- High vote FOR rate on research/development

### Bob - The Conservative 🔴
*"Stability first. Prove it works."*
- Prefers proven approaches
- Risk-averse
- High vote AGAINST rate on radical changes

### Charlie - The Pragmatist 🟢
*"Show me the numbers."*
- Data-driven decisions
- Cost-benefit analysis
- Votes based on measurable outcomes

### Diana - The Visionary 🟣
*"Think long-term. Consider ethics."*
- Focuses on impact and values
- Ethical considerations
- Future-oriented thinking

### Eve - The Skeptic ⚪
*"Question everything. Demand evidence."*
- Challenges assumptions
- Requires strong proof
- Incremental progress over grand visions

---

## 💡 Example Scenarios

### Scenario 1: Research Lab Proposal
```
Proposal: "Build AI Research Lab" - Requesting 0.8 SOL

Alice (Progressive): ✅ FOR - "Innovation investment!"
Bob (Conservative): ❌ AGAINST - "Too risky, unproven"
Charlie (Pragmatic): ❌ AGAINST - "ROI unclear"
Diana (Visionary): ✅ FOR - "Long-term value"
Eve (Skeptic): ❌ AGAINST - "Need more evidence"

Result: REJECTED (2 FOR, 3 AGAINST)
```

### Scenario 2: Educational Program
```
Proposal: "Community Education Program" - Requesting 0.6 SOL

Alice: ✅ FOR - "Knowledge accessibility"
Bob: ✅ FOR - "Proven model"
Charlie: ✅ FOR - "Clear metrics"
Diana: ✅ FOR - "Societal impact"
Eve: ❌ AGAINST - "Budget concerns"

Result: PASSED (4 FOR, 1 AGAINST)
Treasury executes payment! 💰
```

---

## 🔐 Security Considerations

- **Devnet Only:** Currently runs on Solana Devnet (test environment)
- **Wallet Management:** Private keys stored locally in `/wallets` (NOT for production)
- **API Keys:** Keep AWS credentials secure in `.env`
- **Rate Limiting:** AWS Bedrock API has rate limits
- **Gas Fees:** Monitor SOL balances for transaction fees

**For Production:**
- Use hardware wallets or MPC solutions
- Implement proper key management (AWS KMS, HashiCorp Vault)
- Add authentication and authorization
- Deploy on Solana Mainnet with real USDC
- Add monitoring and alerting

---

## 🎯 Future Roadmap

### Phase 1: Enhanced Governance (Current)
- ✅ Basic DAO functionality
- ✅ AI agent voting
- ✅ x402 payment integration
- ✅ Real-time visualization

### Phase 2: Advanced Features
- [ ] Agent reputation system
- [ ] Multi-proposal voting
- [ ] Proposal amendments
- [ ] Delegation mechanism
- [ ] Advanced treasury management

### Phase 3: Scaling
- [ ] Deploy to Mainnet
- [ ] 10+ agents with specialized roles
- [ ] Cross-DAO collaboration
- [ ] Integration with existing DAOs
- [ ] Mobile app

### Phase 4: AI Evolution
- [ ] Agents learn from history
- [ ] Dynamic personality evolution
- [ ] Agent creation by agents
- [ ] Multi-model AI (GPT-4, Gemini, Claude)
- [ ] Debate mode before voting

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Areas we need help:**
- Additional agent personalities
- UI/UX improvements
- Smart contract integration
- Testing and documentation
- Mobile responsiveness

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🏆 Hackathon Submission

**Solana x402 Hackathon 2024**

**Category:** DeFi / Governance

**What makes this unique:**
1. **First autonomous AI government** using real blockchain transactions
2. **x402 protocol integration** for transparent payment tracking
3. **Personality-driven AI** agents with distinct decision-making styles
4. **Professional UI/UX** with real-time visualization
5. **Production-ready** architecture and code quality

---

## 📞 Contact

- **GitHub:** (https://github.com/nagavaishak)
- **Twitter:** (https://twitter.com/nagavaishak)
- **Email:** nagavaishak@gmail.com

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain infrastructure
- **x402 Protocol** - For the innovative payment system
- **Anthropic** - For Claude AI capabilities
- **AWS** - For Bedrock AI services

---

<div align="center">

**Built with ❤️ for the Solana x402 Hackathon**

*Making autonomous AI governance a reality, one transaction at a time.*

</div>