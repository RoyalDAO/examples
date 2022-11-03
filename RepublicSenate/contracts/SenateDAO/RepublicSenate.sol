// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@royaldao/contracts/Governance/Senate.sol";
import "@royaldao/contracts/Governance/ISenate.sol";
import "@royaldao/contracts/Governance/extensions/SenateDeputy.sol";
import "@royaldao/contracts/Governance/extensions/SenateSecurity.sol";
import "@royaldao/contracts/Governance/extensions/SenateSettings.sol";
import "@royaldao/contracts/Governance/extensions/SenateVotes.sol";
import "@royaldao/contracts/Governance/extensions/SenateVotesQuorumFraction.sol";
import "@royaldao/contracts/Governance/extensions/ChancellorTimelockControl.sol";
import "@royaldao/contracts/Governance/compatibility/ChancellorCompatibilityBravo.sol";

contract RepublicSenate is
    Senate,
    Ownable,
    SenateSettings,
    SenateDeputy,
    SenateSecurity,
    SenateVotes,
    SenateVotesQuorumFraction
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        address _marshalDeputy,
        address _chancellor,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _tokenTreshold,
        uint256 _quorumPercentage,
        uint256 _quarantinePeriod,
        uint256 _mandatePeriod
    )
        Senate("RepublicChancelor", _chancellor)
        SenateSettings(_votingDelay, _votingPeriod, _tokenTreshold)
        SenateDeputy(_marshalDeputy, _mandatePeriod)
        SenateSecurity(_quarantinePeriod)
        SenateVotesQuorumFraction(_quorumPercentage)
    {}

    function changeDeputyMarshal(address _newMarshalInTown)
        public
        override
        onlyOwner
    {
        super._setNewDeputyMarshal(_newMarshalInTown);
    }

    function votingDelay()
        public
        view
        override(ISenate, SenateSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(ISenate, SenateSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(ISenate, SenateVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Senate, SenateSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}
