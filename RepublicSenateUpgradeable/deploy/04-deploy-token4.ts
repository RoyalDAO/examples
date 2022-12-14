import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat.config";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployToken4: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, save, get } = deployments;

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const senate = await get("UpgradeableRepublicSenate");

  const Token4Factory = await ethers.getContractFactory("Token4");
  const token4 = await upgrades.deployProxy(Token4Factory, [senate.address]);
  await token4.deployed();

  console.log(token4.address, " Token4(proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(token4.address),
    " getImplementationAddress"
  );
  console.log(
    await upgrades.erc1967.getAdminAddress(token4.address),
    " getAdminAddress"
  );

  const artifact = await deployments.getArtifact("Token4");

  await save("Token4", {
    address: token4.address,
    ...artifact,
  });
};

export default deployToken4;

deployToken4.tags = ["all", "token4"];
