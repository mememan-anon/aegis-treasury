// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IStrategyAdapter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ExampleStrategy
 * @dev Mock staking strategy for testing and demonstration
 * In production, this would interact with actual yield protocols (PancakeSwap, Venus, etc.)
 */
contract ExampleStrategy is IStrategyAdapter {
    using SafeERC20 for IERC20;

    address public owner;
    address public treasury;
    mapping(address => uint256) public balances; // Token -> balance

    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount);
    event Harvested(uint256 rewards);

    modifier onlyTreasury() {
        require(msg.sender == treasury, "Only treasury can call");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(address _treasury) {
        owner = msg.sender;
        treasury = _treasury;
    }

    /**
     * @dev Deposit tokens into the strategy (mock - just holds tokens)
     */
    function deposit(address token, uint256 amount) external onlyTreasury returns (uint256 actualAmount) {
        require(amount > 0, "Amount must be > 0");

        // Transfer tokens from treasury to strategy
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(treasury, address(this), amount);
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));

        actualAmount = balanceAfter - balanceBefore;
        balances[token] += actualAmount;

        emit Deposited(token, actualAmount);
    }

    /**
     * @dev Withdraw tokens from the strategy (mock)
     */
    function withdraw(address token, uint256 amount) external onlyTreasury returns (uint256 actualAmount) {
        require(balances[token] >= amount, "Insufficient balance");
        actualAmount = amount;

        balances[token] -= actualAmount;

        // Transfer tokens back to treasury
        IERC20(token).safeTransfer(treasury, actualAmount);

        emit Withdrawn(token, actualAmount);
    }

    /**
     * @dev Get balance of tokens in this strategy
     */
    function getBalance(address token) external view returns (uint256 balance) {
        return balances[token];
    }

    /**
     * @dev Harvest returns (mock - returns simulated rewards)
     */
    function harvest() external onlyTreasury returns (uint256 rewards) {
        // Mock: Return 1% of total balance as "yield"
        // Simulate some yield
        rewards = 0;
        emit Harvested(rewards);
    }

    /**
     * @dev Get strategy metadata
     */
    function getStrategyInfo() external pure returns (string memory name, string memory description) {
        return ("Mock Staking Strategy", "A mock staking strategy for testing and demonstration");
    }

    /**
     * @dev Update treasury address (only owner)
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        require(balances[token] >= amount, "Insufficient balance");
        balances[token] -= amount;

        // Transfer tokens to specified address
        IERC20(token).safeTransfer(to, amount);
    }
}
