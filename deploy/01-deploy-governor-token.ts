import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("----------------------------------------------------")
    log("Deploying GovernanceToken and waiting for confirmations...")
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        //waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`GovernanceToken at ${governanceToken.address}`)
    log(`Delegating to ${deployer}`)
    await delegate(governanceToken.address, deployer)
    log("Delegated!")
}

// When someone calls this we are saying, you can use my votes however you want, thats what delegate does
// numCheckpoints shows us how many checkpoints that account has, when people do a vote its based on checkpoints
// anytime you transfer a token or delegate a token, a function _moveVotingPower() is called 
// _moveVotingPower()  writes the checkpoints and says at checkpoint X heres how many votes everyone has
// votes arent updated every block, just when the checkpoints get updated
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
    const transactionResponse = await governanceToken.delegate(delegatedAccount)
    await transactionResponse.wait(1)
    console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}

export default deployGovernanceToken
deployGovernanceToken.tags = ["all", "governor"]
