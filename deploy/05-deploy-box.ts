import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying Box and waiting for confirmations...")
  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
    // waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  })
  log(`Box at ${box.address}`)
  // Our deployer deployed the box, Now we want to give ownership of it over to our TimeLock
  const boxContract = await ethers.getContractAt("Box", box.address)
  const timeLock = await ethers.getContract("TimeLock")
  // Transferred ownership to the TimeLock
  const transferTx = await boxContract.transferOwnership(timeLock.address)
  await transferTx.wait(1)
  log("Ownership transferred!")
}

export default deployBox
deployBox.tags = ["all", "box"]