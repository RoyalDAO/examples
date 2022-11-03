import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";
import { burnAddress } from "../scripts/utils";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployToken1: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, save, get } = deployments;

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const Token1Factory = await ethers.getContractFactory("Token1");
  const token1 = await Token1Factory.deploy(burnAddress);
  await token1.deployed();

  console.log(token1.address, " Token1 address");

  const artifact = await deployments.getArtifact("Token1");

  await save("Token1", {
    address: token1.address,
    ...artifact,
  });
};

export default deployToken1;

deployToken1.tags = ["all", "token1"];
