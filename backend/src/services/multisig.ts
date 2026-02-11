import { ethers } from 'ethers';
import { Proposal } from '../types';

/**
 * @title MultiSig
 * @dev Handles multisig functions
 */
export class MultiSig {
    private owners: string[];
    private confirmations: Map<string, Set<string>>;

    constructor(owners: string[]) {
        this.owners = owners;
        this.confirmations = new Map();  // proposalId -> Set of confirmed owners
    }

    /**
     * Confirm a proposal by an owner
     */
    async confirmProposal(proposalId: string, owner: string): Promise<void> {
        if (!this.owners.includes(owner)) {
            throw new Error('Not an owner');
        }
        if (!this.confirmations.has(proposalId)) {
            this.confirmations.set(proposalId, new Set());
        }
        const confirmedSet = this.confirmations.get(proposalId)!;
        confirmedSet.add(owner);
    }

    /**
     * Execute a proposal if enough confirmations are reached
     */
    async executeProposal(proposal: Proposal): Promise<void> {
        const confirmedSet = this.confirmations.get(proposal.id);

        // Check if enough confirmations (e.g., greater than half of owners)
        if (confirmedSet && confirmedSet.size > Math.ceil(this.owners.length / 2)) {
            console.log(`Executing proposal: ${proposal.id}`);
            // Execute proposal logic goes here (e.g., call treasury contract)
        } else {
            throw new Error(`Not enough confirmations for proposal ${proposal.id}`);
        }
    }
}
