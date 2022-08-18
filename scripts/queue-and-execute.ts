import {
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
  developmentChains,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
// @ts-ignore
import { moveTime } from "../utils/move-time"
// @ts-ignore
import { ethers, network } from "hardhat"

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE]
  const functionToCall = FUNC
  const box = await ethers.getContract("Box")
  // Encode the function like in the proposal
  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
  // We need to hash our description, in propose it gets hashed on chain and the hashed version is what our queue and execute will be looking for
  const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
  // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

  const governor = await ethers.getContract("GovernorContract")
  console.log("Queueing...")
  // Call the queue function, pass in the same values as the proposal, but using the descriptionHash, and queue it
  const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
  await queueTx.wait(1)

  // Remember in our TimeLock we have the minDelay.
  // Once something get's queued up we can't just execute right away, we have to give people time to get out
  // We have to move time because minDelay is looking for time. So we're going to speed up time on our local chain and move blocks
  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log("Executing...")
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  )
  await executeTx.wait(1)
  // Check if the governance updated our box contract
  console.log(`Box value: ${await box.retrieve()}`)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })