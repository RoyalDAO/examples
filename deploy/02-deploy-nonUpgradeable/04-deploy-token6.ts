import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../../helper-hardhat.config";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployToken6: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, save, get } = deployments;

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const senate = await get("RepublicSenate");

  const Token6Factory = await ethers.getContractFactory("Token6");
  const token6 = await Token6Factory.deploy(senate.address);
  await token6.deployed();

  console.log(token6.address, " Token6 address");

  const artifact = await deployments.getArtifact("Token6");

  await save("Token6", {
    address: token6.address,
    ...artifact,
  });
};

export default deployToken6;

deployToken6.tags = ["all", "token6"];
