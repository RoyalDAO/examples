import { Token1, Token2, Token4, Token5, Token6 } from "../typechain-types";
import Web3 from "web3";
import { getAccount } from "./utils";

const { deployments, getNamedAccounts, web3, ethers } = require("hardhat");

export async function loadTokenSenatorContract(
  tokenContractName: string,
  senateAddress?: string
): Promise<any> {
  const { deploy, log, save, get } = deployments;
  const account = await getAccount("owner");
  const _web3: Web3 = web3;

  console.log(`Getting ${tokenContractName} contract...`);

  const factory = await ethers.getContractFactory(tokenContractName);

  const contract = await get(tokenContractName);

  const contractInstance = await factory.attach(contract.address);

  console.log(`${tokenContractName} address at: ${contractInstance.address}`);

  console.log(`Set senate to Token 1...`);

  if (senateAddress) {
    let seSenateTx = await contractInstance.setSenate(senateAddress);
    await seSenateTx.wait();

    console.log(
      `Senate of ${tokenContractName}: ${await contractInstance.getSenateAddress()}`
    );
  }

  return contractInstance;
}

export async function loadTokenVotesContract(
  tokenContractName: string,
  senateAddress?: string
): Promise<Token5> {
  const { deploy, log, save, get } = deployments;
  const account = await getAccount("owner");
  const _web3: Web3 = web3;

  console.log(`Getting ${tokenContractName} contract...`);

  const factory = await ethers.getContractFactory(tokenContractName);

  const contract = await get(tokenContractName);

  const contractInstance = await factory.attach(contract.address);

  console.log(`${tokenContractName} address at: ${contractInstance.address}`);

  console.log(`Set senate to Token 1...`);

  if (senateAddress) {
    let seSenateTx = await contractInstance.setSenate(senateAddress);
    await seSenateTx.wait();

    console.log(
      `Senate of ${tokenContractName}: ${await contractInstance.getSenateAddress()}`
    );
  }

  return contractInstance;
}
