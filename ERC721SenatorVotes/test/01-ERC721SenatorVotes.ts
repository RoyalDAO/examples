import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import {
  RoyalGovernor,
  RoyalGovernor__factory,
  RoyalExecutor,
  RoyalExecutor__factory,
  Token1,
  Token1__factory,
} from "../typechain-types";
import Web3 from "web3";
import deployExecutor from "../deploy/01-deploy-royalExecutor";
import deployGovernor from "../deploy/02-deploy-royalGovernor";
import { chainMine, chainSleep, getAccount } from "../scripts/utils";
import { loadTokenSenatorContract } from "../scripts/contractUtils";
import { ProposalCreatedEvent } from "../typechain-types/@openzeppelin/contracts/governance/Governor";
import { ProposalQueuedEvent } from "../typechain-types/@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo";
import { network } from "hardhat";
import deployToken1 from "../deploy/03-deploy-token1";

import { executeDaoProcess, mintTokens } from "../scripts/daoUtils";

const hre = require("hardhat");
describe("RoyalGovernorDao", function () {
  const { deployments, getNamedAccounts, web3, ethers } = require("hardhat");
  const { get } = deployments;

  const executorMinDelay = 272;
  const quorum = 25; //percentage
  const votingPeriod = 500; //~110 minutes in blocks
  const votingDelay = 30; //~7 minutes in blocks

  const gasPrice = "20"; //gwei

  let _token1Contract: Token1;

  let _royalExecutorContract: RoyalExecutor;
  let _royalGovernorContract: RoyalGovernor;
  beforeEach(async function () {
    const { deployer, safeCaller } = await getNamedAccounts();

    console.log(
      `***************************************** Deploy Contracts *****************************************`
    );

    await deployToken1(hre);
    await deployExecutor(hre);
    await deployGovernor(hre);

    _token1Contract = await loadTokenSenatorContract("Token1", "");

    const executorFactory: RoyalExecutor__factory =
      await ethers.getContractFactory("RoyalExecutor");
    const _executor = await get("RoyalExecutor");

    _royalExecutorContract = await executorFactory.attach(_executor.address);

    const governorFactory: RoyalGovernor__factory =
      await ethers.getContractFactory("RoyalGovernor");
    const _governor = await get("RoyalGovernor");

    _royalGovernorContract = await governorFactory.attach(_governor.address);

    console.log(
      `****************************************************************************************************`
    );

    //
    assert(_token1Contract, "Could not deploy token 1 contract");
    assert(_royalExecutorContract, "Could not deploy executor contract");
    assert(_royalGovernorContract, "Could not deploy governor contract");
  });
  describe("RoyalGovernorDao::DaoTest", function () {
    it("Try to create a proposal and vote. It should work with no problems", async function () {
      const { deployer, safeCaller } = await getNamedAccounts();
      const _web3: Web3 = web3;
      const _minters = await getAccount("minters", 10);

      console.log(
        `***************************************** Mint Tokens *********************************************`
      );
      //mint token 1
      await mintTokens(_token1Contract, _minters, _minters.length);

      console.log(
        `****************************************************************************************************`
      );

      console.log(
        `************************************** Propose and Voting ******************************************`
      );

      //proposal
      const PROPOSAL_DESCRIPTION =
        "bafkreicwrdofqb56rkspleeo3deyxpl4ku23bncxrsozfh6mr7pgsmjkge";
      const args = [2];

      const factory = await ethers.getContractFactory("RoyalGovernor");
      const PROPOSAL_FUNCTION = factory.interface.encodeFunctionData(
        "setProposalThreshold",
        args
      );

      await chainMine(2);
      //total suply prior to proposal
      console.log(
        `Total voting suply: ${await _token1Contract.getTotalSupply()}`
      );

      //check if proposalThreshold was changed
      console.log(
        `Old proposal Threshold: ${await _royalGovernorContract.proposalThreshold()}`
      );

      await executeDaoProcess(
        [_royalGovernorContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _minters[0],
        _minters,
        1,
        _royalGovernorContract,
        votingDelay,
        votingPeriod,
        executorMinDelay
      );

      //check if proposalThreshold was changed
      console.log(
        `New proposal Threshold: ${await _royalGovernorContract.proposalThreshold()}`
      );

      assert(
        (await _royalGovernorContract.proposalThreshold()).eq(2),
        "Proposal not executed correctly :-("
      );
    });
    it("Try to create a proposal and vote, but not reaching quorum. It should revert when trying to queue proposal", async function () {
      const { deployer, safeCaller } = await getNamedAccounts();
      const _web3: Web3 = web3;
      const _minters = await getAccount("minters", 10);

      const executorMinDelay = 272;
      const quorum = 25; //percentage
      const votingPeriod = 500; //~110 minutes in blocks
      const votingDelay = 30; //~7 minutes in blocks

      console.log(
        `***************************************** Mint Tokens *********************************************`
      );

      //mint token 1
      await mintTokens(_token1Contract, _minters, _minters.length);

      console.log(
        `****************************************************************************************************`
      );

      console.log(
        `************************************** Propose and Voting ******************************************`
      );

      //proposal
      const PROPOSAL_DESCRIPTION =
        "bafkreicwrdofqb56rkspleeo3deyxpl4ku23bncxrsozfh6mr7pgsmjkge";
      const args = [2];

      const factory = await ethers.getContractFactory("RoyalGovernor");
      const PROPOSAL_FUNCTION = factory.interface.encodeFunctionData(
        "setProposalThreshold",
        args
      );

      await executeDaoProcess(
        [_royalGovernorContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _minters[0],
        _minters.slice(0, 2),
        1,
        _royalGovernorContract,
        votingDelay,
        votingPeriod,
        executorMinDelay
      );

      await chainMine(1);

      //check if proposalThreshold was changed
      console.log(
        `New proposal Threshold: ${await _royalGovernorContract.proposalThreshold()}`
      );

      assert(
        (await _royalGovernorContract.proposalThreshold()).eq(1),
        "Proposal executed without quorum :-("
      );
    });
  });
});
