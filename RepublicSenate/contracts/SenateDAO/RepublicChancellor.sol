// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@royaldao/contracts/Governance/Chancellor.sol";
import "@royaldao/contracts/Governance/extensions/ChancellorSenateControl.sol";
import "@royaldao/contracts/Governance/extensions/ChancellorTimelockControl.sol";
import "@royaldao/contracts/Governance/compatibility/ChancellorCompatibilityBravo.sol";

contract RepublicChancellor is
    Chancellor,
    ChancellorCompatibilityBravo,
    ChancellorSenateControl,
    ChancellorTimelockControl
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(TimelockController _timelock, Senate _senate)
        Chancellor("RepublicChancelor")
        ChancellorSenateControl(_senate)
        ChancellorTimelockControl(_timelock)
    {}

    function votingDelay()
        public
        view
        override(IChancellor, ChancellorSenateControl)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IChancellor, ChancellorSenateControl)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IChancellor, ChancellorSenateControl)
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
        override(Chancellor, IChancellor, ChancellorTimelockControl)
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
        override(Chancellor, ChancellorCompatibilityBravo, IChancellor)
        returns (uint256)
    {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(Chancellor, ChancellorSenateControl)
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
    ) internal override(Chancellor, ChancellorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Chancellor, ChancellorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Chancellor, ChancellorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(
            Chancellor,
            IERC165,
            ChancellorTimelockControl,
            ChancellorSenateControl
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
