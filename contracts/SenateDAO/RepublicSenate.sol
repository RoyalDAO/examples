// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@royaldao/contracts/Governance/Senate.sol";
import "@royaldao/contracts/Governance/ISenate.sol";
import "@royaldao/contracts/Governance/extensions/SenateSettings.sol";
import "@royaldao/contracts/Governance/extensions/SenateVotes.sol";
import "@royaldao/contracts/Governance/extensions/SenateVotesQuorumFraction.sol";
import "@royaldao/contracts/Governance/extensions/ChancelorTimelockControl.sol";
import "@royaldao/contracts/Governance/compatibility/ChancelorCompatibilityBravo.sol";

contract RepublicSenate is
    Senate,
    Ownable,
    SenateSettings,
    SenateVotes,
    SenateVotesQuorumFraction
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        address _marshalDeputy,
        address _chancelor,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _tokenTreshold,
        uint256 _quorumPercentage,
        uint256 _quarantinePeriod
    )
        Senate(
            "RepublicChancelor",
            _marshalDeputy,
            _chancelor,
            _quarantinePeriod
        )
        SenateSettings(_votingDelay, _votingPeriod, _tokenTreshold)
        SenateVotesQuorumFraction(_quorumPercentage)
    {}

    function changeMarshalDeputy(address _newMarshalInTown)
        public
        override
        onlyOwner
    {
        super.changeMarshalDeputy(_newMarshalInTown);
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
