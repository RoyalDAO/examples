import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";
import { burnAddress, getAddress } from "../scripts/utils";
import { RepublicExecutor } from "../typechain-types";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployChancellor: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { get, save } = deployments;

  const executorMinDelay = 272;
  const quorum = 25; //percentage
  const votingPeriod = 500; //~110 minutes in blocks
  const votingDelay = 30; //~7 minutes in blocks
  const tokenTreshold = 1; //~7 minutes in blocks

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const executorFactory = await ethers.getContractFactory("RepublicExecutor");

  const executor = await get("RepublicExecutor");
  const executorInstance: RepublicExecutor = executorFactory.attach(
    executor.address
  );

  const senate = await get("RepublicSenate");

  console.log(`Executor address: ${executor.address}`);
  const chancelorFactory = await ethers.getContractFactory(
    "RepublicChancellor"
  );
  const chancelor = await chancelorFactory.deploy(
    executor.address,
    senate.address
  );

  await chancelor.deployed();

  console.log(chancelor.address, " Chancellor address");

  const owner = getAddress("owner");

  const proposer_role = await executorInstance.PROPOSER_ROLE();
  const executor_role = await executorInstance.EXECUTOR_ROLE();
  const timelock_admin_role = await executorInstance.TIMELOCK_ADMIN_ROLE();
  const canceler_role = await executorInstance.CANCELLER_ROLE();
  await executorInstance.grantRole(proposer_role, chancelor.address);
  await executorInstance.grantRole(canceler_role, chancelor.address);
  await executorInstance.grantRole(executor_role, burnAddress);
  const tx = await executorInstance.revokeRole(timelock_admin_role, owner);
  await tx.wait(1);

  console.log("Guess what? Now you can't do anything!");

  const artifact = await deployments.getArtifact("RepublicChancellor");

  await save("RepublicChancellor", {
    address: chancelor.address,
    ...artifact,
  });
};

export default deployChancellor;

deployChancellor.tags = ["all", "chancellor"];
