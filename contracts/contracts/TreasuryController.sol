// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IStrategyAdapter.sol";
import "./Guardian.sol";

/**
 * @title TreasuryController
 * @dev Main contract managing treasury allocations and executing proposals
 */
contract TreasuryController is Ownable {
    using SafeERC20 for IERC20;

    // State
    address public guardian;
    address public relayer;
    mapping(address => bool) public strategies; // strategy address -> isWhitelisted
    mapping(address => uint256) public targetAllocations; // token -> target percentage (scaled 10000 = 100%)

    // Events
    event StrategyAdded(address indexed strategy, bool added);
    event RelayerUpdated(address indexed relayer);
    event GuardianUpdated(address indexed guardian);
    event TargetAllocationSet(address indexed token, uint256 percentage);
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed token,
        uint256 amount,
        address strategy,
        string action
    );

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call");
        _;
    }

    modifier onlyGuardianOrRelayer() {
        require(msg.sender == guardian || msg.sender == relayer, "Only guardian or relayer");
        _;
    }

    modifier onlyWhitelistedStrategy(address strategy) {
        require(strategies[strategy], "Strategy not whitelisted");
        _;
    }

    constructor(address _guardian) Ownable(msg.sender) {
        guardian = _guardian;
    }

    /**
     * @dev Add or remove a strategy from whitelist
     */
    function setStrategy(address strategy, bool added) external onlyOwner {
        strategies[strategy] = added;
        emit StrategyAdded(strategy, added);
    }

    /**
     * @dev Update relayer address
     */
    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
        emit RelayerUpdated(_relayer);
    }

    /**
     * @dev Update guardian address
     */
    function setGuardian(address _guardian) external onlyOwner {
        guardian = _guardian;
        emit GuardianUpdated(_guardian);
    }

    /**
     * @dev Set target allocation for a token (percentage out of 10000)
     * @param token Token address
     * @param percentage Target percentage (10000 = 100%, 5000 = 50%)
     */
    function setTargetAllocation(address token, uint256 percentage) external onlyOwner {
        require(percentage <= 10000, "Percentage must be <= 10000");
        targetAllocations[token] = percentage;
        emit TargetAllocationSet(token, percentage);
    }

    /**
     * @dev Get total balance of a token (treasury + all strategies)
     */
    function getTotalBalance(address token) external view returns (uint256) {
        uint256 treasuryBalance = IERC20(token).balanceOf(address(this));
        return treasuryBalance;
    }

    /**
     * @dev Get balance in a specific strategy
     */
    function getStrategyBalance(address token, address strategy) external view returns (uint256) {
        return IStrategyAdapter(strategy).getBalance(token);
    }

    /**
     * @dev Deposit tokens to a strategy
     */
    function depositToStrategy(
        address token,
        uint256 amount,
        address strategy
    ) external onlyRelayer onlyWhitelistedStrategy(strategy) returns (uint256) {
        require(amount > 0, "Amount must be > 0");

        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        IERC20(token).safeIncreaseAllowance(strategy, amount);
        uint256 actualAmount = IStrategyAdapter(strategy).deposit(token, amount);
        // Note: The allowance is consumed by the strategy's transferFrom call,
        // so we don't need to decrease it here

        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        require(balanceBefore - balanceAfter == actualAmount, "Deposit amount mismatch");

        emit ProposalExecuted(
            uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, token, amount, strategy, "deposit"))),
            token,
            actualAmount,
            strategy,
            "deposit"
        );

        return actualAmount;
    }

    /**
     * @dev Withdraw tokens from a strategy
     */
    function withdrawFromStrategy(
        address token,
        uint256 amount,
        address strategy
    ) external onlyRelayer onlyWhitelistedStrategy(strategy) returns (uint256) {
        require(amount > 0, "Amount must be > 0");

        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        uint256 actualAmount = IStrategyAdapter(strategy).withdraw(token, amount);
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));

        require(balanceAfter - balanceBefore == actualAmount, "Withdraw amount mismatch");

        emit ProposalExecuted(
            uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, token, amount, strategy, "withdraw"))),
            token,
            actualAmount,
            strategy,
            "withdraw"
        );

        return actualAmount;
    }

    /**
     * @dev Harvest rewards from a strategy
     */
    function harvestRewards(address strategy) external onlyRelayer onlyWhitelistedStrategy(strategy) returns (uint256) {
        uint256 rewards = IStrategyAdapter(strategy).harvest();

        emit ProposalExecuted(
            uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, strategy, "harvest"))),
            address(0),
            rewards,
            strategy,
            "harvest"
        );

        return rewards;
    }

    /**
     * @dev Execute a proposal through Guardian (timelocked operation)
     * For critical operations that require timelock
     */
    function executeWithGuardian(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyRelayer {
        Guardian(guardian).executeProposal(target, value, data);
    }

    /**
     * @dev Emergency withdraw (only owner, bypasses all checks)
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }

    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}
