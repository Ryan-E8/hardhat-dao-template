import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { QUORUM_PERCENTAGE, VOTING_PERIOD, VOTING_DELAY } from "../helper-hardhat-config"

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  // We need to grab the governanceToken and timeLock contracts as parameters for our governor contract
  const governanceToken = await get("GovernanceToken")
  const timeLock = await get("TimeLock")

  log("----------------------------------------------------")
  log("Deploying GovernorContract and waiting for confirmations...")
  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: [
      governanceToken.address,
      timeLock.address,
      // Percent of voters to pass
      QUORUM_PERCENTAGE,
      // Duration of the vote in number of blocks
      VOTING_PERIOD,
      // Number of blocks till a proposal vote becomes active
      VOTING_DELAY,
    ],
    log: true,
    //waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`GovernorContract at ${governorContract.address}`)
}

export default deployGovernorContract
deployGovernorContract.tags = ["all", "governor"]