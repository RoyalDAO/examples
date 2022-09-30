// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@royaldao/contracts-upgradeable/Governance/SenateUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/ISenateUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateSettingsUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateVotesUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/SenateVotesQuorumFractionUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/extensions/ChancelorTimelockControlUpgradeable.sol";
import "@royaldao/contracts-upgradeable/Governance/compatibility/ChancelorCompatibilityBravoUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableRepublicSenate is
    Initializable,
    SenateUpgradeable,
    SenateSettingsUpgradeable,
    SenateVotesUpgradeable,
    SenateVotesQuorumFractionUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _marshalDeputy,
        address _chancelor,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _tokenTreshold,
        uint256 _quorumPercentage,
        uint256 _quarantinePeriod
    ) public initializer {
        __Senate_init(
            "RepublicChancelor",
            _marshalDeputy,
            _chancelor,
            _quarantinePeriod
        );
        __SenateVotes_init();
        __SenateSettings_init(_votingDelay, _votingPeriod, _tokenTreshold);
        __SenateVotesQuorumFraction_init(_quorumPercentage);
    }

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
