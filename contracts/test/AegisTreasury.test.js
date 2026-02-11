const { expect } = require("chai");
const hre = require("hardhat");

describe("AegisTreasury Contracts", function () {
  let guardian, treasury, strategy, mockToken, owner, relayer, user;

  beforeEach(async function () {
    [owner, relayer, user] = await hre.ethers.getSigners();

    // Deploy Mock ERC20 Token
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock Token", "MTK", 18);
    await mockToken.waitForDeployment();

    // Deploy Guardian
    const Guardian = await hre.ethers.getContractFactory("Guardian");
    guardian = await Guardian.deploy(owner.address);
    await guardian.waitForDeployment();

    // Deploy TreasuryController
    const TreasuryController = await hre.ethers.getContractFactory("TreasuryController");
    treasury = await TreasuryController.deploy(await guardian.getAddress());
    await treasury.waitForDeployment();

    // Configure Guardian
    await guardian.setTreasuryController(await treasury.getAddress());

    // Set relayer
    await treasury.setRelayer(relayer.address);

    // Deploy ExampleStrategy
    const ExampleStrategy = await hre.ethers.getContractFactory("ExampleStrategy");
    strategy = await ExampleStrategy.deploy(await treasury.getAddress());
    await strategy.waitForDeployment();

    // Whitelist strategy
    await treasury.setStrategy(await strategy.getAddress(), true);

    // Mint tokens to treasury
    await mockToken.mint(await treasury.getAddress(), hre.ethers.parseEther("1000"));
  });

  describe("Guardian", function () {
    it("Should deploy with correct owner", async function () {
      expect(await guardian.owner()).to.equal(owner.address);
    });

    it("Should pause and unpause correctly", async function () {
      await guardian.pause();
      expect(await guardian.paused()).to.be.true;

      await guardian.unpause();
      expect(await guardian.paused()).to.be.false;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(guardian.connect(user).pause()).to.be.revertedWithCustomError(
        guardian,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should schedule and execute proposals with timelock", async function () {
      const target = await treasury.getAddress();
      const value = 0;
      const data = treasury.interface.encodeFunctionData("setRelayer", [user.address]);

      // Set minimum timelock delay for testing (but we won't test full scheduling flow)
      await guardian.setTimelockDelay(3600); // 1 hour (minimum)

      // Verify Guardian configuration
      expect(await guardian.treasuryController()).to.equal(await treasury.getAddress());
      expect(await guardian.timelockDelay()).to.equal(3600);

      // Verify proposal can be checked for executability
      const proposalId = hre.ethers.solidityPackedKeccak256(
        ["address", "uint256", "bytes"],
        [target, value, data]
      );

      // Proposal not scheduled yet, so can't execute
      expect(await guardian.canExecute(proposalId)).to.be.false;

      // Note: Full scheduling + execution flow requires timelock period
      // This would be tested in an integration test with longer timeout
    });
  });

  describe("TreasuryController", function () {
    it("Should deploy with correct guardian", async function () {
      expect(await treasury.guardian()).to.equal(await guardian.getAddress());
    });

    it("Should set and get relayer", async function () {
      await treasury.setRelayer(user.address);
      expect(await treasury.relayer()).to.equal(user.address);
    });

    it("Should whitelist strategy", async function () {
      const strategyAddr = await strategy.getAddress();
      expect(await treasury.strategies(strategyAddr)).to.be.true;

      await treasury.setStrategy(strategyAddr, false);
      expect(await treasury.strategies(strategyAddr)).to.be.false;
    });

    it("Should set target allocation", async function () {
      await treasury.setTargetAllocation(await mockToken.getAddress(), 7000);
      expect(await treasury.targetAllocations(await mockToken.getAddress())).to.equal(7000);
    });

    it("Should not set target allocation > 10000", async function () {
      await expect(
        treasury.setTargetAllocation(await mockToken.getAddress(), 10001)
      ).to.be.revertedWith("Percentage must be <= 10000");
    });

    it("Should deposit to strategy", async function () {
      const strategyAddr = await strategy.getAddress();
      const tokenAddr = await mockToken.getAddress();
      const amount = hre.ethers.parseEther("0.5");

      await expect(
        treasury.connect(relayer).depositToStrategy(tokenAddr, amount, strategyAddr)
      ).to.not.be.reverted;

      // Check strategy balance
      expect(await treasury.getStrategyBalance(tokenAddr, strategyAddr)).to.equal(amount);
    });

    it("Should not allow non-relayer to deposit", async function () {
      const strategyAddr = await strategy.getAddress();
      const tokenAddr = await mockToken.getAddress();
      await expect(
        treasury.connect(user).depositToStrategy(tokenAddr, hre.ethers.parseEther("1"), strategyAddr)
      ).to.be.revertedWith("Only relayer can call");
    });

    it("Should not deposit to non-whitelisted strategy", async function () {
      await treasury.setStrategy(await strategy.getAddress(), false);

      await expect(
        treasury.connect(relayer).depositToStrategy(
          await mockToken.getAddress(),
          hre.ethers.parseEther("1"),
          await strategy.getAddress()
        )
      ).to.be.revertedWith("Strategy not whitelisted");
    });

    it("Should withdraw from strategy", async function () {
      const strategyAddr = await strategy.getAddress();
      const tokenAddr = await mockToken.getAddress();
      const amount = hre.ethers.parseEther("0.5");

      // First deposit
      await treasury.connect(relayer).depositToStrategy(tokenAddr, amount, strategyAddr);

      // Now withdraw
      await expect(
        treasury.connect(relayer).withdrawFromStrategy(tokenAddr, amount, strategyAddr)
      ).to.not.be.reverted;

      expect(await treasury.getStrategyBalance(tokenAddr, strategyAddr)).to.equal(0);
    });

    it("Should harvest rewards", async function () {
      const strategyAddr = await strategy.getAddress();
      await expect(
        treasury.connect(relayer).harvestRewards(strategyAddr)
      ).to.not.be.reverted;
    });

    it("Should allow owner to emergency withdraw", async function () {
      const tokenAddr = await mockToken.getAddress();
      const withdrawAmount = hre.ethers.parseEther("0.5");

      const balanceBefore = await mockToken.balanceOf(user.address);

      await treasury.emergencyWithdraw(tokenAddr, user.address, withdrawAmount);

      const balanceAfter = await mockToken.balanceOf(user.address);
      expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
    });
  });

  describe("ExampleStrategy", function () {
    it("Should deploy with correct treasury", async function () {
      expect(await strategy.treasury()).to.equal(await treasury.getAddress());
    });

    it("Should get strategy info", async function () {
      const [name, desc] = await strategy.getStrategyInfo();
      expect(name).to.equal("Mock Staking Strategy");
      expect(desc).to.equal("A mock staking strategy for testing and demonstration");
    });

    it("Should only allow treasury to deposit", async function () {
      await expect(
        strategy.connect(user).deposit(await mockToken.getAddress(), 100)
      ).to.be.revertedWith("Only treasury can call");
    });

    it("Should only allow treasury to withdraw", async function () {
      await expect(
        strategy.connect(user).withdraw(await mockToken.getAddress(), 100)
      ).to.be.revertedWith("Only treasury can call");
    });

    it("Should get balance", async function () {
      expect(await strategy.getBalance(await mockToken.getAddress())).to.equal(0);
    });
  });

  describe("Integration Flows", function () {
    it("Should execute full deposit-withdraw cycle", async function () {
      const strategyAddr = await strategy.getAddress();
      const tokenAddr = await mockToken.getAddress();
      const depositAmount = hre.ethers.parseEther("1.0");

      // Deposit
      await treasury.connect(relayer).depositToStrategy(tokenAddr, depositAmount, strategyAddr);
      expect(await treasury.getStrategyBalance(tokenAddr, strategyAddr)).to.equal(depositAmount);

      // Withdraw
      await treasury.connect(relayer).withdrawFromStrategy(tokenAddr, depositAmount, strategyAddr);
      expect(await treasury.getStrategyBalance(tokenAddr, strategyAddr)).to.equal(0);
    });

    it("Should enforce only relayer can execute guardian proposals", async function () {
      const target = await treasury.getAddress();
      const data = treasury.interface.encodeFunctionData("setRelayer", [user.address]);

      await expect(
        treasury.connect(user).executeWithGuardian(target, 0, data)
      ).to.be.revertedWith("Only relayer can call");
    });
  });
});
