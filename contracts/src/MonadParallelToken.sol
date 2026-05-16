// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title MonadParallelToken
 * @notice ERC20 token for demonstrating parallel execution on Monad.
 *         Multiple independent transfers to different addresses
 *         can all execute in parallel.
 */
contract MonadParallelToken is ERC20, Ownable {
    uint256 public transferCount;
    uint256 public lastTransferBlock;

    event ParallelTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 blockNumber
    );

    constructor(address initialOwner) ERC20("Monad Parallel Token", "MPT") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000 * 10 ** decimals());
    }

    /**
     * @notice Override transfer to track metrics
     */
    function transfer(address to, uint256 value) public override returns (bool) {
        bool result = super.transfer(to, value);
        transferCount++;
        lastTransferBlock = block.number;
        emit ParallelTransfer(msg.sender, to, value, block.number);
        return result;
    }

    /**
     * @notice Batch transfer to many addresses.
     *         Each target receives the same amount.
     *         On Monad, independent transfers to different addresses
     *         could potentially run in parallel.
     */
    function batchTransfer(address[] calldata recipients, uint256 amount) external {
        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amount);
        }
    }

    /**
     * @notice Mint additional tokens (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Get token metrics
     */
    function getMetrics()
        external
        view
        returns (
            uint256 transfers,
            uint256 lastBlock,
            uint256 totalSupply_
        )
    {
        return (transferCount, lastTransferBlock, totalSupply());
    }
}
