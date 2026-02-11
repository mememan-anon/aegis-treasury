// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Guardian
 * @dev Security layer providing pause, timelock, and access control for treasury operations
 */
contract Guardian is Ownable, Pausable {
    address public treasuryController;
    uint256 public timelockDelay = 24 hours;

    // Timelock tracking
    mapping(bytes32 => uint256) public timelocks; // hash -> timestamp
    mapping(bytes32 => bool) public executedProposals;

    event PausedChanged(bool isPaused);
    event TimelockDelayChanged(uint256 newDelay);
    event ProposalScheduled(bytes32 indexed proposalId, uint256 executeAt);
    event ProposalExecuted(bytes32 indexed proposalId);
    event ProposalCancelled(bytes32 indexed proposalId);

    modifier onlyTreasuryController() {
        require(msg.sender == treasuryController, "Only treasury controller can call");
        _;
    }

    constructor(address _treasuryController) Ownable(msg.sender) {
        treasuryController = _treasuryController;
    }

    /**
     * @dev Pause all operations (emergency)
     */
    function pause() external onlyOwner {
        _pause();
        emit PausedChanged(true);
    }

    /**
     * @dev Unpause operations
     */
    function unpause() external onlyOwner {
        _unpause();
        emit PausedChanged(false);
    }

    /**
     * @dev Set timelock delay
     */
    function setTimelockDelay(uint256 _delay) external onlyOwner {
        require(_delay >= 1 hours, "Timelock must be at least 1 hour");
        timelockDelay = _delay;
        emit TimelockDelayChanged(_delay);
    }

    /**
     * @dev Schedule a proposal for execution after timelock
     * @param target Address to call
     * @param value ETH to send
     * @param data Call data
     * @return proposalId Unique proposal identifier
     */
    function scheduleProposal(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyTreasuryController whenNotPaused returns (bytes32 proposalId) {
        proposalId = keccak256(abi.encode(target, value, data));

        require(timelocks[proposalId] == 0, "Proposal already scheduled");
        require(!executedProposals[proposalId], "Proposal already executed");

        uint256 executeAt = block.timestamp + timelockDelay;
        timelocks[proposalId] = executeAt;

        emit ProposalScheduled(proposalId, executeAt);
    }

    /**
     * @dev Execute a scheduled proposal after timelock period
     * @param target Address to call
     * @param value ETH to send
     * @param data Call data
     */
    function executeProposal(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyTreasuryController whenNotPaused {
        bytes32 proposalId = keccak256(abi.encode(target, value, data));

        uint256 executeAt = timelocks[proposalId];
        require(executeAt > 0, "Proposal not scheduled");
        require(!executedProposals[proposalId], "Proposal already executed");
        require(block.timestamp >= executeAt, "Timelock not met");
        require(block.timestamp <= executeAt + 30 days, "Proposal expired");

        executedProposals[proposalId] = true;
        delete timelocks[proposalId];

        // Execute the call
        (bool success, ) = target.call{value: value}(data);
        require(success, "Execution failed");

        emit ProposalExecuted(proposalId);
    }

    /**
     * @dev Cancel a scheduled proposal
     * @param target Address that would be called
     * @param value ETH that would be sent
     * @param data Call data
     */
    function cancelProposal(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner {
        bytes32 proposalId = keccak256(abi.encode(target, value, data));

        require(timelocks[proposalId] > 0, "Proposal not scheduled");
        require(!executedProposals[proposalId], "Proposal already executed");

        delete timelocks[proposalId];

        emit ProposalCancelled(proposalId);
    }

    /**
     * @dev Update treasury controller address
     */
    function setTreasuryController(address _treasuryController) external onlyOwner {
        treasuryController = _treasuryController;
    }

    /**
     * @dev Check if a proposal can be executed
     */
    function canExecute(bytes32 proposalId) external view returns (bool) {
        uint256 executeAt = timelocks[proposalId];
        return executeAt > 0 &&
               !executedProposals[proposalId] &&
               block.timestamp >= executeAt &&
               block.timestamp <= executeAt + 30 days;
    }
}
