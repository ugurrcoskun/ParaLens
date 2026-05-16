// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title TxGenerator
 * @notice Utility contract to generate test transactions on Monad testnet.
 *         Useful for populating the block explorer with interesting data.
 *
 *         Functions are designed to have varying gas costs so the
 *         Parallel Score algorithm can detect gas variance patterns.
 */
contract TxGenerator {
    uint256 public counter;
    uint256[] public values;
    mapping(address => uint256) public deposits;

    event CounterSet(uint256 value);
    event ValueStored(uint256 value, uint256 index);
    event Deposited(address indexed user, uint256 amount);

    /**
     * @notice Simple operation, minimal gas
     */
    function ping() external {
        counter++;
        emit CounterSet(counter);
    }

    /**
     * @notice Store a value in the array, moderate gas
     */
    function store(uint256 value) external {
        values.push(value);
        emit ValueStored(value, values.length - 1);
    }

    /**
     * @notice Store multiple values, higher gas
     */
    function batchStore(uint256[] calldata toStore) external {
        for (uint256 i = 0; i < toStore.length; i++) {
            values.push(toStore[i]);
        }
    }

    /**
     * @notice Deposit MON to this contract, fires event
     */
    function deposit() external payable {
        require(msg.value > 0, "Must send MON");
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Heavy hash computation, designed to be high gas
     * @param rounds Number of hash rounds
     */
    function hashLoop(uint256 rounds) external pure returns (bytes32) {
        require(rounds <= 50, "Max 50 rounds");
        bytes32 hash = keccak256(abi.encodePacked(rounds));
        for (uint256 i = 0; i < rounds; i++) {
            hash = keccak256(abi.encodePacked(hash, i));
        }
        return hash;
    }

    /**
     * @notice Get array length
     */
    function valueCount() external view returns (uint256) {
        return values.length;
    }

    /**
     * @notice Get stored values in a range
     */
    function getValues(uint256 start, uint256 count)
        external
        view
        returns (uint256[] memory)
    {
        if (start >= values.length) return new uint256[](0);
        uint256 end = start + count;
        if (end > values.length) end = values.length;
        uint256[] memory result = new uint256[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = values[i];
        }
        return result;
    }
}

/**
 * @title GasComparison
 * @notice Contract that highlights gas differences between Monad and Ethereum.
 *         Demonstrates cold storage access costs and precompile repricing.
 */
contract GasComparison {
    // Storage slot that starts cold for each tx
    mapping(address => uint256) public nonce;
    // Multiple storage slots to test cold access patterns
    mapping(uint256 => uint256) public coldSlots;

    event NonceIncremented(address indexed user, uint256 newNonce);

    /**
     * @notice Increment nonce for caller
     *         On Monad: cold account access = 10,100 gas (vs 2,600 on Ethereum)
     */
    function incrementNonce() external {
        nonce[msg.sender]++;
        emit NonceIncremented(msg.sender, nonce[msg.sender]);
    }

    /**
     * @notice Read from multiple cold storage slots
     *         Each cold SLOAD on Monad = 8,100 gas (vs 2,100 on Ethereum)
     * @param slots Array of slot indices to read
     */
    function readManyColdSlots(uint256[] calldata slots)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory results = new uint256[](slots.length);
        for (uint256 i = 0; i < slots.length; i++) {
            results[i] = coldSlots[slots[i]];
        }
        return results;
    }

    /**
     * @notice Write to many cold storage slots
     *         Sets high gas costs on Monad due to cold SSTORE
     */
    function writeManySlots(uint256 start, uint256 count) external {
        for (uint256 i = 0; i < count; i++) {
            coldSlots[start + i] = block.number;
        }
    }

    /**
     * @notice ECDSA recovery operation
     *         ecRecover costs 6,000 gas on Monad vs 3,000 on Ethereum
     */
    function recoverSigner(bytes32 hash, bytes calldata signature)
        external
        pure
        returns (address)
    {
        return ecrecover(hash, 0, 0, 0); // dummy call, real use needs v,r,s
    }
}
