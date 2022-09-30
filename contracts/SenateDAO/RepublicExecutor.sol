// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@royaldao/contracts/Governance/TimelockController.sol";

contract RepublicExecutor is TimelockController {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    ) TimelockController(minDelay, proposers, executors) {}
}
