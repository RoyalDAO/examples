import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import {
  UpgradeableRepublicChancelor,
  UpgradeableRepublicChancelor__factory,
  UpgradeableRepublicExecutor,
  UpgradeableRepublicExecutor__factory,
  UpgradeableRepublicSenate,
  UpgradeableRepublicSenate__factory,
  Token1,
  Token1__factory,
  Token2,
  Token2__factory,
  Token3,
  Token3__factory,
  Token4,
  Token4__factory,
  Token5,
  Token5__factory,
  Token6,
  Token6__factory,
} from "../typechain-types";
import Web3 from "web3";
import deployToken1 from "../deploy/01-deploy-upgradeable/04-deploy-token1";
import { chainMine, chainSleep, getAccount } from "../scripts/utils";
import { ProposalCreatedEvent } from "../typechain-types/@royaldao/contracts-upgradeable/Governance/ChancelorUpgradeable";
import { ProposalQueuedEvent } from "../typechain-types/@royaldao/contracts-upgradeable/Governance/compatibility/ChancelorCompatibilityBravoUpgradeable";
import deployToken2 from "../deploy/01-deploy-upgradeable/04-deploy-token2";
import { network } from "hardhat";
import deployNewCommer from "../deploy/01-deploy-upgradeable/08-deploy-newCommer";
import deployToken3 from "../deploy/01-deploy-upgradeable/04-deploy-token3";
import deployToken4 from "../deploy/01-deploy-upgradeable/04-deploy-token4";
import deployToken5 from "../deploy/01-deploy-upgradeable/04-deploy-token5";
import deployToken6 from "../deploy/01-deploy-upgradeable/04-deploy-token6";
import deployExecutorUpg from "../deploy/01-deploy-upgradeable/01-deploy-republicExecutorUpg";
import deploySenateUpg from "../deploy/01-deploy-upgradeable/02-deploy-republicSenateUpg";
import deployChancelorUpg from "../deploy/01-deploy-upgradeable/03-deploy-republicChancelorUpg";

