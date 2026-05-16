// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ParallelBenchmark
 * @notice Demonstrates Monad's parallel execution by performing
 *         independent operations that can run concurrently.
 *
 *         Each function operates on isolated storage slots,
 *         making them fully parallelizable on Monad.
 *
 *         Deploy this on Monad testnet, then call functions
 *         from multiple wallets simultaneously to see
 *         parallel execution in action.
 */
contract ParallelBenchmark {
    // Isolated counters - each maps to a unique storage slot
    mapping(uint256 => uint256) public counters;

    // Isolated balances
    mapping(uint256 => mapping(address => uint256)) public balances;

    // Metrics
    uint256 public totalOperations;
    uint256 public lastOperationBlock;
    uint256 public lastOperationTimestamp;

    event CounterIncremented(uint256 indexed slot, uint256 newValue, uint256 gasUsed);
    event BalanceUpdated(
        uint256 indexed slot,
        address indexed user,
        uint256 newBalance,
        uint256 gasUsed
    );
    event HeavyComputePerformed(uint256 indexed slot, uint256 result, uint256 gasUsed);
    event BatchOperation(uint256 count, uint256 totalGas);

    /**
     * @notice Increment an isolated counter. Fully parallelizable.
     * @param slot The counter slot to increment
     */
    function incrementCounter(uint256 slot) external {
        counters[slot]++;
        totalOperations++;
        lastOperationBlock = block.number;
        lastOperationTimestamp = block.timestamp;

        emit CounterIncremented(slot, counters[slot], gasleft());
    }

    /**
     * @notice Set a balance in an isolated slot. Independent operations per (slot, user).
     * @param slot The balance slot
     * @param amount The balance to set
     */
    function setBalance(uint256 slot, uint256 amount) external {
        balances[slot][msg.sender] = amount;
        totalOperations++;
        lastOperationBlock = block.number;
        lastOperationTimestamp = block.timestamp;

        emit BalanceUpdated(slot, msg.sender, amount, gasleft());
    }

    /**
     * @notice Perform heavy computation on an isolated slot.
     *         Different slots = fully parallel.
     * @param slot The computation slot
     * @param iterations Number of iterations (kept low to avoid out-of-gas)
     */
    function heavyCompute(uint256 slot, uint256 iterations) external {
        require(iterations <= 100, "Max 100 iterations to avoid OOG");
        uint256 result = slot;
        uint256 startGas = gasleft();

        for (uint256 i = 0; i < iterations; i++) {
            result = uint256(keccak256(abi.encodePacked(result, i, block.timestamp)));
        }

        counters[slot] = result;
        totalOperations++;
        lastOperationBlock = block.number;
        lastOperationTimestamp = block.timestamp;

        emit HeavyComputePerformed(slot, result, startGas - gasleft());
    }

    /**
     * @notice Execute multiple counter increments from the same caller.
     *         While from one caller, these target different slots.
     * @param slots Array of counter slots to increment
     */
    function batchIncrement(uint256[] calldata slots) external {
        for (uint256 i = 0; i < slots.length; i++) {
            counters[slots[i]]++;
        }
        totalOperations += slots.length;
        lastOperationBlock = block.number;
        lastOperationTimestamp = block.timestamp;
    }

    /**
     * @notice Get current metrics about the contract's activity
     */
    function getMetrics()
        external
        view
        returns (
            uint256 totalOps,
            uint256 lastBlock,
            uint256 lastTimestamp
        )
    {
        return (totalOperations, lastOperationBlock, lastOperationTimestamp);
    }

    /**
     * @notice Get multiple counter values at once
     */
    function getCounters(uint256[] calldata slots) external view returns (uint256[] memory) {
        uint256[] memory values = new uint256[](slots.length);
        for (uint256 i = 0; i < slots.length; i++) {
            values[i] = counters[slots[i]];
        }
        return values;
    }
}
