// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@royaldao/contracts/Governance/Chancelor.sol";
import "@royaldao/contracts/Governance/extensions/ChancelorSenateControl.sol";
import "@royaldao/contracts/Governance/extensions/ChancelorTimelockControl.sol";
import "@royaldao/contracts/Governance/compatibility/ChancelorCompatibilityBravo.sol";

contract RepublicChancelor is
    Chancelor,
    ChancelorCompatibilityBravo,
    ChancelorSenateControl,
    ChancelorTimelockControl
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(TimelockController _timelock, Senate _senate)
        Chancelor("RepublicChancelor")
        ChancelorSenateControl(_senate)
        ChancelorTimelockControl(_timelock)
    {}

    function votingDelay()
        public
        view
        override(IChancelor, ChancelorSenateControl)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IChancelor, ChancelorSenateControl)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IChancelor, ChancelorSenateControl)
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
        override(Chancelor, IChancelor, ChancelorTimelockControl)
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
        override(Chancelor, ChancelorCompatibilityBravo, IChancelor)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(Chancelor, ChancelorSenateControl)
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
    ) internal override(Chancelor, ChancelorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Chancelor, ChancelorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Chancelor, ChancelorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            Chancelor,
            IERC165,
            ChancelorTimelockControl,
            ChancelorSenateControl
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
