import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployNewCommer: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, save } = deployments;

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const NewCommerFactory = await ethers.getContractFactory("NewCommer");
  const newCommer = await NewCommerFactory.deploy();
  await newCommer.deployed();

  console.log(newCommer.address, " NewCommer address");

  const artifact = await deployments.getArtifact("NewCommer");

  await save("NewCommer", {
    address: newCommer.address,
    ...artifact,
  });
};

export default deployNewCommer;

deployNewCommer.tags = ["all", "NewCommer"];
