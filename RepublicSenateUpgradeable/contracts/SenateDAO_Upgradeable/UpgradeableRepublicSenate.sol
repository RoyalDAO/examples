// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@royaldao/contracts-upgradeable/Governance/SenateUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/ISenateUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateDeputyUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateSecurityUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateSettingsUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateVotesUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateVotesQuorumFractionUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/ChancellorTimelockControlUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/compatibility/ChancellorCompatibilityBravoUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UpgradeableRepublicSenate is
    Initializable,
    OwnableUpgradeable,
    SenateUpgradeable,
    SenateSettingsUpgradeable,
    SenateDeputyUpgradeable,
    SenateSecurityUpgradeable,
    SenateVotesUpgradeable,
    SenateVotesQuorumFractionUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _marshalDeputy,
        address _chancellor,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _tokenTreshold,
        uint256 _quorumPercentage,
        uint256 _quarantinePeriod,
        uint256 _mandatePeriod
    ) public initializer {
        __Ownable_init();
        __Senate_init("RepublicChancelor", _chancellor);
        __SenateVotes_init();
        __SenateSettings_init(_votingDelay, _votingPeriod, _tokenTreshold);
        __SenateVotesQuorumFraction_init(_quorumPercentage);
        __SenateDeputy_init(_marshalDeputy, _mandatePeriod);
        __SenateSecurity_init(_quarantinePeriod);
    }

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
        override(ISenateUpgradeable, SenateSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(ISenateUpgradeable, SenateSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(ISenateUpgradeable, SenateVotesQuorumFractionUpgradeable)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(SenateUpgradeable, SenateSettingsUpgradeable)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}
