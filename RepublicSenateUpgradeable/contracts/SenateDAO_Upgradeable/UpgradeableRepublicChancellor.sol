// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@royaldao/contracts-upgradeable/Governance/ChancellorUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/ChancellorSenateControlUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/ChancellorTimelockControlUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/compatibility/ChancellorCompatibilityBravoUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableRepublicChancellor is
    Initializable,
    ChancellorUpgradeable,
    ChancellorCompatibilityBravoUpgradeable,
    ChancellorSenateControlUpgradeable,
    ChancellorTimelockControlUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        TimelockControllerUpgradeable _timelock,
        SenateUpgradeable _senate
    ) public initializer {
        __Chancellor_init("UpgradeableRepublicChancellor");
        __ChancellorCompatibilityBravo_init();
        __ChancellorSenateControl_init(_senate);
        __ChancellorTimelockControl_init(_timelock);
    }

    function votingDelay()
        public
        view
        override(IChancellorUpgradeable, ChancellorSenateControlUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IChancellorUpgradeable, ChancellorSenateControlUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IChancellorUpgradeable, ChancellorSenateControlUpgradeable)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function quorumReached(uint256 proposalId) public view returns (bool) {
        return super._quorumReached(proposalId);
    }

    function state(uint256 proposalId)
        public
        view
        override(
            ChancellorUpgradeable,
            IChancellorUpgradeable,
            ChancellorTimelockControlUpgradeable
        )
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    )
        public
        override(
            ChancellorUpgradeable,
            ChancellorCompatibilityBravoUpgradeable,
            IChancellorUpgradeable
        )
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(ChancellorUpgradeable, ChancellorSenateControlUpgradeable)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(ChancellorUpgradeable, ChancellorTimelockControlUpgradeable)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(ChancellorUpgradeable, ChancellorTimelockControlUpgradeable)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(ChancellorUpgradeable, ChancellorTimelockControlUpgradeable)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            ChancellorUpgradeable,
            IERC165Upgradeable,
            ChancellorTimelockControlUpgradeable,
            ChancellorSenateControlUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
