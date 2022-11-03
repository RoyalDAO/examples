import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";
import { burnAddress, getAddress } from "../scripts/utils";
import { RoyalExecutor } from "../typechain-types";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployGovernor: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { get, save } = deployments;

  const quorum = 25; //percentage
  const votingPeriod = 500; //~110 minutes in blocks
  const votingDelay = 30; //blocks

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const token1 = await get("Token1");

  const executor = await get("RoyalExecutor");
  const executorFactory = await ethers.getContractFactory("RoyalExecutor");

  const executorInstance = executorFactory.attach(executor.address);

  const governorFactory = await ethers.getContractFactory("RoyalGovernor");
  const governor = await governorFactory.deploy(
    token1.address,
    executor.address,
    quorum,
    votingPeriod,
    votingDelay
  );

  await governor.deployed();

  console.log(governor.address, " Governor address");

  const governorInstance = await governorFactory.attach(governor.address);

  console.log(`Governor owner: ${await governorInstance.owner()}`);

  const owner = getAddress("owner");

  console.log("Giving Governor permissions in Timelock...");

  const proposer_role = await executorInstance.PROPOSER_ROLE();
  const executor_role = await executorInstance.EXECUTOR_ROLE();
  const timelock_admin_role = await executorInstance.TIMELOCK_ADMIN_ROLE();
  const canceler_role = await executorInstance.CANCELLER_ROLE();
  await executorInstance.grantRole(proposer_role, governor.address);
  await executorInstance.grantRole(canceler_role, governor.address);
  await executorInstance.grantRole(executor_role, burnAddress);
  const tx = await executorInstance.revokeRole(timelock_admin_role, owner);
  await tx.wait(1);

  console.log("Guess what? Now you can't do anything!");

  const artifact = await deployments.getArtifact("RoyalGovernor");

  await save("RoyalGovernor", {
    address: governor.address,
    ...artifact,
  });
};

export default deployGovernor;

deployGovernor.tags = ["all", "governor"];
