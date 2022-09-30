import { artifacts, ethers, network, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../../helper-hardhat.config";

const BASE_FEE = ethers.utils.parseEther("0.25");

// Calculated value based on the gas price on the chain
const GAS_PRICE_LINK = 1e9;

const deployToken5: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log, save, get } = deployments;

  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;

  const senate = await get("RepublicSenate");

  const Token5Factory = await ethers.getContractFactory("Token5");
  const token5 = await upgrades.deployProxy(Token5Factory, [senate.address]);
  await token5.deployed();

  console.log(token5.address, " Token5(Proxy) address");
  console.log(
    await upgrades.erc1967.getImplementationAddress(token5.address),
    " getImplementationAddress"
  );
  console.log(
    await upgrades.erc1967.getAdminAddress(token5.address),
    " getAdminAddress"
  );
  const artifact = await deployments.getArtifact("Token5");

  await save("Token5", {
    address: token5.address,
    ...artifact,
  });
};

export default deployToken5;

deployToken5.tags = ["all", "token5"];