const hre = require("hardhat");
describe("RepublicSenateDaoUpgd", function () {
  const { deployments, getNamedAccounts, web3, ethers } = require("hardhat");
  const { get } = deployments;

  const executorMinDelay = 272;
  const quorum = 25; //percentage
  const votingPeriod = 500; //~110 minutes in blocks
  const votingDelay = 30; //~7 minutes in blocks

  const gasPrice = "20"; //gwei

  //Upg Tokens
  let _token1Contract: Token1;
  let _token2Contract: Token2;
  let _token3Contract: Token3;
  let _token4Contract: Token4;
  let _token5Contract: Token5;
  //Tokens
  let _token6Contract: Token6;

  let _republicExecutorContract: UpgradeableRepublicExecutor;
  let _republicSenateContract: UpgradeableRepublicSenate;
  let _republicChancelorContract: UpgradeableRepublicChancelor;
  beforeEach(async function () {
    const { deployer, safeCaller } = await getNamedAccounts();

    await deployExecutorUpg(hre);
    await deploySenateUpg(hre);
    await deployToken1(hre);
    await deployToken2(hre);
    await deployToken3(hre);
    await deployToken4(hre);
    await deployToken5(hre);
    await deployToken6(hre);
    await deployChancelorUpg(hre);

    const token1Factory: Token1__factory = await ethers.getContractFactory(
      "Token1"
    );
    const _token1 = await get("Token1");

    _token1Contract = await token1Factory.attach(_token1.address);

    const token2Factory: Token2__factory = await ethers.getContractFactory(
      "Token2"
    );
    const _token2 = await get("Token2");

    _token2Contract = await token2Factory.attach(_token2.address);

    const token3Factory: Token3__factory = await ethers.getContractFactory(
      "Token3"
    );
    const _token3 = await get("Token3");

    _token3Contract = await token2Factory.attach(_token3.address);

    const token4Factory: Token4__factory = await ethers.getContractFactory(
      "Token4"
    );
    const _token4 = await get("Token4");

    _token4Contract = await token4Factory.attach(_token4.address);

    const token5Factory: Token5__factory = await ethers.getContractFactory(
      "Token5"
    );
    const _token5 = await get("Token5");

    _token5Contract = await token5Factory.attach(_token5.address);

    const token6Factory: Token6__factory = await ethers.getContractFactory(
      "Token6"
    );
    const _token6 = await get("Token6");

    _token6Contract = await token6Factory.attach(_token6.address);

    const executorFactory: UpgradeableRepublicExecutor__factory =
      await ethers.getContractFactory("UpgradeableRepublicExecutor");
    const _executor = await get("UpgradeableRepublicExecutor");

    _republicExecutorContract = await executorFactory.attach(_executor.address);

    const chancelorFactory: UpgradeableRepublicChancelor__factory =
      await ethers.getContractFactory("UpgradeableRepublicChancelor");
    const _chancelor = await get("UpgradeableRepublicChancelor");

    _republicChancelorContract = await chancelorFactory.attach(
      _chancelor.address
    );

    const senateFactory: UpgradeableRepublicSenate__factory =
      await ethers.getContractFactory("UpgradeableRepublicSenate");
    const _senate = await get("UpgradeableRepublicSenate");

    _republicSenateContract = await senateFactory.attach(_senate.address);

    //open senate
    console.log(`Lets open senate...`);
    console.log(`Senate Owner: ${await _republicSenateContract.owner()}`);
    console.log(`Deployer: ${deployer}`);
    const openSenateTx = await _republicSenateContract.openSenate([
      _token1.address,
      _token2.address,
      _token3.address,
      _token4.address,
      _token5.address,
      _token6.address,
    ]);

    const openSenateReceipt = await openSenateTx.wait(1);

    console.log(
      `Gas cost of Senate Opening at ${gasPrice} gwei: ${web3.utils.fromWei(
        openSenateReceipt.cumulativeGasUsed
          .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
          .toString(),
        "ether"
      )} eth`
    );

    console.log(await _republicSenateContract.getOldDogs());
    console.log(await _republicSenateContract.getNewGang());
    console.log(`Senate Opened!`);

    //
    assert(_token1Contract, "Could not deploy token 1 contract");
    assert(_token2Contract, "Could not deploy token 2 contract");
    assert(_token3Contract, "Could not deploy token 3 contract");
    assert(_token4Contract, "Could not deploy token 4 contract");
    assert(_token5Contract, "Could not deploy token 5 contract");
    assert(_republicExecutorContract, "Could not deploy executor contract");
    assert(_republicSenateContract, "Could not deploy senate contract");
    assert(_republicChancelorContract, "Could not deploy chancelor contract");
  });
  describe("RepublicSenateDaoUpgd::DaoTest", function () {
    it("Try to create a proposal and vote. It should work with no problems", async function () {
      const { deployer, safeCaller } = await getNamedAccounts();
      const _web3: Web3 = web3;
      const _minters = await getAccount("minters", 10);

      //mint token 1
      await mintTokens(_token1Contract, _minters, _minters.length);
      //mint token 2
      await mintTokens(_token2Contract, _minters, _minters.length);
      //mint token 3
      await mintTokens(_token3Contract, _minters, _minters.length);
      //mint token 4
      await mintTokens(_token4Contract, _minters, _minters.length);
      //mint token 5
      await mintTokens(_token5Contract, _minters, _minters.length);
      //mint token 6
      //await mintTokens(_token6Contract, _minters, _minters.length);

      //proposal
      const PROPOSAL_DESCRIPTION =
        "bafkreicwrdofqb56rkspleeo3deyxpl4ku23bncxrsozfh6mr7pgsmjkge";
      const args = [2];

      const factory = await ethers.getContractFactory(
        "UpgradeableRepublicSenate"
      );
      const PROPOSAL_FUNCTION = factory.interface.encodeFunctionData(
        "setProposalThreshold",
        args
      );

      await chainMine(2);
      //total suply prior to proposal
      console.log(
        `Total voting suply: ${await _republicSenateContract.getTotalSuply()}`
      );
      //propose
      const propId = await propose(
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        _minters[0],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal snapshot ${await _republicChancelorContract.proposalSnapshot(
          propId!!
        )}`
      );
      console.log(
        `Proposal deadline ${await _republicChancelorContract.proposalDeadline(
          propId!!
        )}`
      );
      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //mine voting delay
      console.log("Mint blocks for voting delay and try to vote...");
      await chainMine(votingDelay + 1);

      console.log(
        `Proposal Quorum: ${await _republicChancelorContract.quorum(
          await _republicChancelorContract.proposalSnapshot(propId!!)
        )}`
      );

      for (const minter of _minters) {
        let voteOpt = 1;
        let voteDesc = "is in favor";

        const minterVotingPower = Number(
          await _republicChancelorContract.getVotes(
            minter.address,
            await _republicChancelorContract.proposalSnapshot(propId!!)
          )
        );

        console.log(`Minter Voting Power: ${minterVotingPower}`);

        let voteResult = await vote(
          minter,
          propId,
          voteOpt,
          "",
          _republicChancelorContract
        );

        console.log(`Voter ${minter.address} voted ${voteDesc}`);
      }
      const {
        id,
        proposer,
        eta,
        startBlock,
        endBlock,
        forVotes,
        againstVotes,
        abstainVotes,
        canceled,
        executed,
      } = await _republicChancelorContract.proposals(propId);

      console.log(`In Favor: ${forVotes}`);
      console.log(`Against: ${againstVotes}`);
      console.log(`Abstained: ${abstainVotes}`);
      console.log(`startBlock: ${startBlock}`);
      console.log(`endBlock: ${endBlock}`);

      //mine voting period and try to vote
      await chainMine(votingPeriod);

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      console.log(
        `Quorum Reached: ${await _republicChancelorContract.quorumReached(
          propId!!
        )}`
      );

      const schedulePropId = await queue(
        _minters[0],
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      await chainSleep(executorMinDelay + 1);
      await chainMine(1);

      //check if proposalThreshold was changed
      console.log(
        `Old proposal Threshold: ${await _republicChancelorContract.proposalThreshold()}`
      );

      await execute(
        _minters[0],
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //check if proposalThreshold was changed
      console.log(
        `New proposal Threshold: ${await _republicChancelorContract.proposalThreshold()}`
      );

      assert(
        (await _republicChancelorContract.proposalThreshold()).eq(2),
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

      //mint token 1
      await mintTokens(_token1Contract, _minters, _minters.length);
      //mint token 2
      await mintTokens(_token2Contract, _minters, _minters.length);
      //mint token 3
      await mintTokens(_token3Contract, _minters, _minters.length);
      //mint token 4
      await mintTokens(_token4Contract, _minters, _minters.length);
      //mint token 6
      await mintTokens(_token6Contract, _minters, _minters.length);

      //proposal
      const PROPOSAL_DESCRIPTION =
        "bafkreicwrdofqb56rkspleeo3deyxpl4ku23bncxrsozfh6mr7pgsmjkge";
      const args = [2];

      const factory = await ethers.getContractFactory(
        "UpgradeableRepublicSenate"
      );
      const PROPOSAL_FUNCTION = factory.interface.encodeFunctionData(
        "setProposalThreshold",
        args
      );

      //propose
      const propId = await propose(
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        _minters[0],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal snapshot ${await _republicChancelorContract.proposalSnapshot(
          propId!!
        )}`
      );
      console.log(
        `Proposal deadline ${await _republicChancelorContract.proposalDeadline(
          propId!!
        )}`
      );
      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //mine voting delay
      console.log("Mint blocks for voting delay and try to vote...");
      await chainMine(votingDelay + 1);

      console.log(
        `Proposal Quorum: ${await _republicChancelorContract.quorum(
          await _republicChancelorContract.proposalSnapshot(propId!!)
        )}`
      );

      let voteOpt = 1;
      let voteDesc = "is in favor";

      const minterVotingPower = Number(
        await _republicChancelorContract.getVotes(
          _minters[0].address,
          await _republicChancelorContract.proposalSnapshot(propId!!)
        )
      );

      console.log(`Minter Voting Power: ${minterVotingPower}`);

      let voteResult = await vote(
        _minters[0],
        propId,
        voteOpt,
        "",
        _republicChancelorContract
      );

      console.log(`Voter ${_minters[0].address} voted ${voteDesc}`);

      const {
        id,
        proposer,
        eta,
        startBlock,
        endBlock,
        forVotes,
        againstVotes,
        abstainVotes,
        canceled,
        executed,
      } = await _republicChancelorContract.proposals(propId);

      console.log(`In Favor: ${forVotes}`);
      console.log(`Against: ${againstVotes}`);
      console.log(`Abstained: ${abstainVotes}`);

      //mine voting period and try to queue
      await chainMine(votingPeriod + 1);

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      console.log(
        `Quorum Reached: ${await _republicChancelorContract.quorumReached(
          propId!!
        )}`
      );

      const schedulePropId = await queue(
        _minters[0],
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      await chainSleep(executorMinDelay + 1);
      await chainMine(1);
    });
  });
  describe("RepublicSenateDaoUpgd::SenateTest", function () {
    it("Try to accept new senate member through proposal. It should work with no problems", async function () {
      const { deployer, safeCaller } = await getNamedAccounts();
      const _web3: Web3 = web3;
      const _minters = await getAccount("minters", 10);

      await deployNewCommer(hre);

      const newCommer = await get("NewCommer");

      console.log(`New Commer Address: ${newCommer.address}`);

      for (const minter of _minters) {
        const mintTx = await _token1Contract.safeMint(minter.address);
        await mintTx.wait(1);

        console.log(
          `Minter ${
            minter.address
          } balance (Token 1): ${await _token1Contract.balanceOf(
            minter.address
          )} Votes: ${await _token1Contract.getVotes(minter.address)}`
        );

        const mintTx2 = await _token2Contract.safeMint(minter.address);
        await mintTx2.wait(1);

        console.log(
          `Minter ${
            minter.address
          } balance (Token 2): ${await _token2Contract.balanceOf(
            minter.address
          )} Votes: ${await _token2Contract.getVotes(minter.address)}`
        );

        assert(
          (await _token1Contract.balanceOf(minter.address)).eq(1),
          "Token not minted :-("
        );
        assert(
          (await _token1Contract.getVotes(minter.address)).gt(0),
          "Didnt get votes :-("
        );
        assert(
          (await _token2Contract.balanceOf(minter.address)).eq(1),
          "Token 2 not minted :-("
        );
        assert(
          (await _token2Contract.getVotes(minter.address)).gt(0),
          "Didnt get votes token 2 :-("
        );
      }

      //proposal
      const PROPOSAL_DESCRIPTION =
        "bafkreicwrdofqb56rkspleeo3deyxpl4ku23bncxrsozfh6mr7pgsmjkge";
      const args = [newCommer.address];

      const factory = await ethers.getContractFactory(
        "UpgradeableRepublicSenate"
      );
      const PROPOSAL_FUNCTION = factory.interface.encodeFunctionData(
        "acceptToSenate",
        args
      );

      //propose
      const propId = await propose(
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        _minters[0],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal snapshot ${await _republicChancelorContract.proposalSnapshot(
          propId!!
        )}`
      );
      console.log(
        `Proposal deadline ${await _republicChancelorContract.proposalDeadline(
          propId!!
        )}`
      );
      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //mine voting delay
      console.log("Mint blocks for voting delay and try to vote...");
      await chainMine(votingDelay + 1);

      console.log(
        `Proposal Quorum: ${await _republicChancelorContract.quorum(
          await _republicChancelorContract.proposalSnapshot(propId!!)
        )}`
      );

      for (const minter of _minters) {
        let voteOpt = 1;
        let voteDesc = "is in favor";

        const minterVotingPower = Number(
          await _republicChancelorContract.getVotes(
            minter.address,
            await _republicChancelorContract.proposalSnapshot(propId!!)
          )
        );

        console.log(`Minter Voting Power: ${minterVotingPower}`);

        let voteResult = await vote(
          minter,
          propId,
          voteOpt,
          "",
          _republicChancelorContract
        );

        console.log(`Voter ${minter.address} voted ${voteDesc}`);
      }
      const {
        id,
        proposer,
        eta,
        startBlock,
        endBlock,
        forVotes,
        againstVotes,
        abstainVotes,
        canceled,
        executed,
      } = await _republicChancelorContract.proposals(propId);

      console.log(`In Favor: ${forVotes}`);
      console.log(`Against: ${againstVotes}`);
      console.log(`Abstained: ${abstainVotes}`);
      console.log(`startBlock: ${startBlock}`);
      console.log(`endBlock: ${endBlock}`);

      //mine voting period and try to vote
      await chainMine(votingPeriod);

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      console.log(
        `Quorum Reached: ${await _republicChancelorContract.quorumReached(
          propId!!
        )}`
      );

      const schedulePropId = await queue(
        _minters[0],
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      await chainSleep(executorMinDelay + 1);
      await chainMine(1);

      //check if proposalThreshold was changed
      console.log(
        `Old proposal Threshold: ${_republicChancelorContract.proposalThreshold()}`
      );

      await execute(
        _minters[0],
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //check if proposalThreshold was changed
      const newMemberStatus = await _republicSenateContract.senateMemberStatus(
        newCommer.address
      );
      console.log(`New Member Status: ${membershipStatus[newMemberStatus]}`);

      assert(
        newMemberStatus == membershipStatus.ACTIVE_MEMBER,
        "Proposal not executed correctly :-("
      );
    });
    it("Try to accept new senate member through proposal but refused by dao. It should not add member to senate", async function () {
      const { deployer, safeCaller } = await getNamedAccounts();
      const _web3: Web3 = web3;
      const _minters = await getAccount("minters", 10);

      await deployNewCommer(hre);

      const newCommer = await get("NewCommer");

      console.log(`New Commer Address: ${newCommer.address}`);

      for (const minter of _minters) {
        const mintTx = await _token1Contract.safeMint(minter.address);
        await mintTx.wait(1);

        console.log(
          `Minter ${
            minter.address
          } balance (Token 1): ${await _token1Contract.balanceOf(
            minter.address
          )} Votes: ${await _token1Contract.getVotes(minter.address)}`
        );

        const mintTx2 = await _token2Contract.safeMint(minter.address);
        await mintTx2.wait(1);

        console.log(
          `Minter ${
            minter.address
          } balance (Token 2): ${await _token2Contract.balanceOf(
            minter.address
          )} Votes: ${await _token2Contract.getVotes(minter.address)}`
        );

        assert(
          (await _token1Contract.balanceOf(minter.address)).eq(1),
          "Token not minted :-("
        );
        assert(
          (await _token1Contract.getVotes(minter.address)).gt(0),
          "Didnt get votes :-("
        );
        assert(
          (await _token2Contract.balanceOf(minter.address)).eq(1),
          "Token 2 not minted :-("
        );
        assert(
          (await _token2Contract.getVotes(minter.address)).gt(0),
          "Didnt get votes token 2 :-("
        );
      }

      //proposal
      const PROPOSAL_DESCRIPTION =
        "bafkreicwrdofqb56rkspleeo3deyxpl4ku23bncxrsozfh6mr7pgsmjkge";
      const args = [newCommer.address];

      const factory = await ethers.getContractFactory(
        "UpgradeableRepublicSenate"
      );
      const PROPOSAL_FUNCTION = factory.interface.encodeFunctionData(
        "acceptToSenate",
        args
      );

      //propose
      const propId = await propose(
        [_republicSenateContract.address],
        [0],
        [PROPOSAL_FUNCTION],
        _minters[0],
        PROPOSAL_DESCRIPTION,
        _republicChancelorContract!!
      );

      console.log(
        `Proposal snapshot ${await _republicChancelorContract.proposalSnapshot(
          propId!!
        )}`
      );
      console.log(
        `Proposal deadline ${await _republicChancelorContract.proposalDeadline(
          propId!!
        )}`
      );
      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //mine voting delay
      console.log("Mint blocks for voting delay and try to vote...");
      await chainMine(votingDelay + 1);

      console.log(
        `Proposal Quorum: ${await _republicChancelorContract.quorum(
          await _republicChancelorContract.proposalSnapshot(propId!!)
        )}`
      );
      let voteCounter = 0;
      for (const minter of _minters) {
        voteCounter++;
        let voteOpt = 1;
        let voteDesc = "is in favor";

        if (voteCounter > _minters.length / 3) {
          voteOpt = 0;
          voteDesc = "is against";
        }
        const minterVotingPower = Number(
          await _republicChancelorContract.getVotes(
            minter.address,
            await _republicChancelorContract.proposalSnapshot(propId!!)
          )
        );

        console.log(`Minter Voting Power: ${minterVotingPower}`);

        let voteResult = await vote(
          minter,
          propId,
          voteOpt,
          "",
          _republicChancelorContract
        );

        console.log(`Voter ${minter.address} voted ${voteDesc}`);
      }
      const {
        id,
        proposer,
        eta,
        startBlock,
        endBlock,
        forVotes,
        againstVotes,
        abstainVotes,
        canceled,
        executed,
      } = await _republicChancelorContract.proposals(propId);

      console.log(`In Favor: ${forVotes}`);
      console.log(`Against: ${againstVotes}`);
      console.log(`Abstained: ${abstainVotes}`);
      console.log(`startBlock: ${startBlock}`);
      console.log(`endBlock: ${endBlock}`);

      //mine voting period and try to vote
      await chainMine(votingPeriod);

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      console.log(
        `Quorum Reached: ${await _republicChancelorContract.quorumReached(
          propId!!
        )}`
      );

      try {
        const schedulePropId = await queue(
          _minters[0],
          [_republicSenateContract.address],
          [0],
          [PROPOSAL_FUNCTION],
          PROPOSAL_DESCRIPTION,
          _republicChancelorContract!!
        );

        assert(
          (await _republicChancelorContract.state(propId!!)) !=
            proposalStatesEnum.Queued,
          "Queued a rejected proposal :-()"
        );
      } catch (err: any) {
        console.error(`Erro queueing proposal: ${err.message}`);
      }

      console.log(
        `Proposal State: ${
          proposalStatesEnum[await _republicChancelorContract.state(propId!!)]
        }`
      );

      //check if proposalThreshold was changed
      const newMemberStatus = await _republicSenateContract.senateMemberStatus(
        newCommer.address
      );
      console.log(`New Member Status: ${membershipStatus[newMemberStatus]}`);

      assert(
        newMemberStatus == membershipStatus.NOT_MEMBER,
        "Member accepted when it shouldn't :-("
      );
    });
  });

  async function mintTokens(
    tokenContract: Token1 | Token2 | Token3 | Token4 | Token5 | Token6,
    _minters: any[],
    tokenQtty: Number
  ) {
    const account = await getAccount("owner");
    const _web3: Web3 = web3;

    for (let idx = 0; idx < tokenQtty; idx++) {
      const minter = _minters[idx];

      const mintTx = await tokenContract.safeMint(minter.address);
      let mintReceipt = await mintTx.wait(1);

      let mintCost = web3.utils.fromWei(
        mintReceipt.cumulativeGasUsed
          .mul(BigNumber.from(_web3.utils.toWei(gasPrice, "gwei")))
          .toString(),
        "ether"
      );

      console.log(
        `Minter ${
          minter.address
        } balance (${await tokenContract.name()}): ${await tokenContract.balanceOf(
          minter.address
        )} Votes: ${await tokenContract.getVotes(
          minter.address
        )} (${mintCost} at ${gasPrice} gwei)`
      );

      assert(
        (await tokenContract.balanceOf(minter.address)).eq(1),
        `${await tokenContract.name()} not minted :-(`
      );
      assert(
        (await tokenContract.getVotes(minter.address)).gt(0),
        `Didnt get votes for ${await tokenContract.name()} :-(`
      );
    }
  }

  async function propose(
    contractAddr: string[],
    values: any[],
    functionData: any[],
    proposer: any,
    proposalDescription: string,
    republicChancelor: UpgradeableRepublicChancelor
  ): Promise<BigNumber> {
    const account = await getAccount("owner");

    republicChancelor = await republicChancelor.connect(proposer);

    const proposalTx = await republicChancelor[
      "propose(address[],uint256[],bytes[],string)"
    ](contractAddr, values, functionData, proposalDescription);

    console.log("Step 3...");
    const receipt = await proposalTx.wait(1);

    console.log(
      `Gas cost of proposal at ${gasPrice} gwei: ${web3.utils.fromWei(
        receipt.cumulativeGasUsed
          .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
          .toString(),
        "ether"
      )} eth`
    );

    let propId: BigNumber;
    for (const ev of receipt!!.events!!) {
      if (ev.event == "ProposalCreated") {
        propId = (ev as ProposalCreatedEvent).args.proposalId;
        console.log(`Proposal Id: ${propId}`);
      }
    }

    console.log(
      `Proposal snapshot ${await republicChancelor.proposalSnapshot(propId!!)}`
    );
    console.log(
      `Proposal deadline ${await republicChancelor.proposalDeadline(propId!!)}`
    );
    console.log(
      `Proposal State: ${
        proposalStatesEnum[await republicChancelor.state(propId!!)]
      }`
    );
    return propId!!;
  }

  async function vote(
    _from: any,
    proposal_id: BigNumber,
    vote: number,
    reason: String,
    republicChancelor: UpgradeableRepublicChancelor
  ): Promise<boolean> {
    let voteDesc = "IN FAVOR";

    if (vote == 0) voteDesc = "AGAINST";
    else if (vote == 2) voteDesc = "ABSTAIN";
    //0 = Against, 1 = For, 2 = Abstain for this example
    //you can all the #COUNTING_MODE() function to see how to vote otherwise
    console.log(`${_from.address} voting ${voteDesc} on ${proposal_id}`);
    republicChancelor = await republicChancelor.connect(_from);
    try {
      if (reason) {
        const tx = await republicChancelor.castVoteWithReason(
          proposal_id,
          vote,
          reason.toString()
        );
        await tx.wait(1);
      } else {
        const tx = await republicChancelor.castVote(proposal_id, vote);
        const receipt = await tx.wait(1);

        console.log(
          `Gas cost of vote at ${gasPrice} gwei: ${web3.utils.fromWei(
            receipt.cumulativeGasUsed
              .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
              .toString(),
            "ether"
          )} eth`
        );
        //console.log(receipt.events)
      }
    } catch (err: any) {
      console.error(err.message);
      return false;
    }

    return true;
  }

  async function queue(
    _from: any,
    contractAddress: string[],
    values: any[],
    functionData: any[],
    proposalDescription: string,
    republicChancelor: UpgradeableRepublicChancelor
  ): Promise<BigNumber> {
    const description_hash = ethers.utils.id(proposalDescription); //web3.utils.keccak256(proposalDescription)
    console.log(description_hash);
    let scheduleId: BigNumber;
    try {
      console.log(`from Account: ${_from.address}`);
      republicChancelor = await republicChancelor.connect(_from);

      const tx = await republicChancelor[
        "queue(address[],uint256[],bytes[],bytes32)"
      ](contractAddress, values, functionData, description_hash);
      const receipt = await tx.wait(1);
      for (const ev of receipt!!.events!!) {
        if (ev.event == "ProposalQueued") {
          scheduleId = (ev as ProposalQueuedEvent).args.proposalId;
          console.log(`Proposal Schedule Id: ${scheduleId}`);
        }
      }
      return scheduleId!!;
    } catch (err: any) {
      console.log(err.message);
      return BigNumber.from("0");
    }
  }

  async function execute(
    _from: any,
    contractAddress: string[],
    values: any[],
    functionData: any[],
    proposalDescription: string,
    republicChancelor: UpgradeableRepublicChancelor
  ) {
    const description_hash = ethers.utils.id(proposalDescription);
    republicChancelor = await republicChancelor.connect(_from);

    try {
      const tx = await republicChancelor[
        "execute(address[],uint256[],bytes[],bytes32)"
      ](contractAddress, values, functionData, description_hash);
      tx.wait(1);
    } catch (err: any) {
      console.log(err.message);
    }
  }

  enum proposalStatesEnum {
    Pending = 0,
    Active = 1,
    Canceled = 2,
    Defeated = 3,
    Succeeded = 4,
    Queued = 5,
    Expired = 6,
    Executed = 7,
  }

  enum membershipStatus {
    NOT_MEMBER,
    ACTIVE_MEMBER,
    QUARANTINE_MEMBER,
    BANNED_MEMBER,
  }
});
