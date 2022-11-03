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
import { chainMine, chainSleep, getAccount } from "../scripts/utils";
import { ProposalCreatedEvent } from "../typechain-types/@openzeppelin/contracts/governance/Governor";
import { ProposalQueuedEvent } from "../typechain-types/@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo";
import { network } from "hardhat";
import deployExecutor from "../deploy/01-deploy-royalExecutor";
import deployGovernor from "../deploy/02-deploy-royalGovernor";
import deployToken1 from "../deploy/03-deploy-token1";

const { deployments, getNamedAccounts, web3, ethers } = require("hardhat");
const { get } = deployments;
const gasPrice = "20"; //gwei

export async function mintTokens(
  tokenContract: Token1,
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

export async function transferToken(
  tokenContract: Token1,
  _from: any,
  _to: any,
  tokenId: number
) {
  const account = await getAccount("owner");
  const _web3: Web3 = web3;

  console.log(
    `Minter From ${_from.address} initial votes: ${await tokenContract.getVotes(
      _from.address
    )}`
  );

  console.log(
    `Minter To ${_to.address} initial votes: ${await tokenContract.getVotes(
      _to.address
    )}`
  );

  const tokenTransferTx = await tokenContract
    .connect(_from)
    ["safeTransferFrom(address,address,uint256)"](
      _from.address,
      _to.address,
      tokenId
    );
  const tokenTransferReceipt = await tokenTransferTx.wait(1);

  console.log(
    `Minter From ${_from.address} final votes: ${await tokenContract.getVotes(
      _from.address
    )}`
  );
  console.log(
    `Minter To ${_to.address} final votes: ${await tokenContract.getVotes(
      _to.address
    )}`
  );

  let mintCost = web3.utils.fromWei(
    tokenTransferReceipt.cumulativeGasUsed
      .mul(BigNumber.from(_web3.utils.toWei(gasPrice, "gwei")))
      .toString(),
    "ether"
  );

  console.log(`Transfer costs ${mintCost} at ${gasPrice} gwei`);
}

export async function propose(
  contractAddr: string[],
  values: any[],
  functionData: any[],
  proposer: any,
  proposalDescription: string,
  royalGovernor: RoyalGovernor
): Promise<BigNumber> {
  const account = await getAccount("owner");

  royalGovernor = await royalGovernor.connect(proposer);

  const proposalTx = await royalGovernor[
    "propose(address[],uint256[],bytes[],string)"
  ](contractAddr, values, functionData, proposalDescription);

  const receipt = await proposalTx.wait(1);

  let mintCost = web3.utils.fromWei(
    receipt.cumulativeGasUsed
      .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
      .toString(),
    "ether"
  );

  console.log(`Proposed! (${mintCost} eth at ${gasPrice} gwei)`);

  let propId: BigNumber;
  for (const ev of receipt!!.events!!) {
    if (ev.event == "ProposalCreated") {
      propId = (ev as ProposalCreatedEvent).args.proposalId;
      console.log(`Proposal Id: ${propId}`);
    }
  }

  console.log(
    `Proposal snapshot ${await royalGovernor.proposalSnapshot(propId!!)}`
  );
  console.log(
    `Proposal deadline ${await royalGovernor.proposalDeadline(propId!!)}`
  );
  console.log(
    `Proposal State: ${proposalStatesEnum[await royalGovernor.state(propId!!)]}`
  );
  return propId!!;
}

export async function vote(
  _from: any,
  proposal_id: BigNumber,
  vote: number,
  reason: String,
  royalGovernor: RoyalGovernor
): Promise<boolean> {
  let voteDesc = "IN FAVOR";
  let gasCost = 0;

  const _web3: Web3 = web3;
  if (vote == 0) voteDesc = "AGAINST ";
  else if (vote == 2) voteDesc = "ABSTAIN ";
  //0 = Against, 1 = For, 2 = Abstain for this example
  //you can all the #COUNTING_MODE() function to see how to vote otherwise

  royalGovernor = await royalGovernor.connect(_from);
  try {
    if (reason) {
      const tx = await royalGovernor.castVoteWithReason(
        proposal_id,
        vote,
        reason.toString()
      );
      const receipt = await tx.wait(1);

      let mintCost = web3.utils.fromWei(
        receipt.cumulativeGasUsed
          .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
          .toString(),
        "ether"
      );

      console.log(
        `${
          _from.address
        } voting ${voteDesc} (votes: ${await royalGovernor.getVotes(
          _from.address,
          await royalGovernor.proposalSnapshot(proposal_id!!)
        )}) on ${proposal_id} (${mintCost} eth at ${gasPrice} gwei)`
      );
    } else {
      const tx = await royalGovernor.castVote(proposal_id, vote);
      const receipt = await tx.wait(1);

      let mintCost = web3.utils.fromWei(
        receipt.cumulativeGasUsed
          .mul(BigNumber.from(_web3.utils.toWei(gasPrice, "gwei")))
          .toString(),
        "ether"
      );

      console.log(
        `${
          _from.address
        } voting ${voteDesc} (votes: ${await royalGovernor.getVotes(
          _from.address,
          await royalGovernor.proposalSnapshot(proposal_id!!)
        )}) on ${proposal_id} (${mintCost} eth at ${gasPrice} gwei)`
      );
    }
  } catch (err: any) {
    console.error(err.message);
    return false;
  }

  return true;
}

export async function queue(
  _from: any,
  contractAddress: string[],
  values: any[],
  functionData: any[],
  proposalDescription: string,
  royalGovernor: RoyalGovernor
): Promise<BigNumber> {
  const description_hash = ethers.utils.id(proposalDescription); //web3.utils.keccak256(proposalDescription)
  console.log(description_hash);
  let scheduleId: BigNumber;
  try {
    royalGovernor = await royalGovernor.connect(_from);

    const tx = await royalGovernor[
      "queue(address[],uint256[],bytes[],bytes32)"
    ](contractAddress, values, functionData, description_hash);
    const receipt = await tx.wait(1);

    let mintCost = web3.utils.fromWei(
      receipt.cumulativeGasUsed
        .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
        .toString(),
      "ether"
    );

    console.log(`Queued! (${mintCost} eth at ${gasPrice} gwei)`);

    for (const ev of receipt!!.events!!) {
      if (ev.event == "ProposalQueued") {
        scheduleId = (ev as ProposalQueuedEvent).args.proposalId;
      }
    }
    return scheduleId!!;
  } catch (err: any) {
    console.log(err.message);
    return BigNumber.from("0");
  }
}

export async function execute(
  _from: any,
  contractAddress: string[],
  values: any[],
  functionData: any[],
  proposalDescription: string,
  royalGovernor: RoyalGovernor
) {
  const description_hash = ethers.utils.id(proposalDescription);
  royalGovernor = await royalGovernor.connect(_from);

  try {
    const tx = await royalGovernor[
      "execute(address[],uint256[],bytes[],bytes32)"
    ](contractAddress, values, functionData, description_hash);
    const receipt = await tx.wait(1);

    let mintCost = web3.utils.fromWei(
      receipt.cumulativeGasUsed
        .mul(BigNumber.from(web3.utils.toWei(gasPrice, "gwei")))
        .toString(),
      "ether"
    );

    console.log(`Executed! (${mintCost} eth at ${gasPrice} gwei)`);
  } catch (err: any) {
    console.log(err.message);
  }
}

export async function executeDaoProcess(
  targets: string[],
  values: number[],
  proposalCallData: any[],
  proposalDescription: string,
  proposerSenator: any,
  _senators: any[],
  finalResult: number,
  _governorContract: RoyalGovernor,
  votingDelay: number,
  votingPeriod: number,
  executorMinDelay: number
): Promise<BigNumber> {
  let votesInFavor = _senators.length * 0.51; //51% of votes
  let votesAgainst = _senators.length * 0.25; //25% of votes

  if (finalResult == 0) {
    votesInFavor = _senators.length * 0.45; //45% of votes
    votesAgainst = _senators.length * 0.5; //50% of votes
  }

  //propose
  const propId = await propose(
    targets,
    values,
    proposalCallData,
    proposerSenator,
    proposalDescription,
    _governorContract!!
  );

  //mine voting delay
  console.log(`Mining ${votingDelay + 1} blocks for voting delay...`);
  await chainMine(votingDelay + 1);

  console.log(
    `******************************************** Voting ************************************************`
  );
  let voteCounter = 0;

  for (const senator of _senators) {
    voteCounter++;
    let voteOpt = 1;
    let voteDesc = "is in favor";

    if (voteCounter > votesInFavor + votesAgainst) {
      voteOpt = 2;
      voteDesc = "abstained";
    } else if (voteCounter > votesInFavor) {
      voteOpt = 0;
      voteDesc = "is against";
    }

    const minterVotingPower = Number(
      await _governorContract.getVotes(
        senator.address,
        await _governorContract.proposalSnapshot(propId!!)
      )
    );

    let voteResult = await vote(
      senator,
      propId,
      voteOpt,
      "",
      _governorContract
    );
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
  } = await _governorContract.proposals(propId);

  console.log(`In Favor: ${forVotes}`);
  console.log(`Against: ${againstVotes}`);
  console.log(`Abstained: ${abstainVotes}`);

  console.log(
    `****************************************************************************************************`
  );

  //mine voting period and try to queue
  console.log(`Mining ${votingPeriod + 1} blocks for voting period...`);
  await chainMine(votingPeriod + 1);

  console.log(
    `************************************** Queue and Executed ******************************************`
  );

  const schedulePropId = await queue(
    _senators[0],
    targets,
    values,
    proposalCallData,
    proposalDescription,
    _governorContract!!
  );

  console.log(
    `Sleeping ${executorMinDelay + 1} miliseconds for execution min delay...`
  );

  await chainSleep(executorMinDelay + 1);
  await chainMine(1);

  await execute(
    _senators[0],
    targets,
    values,
    proposalCallData,
    proposalDescription,
    _governorContract!!
  );

  console.log(
    `****************************************************************************************************`
  );

  return propId!!;
}

export enum proposalStatesEnum {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7,
}

export enum membershipStatus {
  NOT_MEMBER,
  ACTIVE_MEMBER,
  QUARANTINE_MEMBER,
  BANNED_MEMBER,
}

export enum senateSenatorStatus {
  NOT_SENATOR,
  ACTIVE_SENATOR,
  QUARANTINE_SENATOR,
  BANNED_SENATOR,
}
