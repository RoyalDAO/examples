import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";
import { burnAddress, getAddress } from "../scripts/utils";
import { RepublicExecutor } from "../typechain-types";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deploySenate: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { get, save } = deployments;

  const executorMinDelay = 272;
  const quorum = 25; //percentage
  const votingPeriod = 500; //~110 minutes in blocks
  const votingDelay = 30; //blocks
  const tokenTreshold = 1; //token qtty
  const quaratinePeriod = 500; //~110 minutes in blocks
  const mandatePeriod = 500; //~110 minutes in blocks

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const executor = await get("RepublicExecutor");
  //we deploy senate without tokens. We call openSenate after the house is up
  const senateFactory = await ethers.getContractFactory("RepublicSenate");
  const senate = await senateFactory.deploy(
    deployer,
    executor.address,
    votingDelay,
    votingPeriod,
    tokenTreshold,
    quorum,
    quaratinePeriod,
    mandatePeriod
  );

  await senate.deployed();

  console.log(senate.address, " Senate address");

  const senateInstance = await senateFactory.attach(senate.address);

  console.log(`Senate owner: ${await senateInstance.owner()}`);

  const artifact = await deployments.getArtifact("RepublicSenate");

  await save("RepublicSenate", {
    address: senate.address,
    ...artifact,
  });
};

export default deploySenate;

deploySenate.tags = ["all", "senate"];
