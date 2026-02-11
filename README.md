# AegisTreasury

An automated treasury management protocol for DeFi optimization.

## Overview

AegisTreasury is a smart contract system that automates treasury allocation decisions through on-chain controllers, strategy adapters, and a backend agent that monitors market conditions and executes rebalancing proposals.

## Success Criteria

- ✅ TreasuryController smart contract manages allocation registry and execution
- ✅ StrategyAdapter interface enables pluggable yield strategies
- ✅ Guardian/Pauser/Timelock contract provides security controls
- ✅ Backend agent watches on-chain data, runs decision engine, and proposes/executes rebalancing
- ✅ Web dashboard displays balances, allocations, and proposal management
- ✅ End-to-end demo on local fork or BNB testnet

## One-Page Pitch

**Problem:** DeFi protocols hold millions in idle treasury assets that could earn yield but face governance friction, security risks, and lack of automated management tools.

**Solution:** AegisTreasury provides a secure, automated treasury management system with:
- On-chain controller with Guardian/Pauser/Timelock security layers
- Pluggable strategy adapters for any yield protocol
- Rule-based decision engine with configurable thresholds
- Multisig approval flow for high-risk operations
- Real-time dashboard for transparency and control

**Value Prop:** Turn idle treasury into revenue-generating assets while maintaining security and governance oversight.

## Tech Stack

- **Smart Contracts:** Solidity, Hardhat
- **Backend:** Node.js, TypeScript
- **Frontend:** React
- **Network:** BNB Chain (testnet deployment target)

## Quick Start

```bash
# Terminal 1: Start Hardhat node
cd contracts && HOME=/tmp/hardhat-home npx hardhat node

# Terminal 2: Deploy contracts
cd contracts && HOME=/tmp/hardhat-home npx hardhat run scripts/deploy-local-fork.js --network localhost

# Terminal 3: Start backend
cd backend && HOME=/tmp/npm-backend npm run dev

# Terminal 4: Start frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000` for the dashboard, or see [QUICK_DEMO_GUIDE.md](QUICK_DEMO_GUIDE.md) for detailed demo instructions.

## Project Structure

```
aegis-treasury/
├── contracts/          # Solidity smart contracts
├── backend/            # Node.js/TypeScript agent & API
├── frontend/           # React dashboard
├── tests/              # Integration tests
└── scripts/            # Deployment scripts
```

## Phase 1 Status

**Phase 1 (Core MVP) - 98% Complete** ✅

### Completed Components
- ✅ **Smart Contracts** (22/22 tests passing)
  - TreasuryController, Guardian, StrategyAdapter, ExampleStrategy, MockERC20
  - Commit: `13ab5c8`
- ✅ **Backend Agent & API**
  - On-chain watcher, price oracle, decision engine, proposal storage
  - Complete API with 8 endpoints
  - Commits: `672b3ae`, `b3a6d4f`
- ✅ **Frontend Dashboard**
  - React app with Dashboard, Proposals pages
  - Components: BalanceCard, ProposalCard, WalletStatus, Layout
  - Build: 609KB bundle (178KB gzipped)
  - Commit: `ab3384d`
- ✅ **Integration & Demo**
  - Local network deployment (Hardhat localhost:8545)
  - All services running (Backend: localhost:3001, Frontend: localhost:3000)
  - Demo proposals included for showcase

### Demo Ready
- Full system running locally with demo data
- See [QUICK_DEMO_GUIDE.md](QUICK_DEMO_GUIDE.md) for 5-minute demo walkthrough
- Try the live demo at `http://localhost:3000` when running

## License

MIT
