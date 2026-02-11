// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IStrategyAdapter
 * @dev Interface for yield strategy adapters
 * Any yield strategy must implement this interface to work with TreasuryController
 */
interface IStrategyAdapter {
    /**
     * @dev Deposit tokens into the strategy
     * @param token Address of token to deposit
     * @param amount Amount to deposit
     * @return actualAmount Actual amount deposited (may differ due to slippage)
     */
    function deposit(address token, uint256 amount) external returns (uint256 actualAmount);

    /**
     * @dev Withdraw tokens from the strategy
     * @param token Address of token to withdraw
     * @param amount Amount to withdraw
     * @return actualAmount Actual amount withdrawn
     */
    function withdraw(address token, uint256 amount) external returns (uint256 actualAmount);

    /**
     * @dev Get balance of tokens managed by this strategy
     * @param token Address of token
     * @return balance Balance in the strategy
     */
    function getBalance(address token) external view returns (uint256 balance);

    /**
     * @dev Harvest returns from the strategy
     * @return rewards Amount of rewards harvested
     */
    function harvest() external returns (uint256 rewards);

    /**
     * @dev Get strategy metadata
     * @return name Strategy name
     * @return description Strategy description
     */
    function getStrategyInfo() external view returns (string memory name, string memory description);
}
