# AegisTreasury Quick Demo Guide

## System Status
All components are running and ready for demo:
- ✅ Hardhat Node: `localhost:8545`
- ✅ Smart Contracts: Deployed locally
- ✅ Backend API: `http://localhost:3001`
- ✅ Frontend Dashboard: `http://localhost:3000`

## Quick Start (3 Commands)

Open 3 terminals:

```bash
# Terminal 1: Start Hardhat node
cd aegis-treasury/contracts
HOME=/tmp/hardhat-home npx hardhat node

# Terminal 2: Deploy contracts (run once)
cd aegis-treasury/contracts
HOME=/tmp/hardhat-home npx hardhat run scripts/deploy-local-fork.js --network localhost

# Terminal 3: Start backend
cd aegis-treasury/backend
HOME=/tmp/npm-backend npx ts-node src/index.ts

# Terminal 4: Start frontend
cd aegis-treasury/frontend
npm run dev
```

## Demo Flow (5 Minutes)

### 1. Open Dashboard (30 seconds)
Navigate to: `http://localhost:3000`

**What you'll see:**
- Treasury Dashboard with BNB balance display
- Target vs current allocation visualization
- Allocation breakdown by strategy
- Recent activity and system status

### 2. Check Proposals (1 minute)
Navigate to: `http://localhost:3000/proposals`

**What you'll see:**
- List of proposals (2 demo proposals included)
- Proposal #1: Executed - "Deposit 5 BNB to staking strategy"
- Proposal #2: Pending - "Harvest staking rewards from strategy"
- Status indicators (Executed, Pending, Failed)

### 3. Create New Proposal (1 minute)
Click "Create Proposal" button

**Fill in:**
- Type: Deposit
- Amount: 1000000000000000000000 (1 BNB in wei)
- Strategy: Select from dropdown
- Reason: "Add additional BNB to staking"

Submit and see it appear in the proposals list with "Pending" status.

### 4. Execute Proposal (1 minute)
Click "Execute" on a pending proposal

**What happens:**
- Transaction submitted via relayer
- Status changes to "Executed"
- Allocation updates reflect the new balances
- Dashboard shows updated totals

### 5. System Monitoring (30 seconds)
Check the backend terminal output to see:
- Allocation checks running every 5 minutes
- Proposal execution logs
- Treasury balance updates

## API Endpoints (For Testing)

```bash
# Health check
curl http://localhost:3001/api/status

# Get balances
curl http://localhost:3001/api/balances

# Get allocations
curl http://localhost:3001/api/allocations

# List proposals
curl http://localhost:3001/api/proposals

# Create proposal
curl -X POST http://localhost:3001/api/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "token": "0x0000000000000000000000000000000000000000000",
    "amount": "1000000000000000000000",
    "type": "deposit",
    "strategy": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    "reason": "Test deposit"
  }'

# Execute proposal
curl -X POST http://localhost:3001/api/proposals/1/execute
```

## Contract Addresses (Local Deployment)

```
Guardian:           0x5FbDB2315678afecb367f032d93F642f64180aa3
TreasuryController:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ExampleStrategy:    0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
MockERC20:          0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

## Demo Data

The backend includes pre-populated demo proposals:
1. **Proposal #1**: Executed - Deposit 5 BNB to staking strategy
2. **Proposal #2**: Pending - Harvest staking rewards

These demonstrate the proposal lifecycle without requiring actual transactions.

## Key Features Demonstrated

1. **Automated Treasury Management**: Rules-based rebalancing
2. **Security Layers**: Guardian pause/timelock, multisig approval
3. **Pluggable Strategies**: ExampleStrategy as proof-of-concept
4. **Real-time Dashboard**: Live balances, allocations, proposals
5. **Proposal System**: Create, approve, execute workflow

## Troubleshooting

**Frontend shows "Loading..."**
- Check backend is running on port 3001
- Verify contracts are deployed to localhost:8545

**API returns errors**
- Restart the Hardhat node
- Redeploy contracts
- Check backend logs for connection issues

**Transactions fail**
- Verify relayer has BNB balance
- Check strategy is whitelisted in TreasuryController
- Review Guardian timelock requirements

## Next Steps

For production deployment:
1. Deploy to BNB Testnet (requires PRIVATE_KEY)
2. Replace ExampleStrategy with real yield strategies
3. Set up multisig/Gnosis for proposal approval
4. Configure production decision engine thresholds
5. Set up monitoring alerts

---

**Demo prepared for:**
- Hackathon judges
- Potential users
- Technical review
