const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying AegisTreasury contracts to BNB Testnet...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  if (balance < hre.ethers.parseEther("0.1")) {
    console.warn("\n⚠️  Warning: Low balance. Make sure you have enough tBNB for deployment!");
  }

  // 1. Deploy Guardian
  console.log("\n1. Deploying Guardian...");
  const Guardian = await hre.ethers.getContractFactory("Guardian");
  const guardian = await Guardian.deploy(deployer.address);
  await guardian.waitForDeployment();
  const guardianAddress = await guardian.getAddress();
  console.log("   Guardian deployed to:", guardianAddress);
  console.log("   Gas used:", (await guardian.deploymentTransaction()).gasUsed.toString());

  // 2. Deploy TreasuryController
  console.log("\n2. Deploying TreasuryController...");
  const TreasuryController = await hre.ethers.getContractFactory("TreasuryController");
  const treasury = await TreasuryController.deploy(guardianAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("   TreasuryController deployed to:", treasuryAddress);
  console.log("   Gas used:", (await treasury.deploymentTransaction()).gasUsed.toString());

  // 3. Set TreasuryController in Guardian
  console.log("\n3. Configuring Guardian...");
  const tx1 = await guardian.setTreasuryController(treasuryAddress);
  await tx1.wait();
  console.log("   Guardian configured with TreasuryController");
  console.log("   Gas used:", tx1.gasUsed.toString());

  // 4. Deploy ExampleStrategy
  console.log("\n4. Deploying ExampleStrategy...");
  const ExampleStrategy = await hre.ethers.getContractFactory("ExampleStrategy");
  const strategy = await ExampleStrategy.deploy(treasuryAddress);
  await strategy.waitForDeployment();
  const strategyAddress = await strategy.getAddress();
  console.log("   ExampleStrategy deployed to:", strategyAddress);
  console.log("   Gas used:", (await strategy.deploymentTransaction()).gasUsed.toString());

  // 5. Configure TreasuryController
  console.log("\n5. Configuring TreasuryController...");

  // Set relayer (use deployer for demo)
  const tx2 = await treasury.setRelayer(deployer.address);
  await tx2.wait();
  console.log("   Relayer set to:", deployer.address);
  console.log("   Gas used:", tx2.gasUsed.toString());

  // Whitelist the strategy
  const tx3 = await treasury.setStrategy(strategyAddress, true);
  await tx3.wait();
  console.log("   Strategy whitelisted:", strategyAddress);
  console.log("   Gas used:", tx3.gasUsed.toString());

  console.log("\n✅ BNB Testnet deployment complete!");
  console.log("\nContract Addresses:");
  console.log("==================");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      Guardian: guardianAddress,
      TreasuryController: treasuryAddress,
      ExampleStrategy: strategyAddress
    },
    explorerUrls: {
      Guardian: `https://testnet.bscscan.com/address/${guardianAddress}`,
      TreasuryController: `https://testnet.bscscan.com/address/${treasuryAddress}`,
      ExampleStrategy: `https://testnet.bscscan.com/address/${strategyAddress}`
    },
    deployedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save deployment info to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `bnbTestnet.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  console.log("\n📋 To verify contracts on BSCScan, run:");
  console.log(`npx hardhat verify --network bnbTestnet ${guardianAddress} ${deployer.address}`);
  console.log(`npx hardhat verify --network bnbTestnet ${treasuryAddress} ${guardianAddress}`);
  console.log(`npx hardhat verify --network bnbTestnet ${strategyAddress} ${treasuryAddress}`);

  console.log("\n🔍 View on BSCScan:");
  console.log(deploymentInfo.explorerUrls.Guardian);
  console.log(deploymentInfo.explorerUrls.TreasuryController);
  console.log(deploymentInfo.explorerUrls.ExampleStrategy);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
