import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { MIN_DELAY } from "../helper-hardhat-config"

const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying TimeLock and waiting for confirmations...")
  // Deploy TimeLock contract, we will only use MIN_DELAY = 1 hour after a vote passes, you have 1 hour before you can enact
  // We will not use proposers or executors
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: [MIN_DELAY, [], []],
    log: true,
    //waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`TimeLock at ${timeLock.address}`)
}

export default deployTimeLock
deployTimeLock.tags = ["all", "timelock"]