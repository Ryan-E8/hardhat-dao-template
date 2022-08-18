import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ADDRESS_ZERO } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  // Get contracts so we can interact with them
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  log("----------------------------------------------------")
  log("Setting up contracts for roles...")
  // Get the roles
  const proposerRole = await timeLock.PROPOSER_ROLE()
  const executorRole = await timeLock.EXECUTOR_ROLE()
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

  // Give the governor contract the proposer role
  const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
  await proposerTx.wait(1)
  // Set the executor role to nobody (which means everybody)
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
  await executorTx.wait(1)
  // Now that we've set all of the roles, we want to revoke admin rights from our deployer because currently it owns it
  const revokeTx = await timeLock.revokeRole(adminRole, deployer)
  await revokeTx.wait(1)
  // Guess what? Now, anything the timelock wants to do has to go through the governance process!
  // Now after this runs, nobody owns the TimeLock!
  // It is impossible for anyone to do anything with the TimeLock without governance happening!
}

export default setupContracts
setupContracts.tags = ["all", "setup"]