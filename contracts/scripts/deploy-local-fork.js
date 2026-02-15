const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying Equilibra contracts to local fork...");
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

  // 5. Deploy Mock ERC20 token for testing
  console.log("\n5. Deploying Mock ERC20 token...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy("Test Token", "TST", 18);
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("   Mock ERC20 deployed to:", tokenAddress);

  // 6. Mint tokens to treasury for testing
  console.log("\n6. Funding treasury with test tokens...");
  await mockToken.mint(treasuryAddress, hre.ethers.parseEther("1000000"));
  console.log("   Minted 1,000,000 TST to treasury");

  // 7. Configure TreasuryController
  console.log("\n7. Configuring TreasuryController...");

  // Set relayer
  await treasury.setRelayer(deployer.address);
  console.log("   Relayer set to:", deployer.address);

  // Whitelist the strategy
  await treasury.setStrategy(strategyAddress, true);
  console.log("   Strategy whitelisted:", strategyAddress);

  // Set target allocation (e.g., 50% in TST)
  await treasury.setTargetAllocation(tokenAddress, 5000);
  console.log("   Target allocation set for TST: 50%");

  // Fund treasury with some ETH
  console.log("\n8. Funding treasury with ETH...");
  await deployer.sendTransaction({
    to: treasuryAddress,
    value: hre.ethers.parseEther("10")
  });
  console.log("   Sent 10 ETH to treasury");

  console.log("\n✅ Local fork deployment complete!");
  console.log("\nContract Addresses:");
  console.log("==================");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      Guardian: guardianAddress,
      TreasuryController: treasuryAddress,
      ExampleStrategy: strategyAddress,
      MockERC20: tokenAddress
    },
    config: {
      relayer: deployer.address,
      targetAllocations: {
        [tokenAddress]: "5000" // 50%
      }
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

  console.log("\n🧪 You can now run tests against the deployed contracts:");
  console.log(`   npx hardhat test --network localhost`);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
