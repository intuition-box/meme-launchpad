import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the MemeLaunchpad contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMemeLaunchpad: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy MemeLaunchpad contract
  await deploy("MemeLaunchpad", {
    from: deployer,
    // MemeLaunchpad has no constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const memeLaunchpad = await hre.ethers.getContract<Contract>("MemeLaunchpad", deployer);
  console.log("🚀 MemeLaunchpad deployed at:", await memeLaunchpad.getAddress());
  console.log("📊 Total tokens created:", await memeLaunchpad.allTokensLength());
};

export default deployMemeLaunchpad;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MemeLaunchpad
deployMemeLaunchpad.tags = ["MemeLaunchpad"];
