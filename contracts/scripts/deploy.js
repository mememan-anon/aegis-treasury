const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Equilibra contracts...");
  console.log("Network:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy Guardian
  console.log("\n1. Deploying Guardian...");
  const Guardian = await hre.ethers.getContractFactory("Guardian");
  const guardian = await Guardian.deploy(deployer.address);
  await guardian.waitForDeployment();
  const guardianAddress = await guardian.getAddress();
  console.log("   Guardian deployed to:", guardianAddress);

  // 2. Deploy TreasuryController
  console.log("\n2. Deploying TreasuryController...");
  const TreasuryController = await hre.ethers.getContractFactory("TreasuryController");
  const treasury = await TreasuryController.deploy(guardianAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("   TreasuryController deployed to:", treasuryAddress);

  // 3. Set TreasuryController in Guardian
  console.log("\n3. Configuring Guardian...");
  await guardian.setTreasuryController(treasuryAddress);
  console.log("   Guardian configured with TreasuryController");

  // 4. Deploy ExampleStrategy
  console.log("\n4. Deploying ExampleStrategy...");
  const ExampleStrategy = await hre.ethers.getContractFactory("ExampleStrategy");
  const strategy = await ExampleStrategy.deploy(treasuryAddress);
  await strategy.waitForDeployment();
  const strategyAddress = await strategy.getAddress();
  console.log("   ExampleStrategy deployed to:", strategyAddress);

  // 5. Configure TreasuryController
  console.log("\n5. Configuring TreasuryController...");

  // Set relayer (for demo, use deployer)
  await treasury.setRelayer(deployer.address);
  console.log("   Relayer set to:", deployer.address);

  // Whitelist the strategy
  await treasury.setStrategy(strategyAddress, true);
  console.log("   Strategy whitelisted:", strategyAddress);

  console.log("\n✅ Deployment complete!");
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
    deployedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save deployment info to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Verify contracts on block explorer (only for testnets/mainnets)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nNote: To verify contracts on block explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${guardianAddress} ${deployer.address}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${treasuryAddress} ${guardianAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${strategyAddress} ${treasuryAddress}`);
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
