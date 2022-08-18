import * as fs from "fs"
// @ts-ignore
import { network, ethers } from "hardhat"
import { proposalsFile, developmentChains, VOTING_PERIOD } from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"

// First index in our proposals.json
const index = 0

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  // You could swap this out for the ID you want to use too
  const proposalId = proposals[network.config.chainId!][proposalIndex]
  // 0 = Against, 1 = For, 2 = Abstain for this example
  // Yes we want to change the box to 77 because our reason
  const voteWay = 1
  const reason = "I lika do da cha cha"
  await vote(proposalId, voteWay, reason)
}

// 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(proposalId: string, voteWay: number, reason: string) {
  console.log("Voting...")
  const governor = await ethers.getContract("GovernorContract")
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  const voteTxReceipt = await voteTx.wait(1)
  console.log(voteTxReceipt.events[0].args.reason)
  // Checking the proposal state, executed, canceled, pending, active, defeated, succeeded
  // You are looking for quorumReached and voteSucceeded, if both of those are true then the ProposalState.Succeeded
  // Should give a 4 for Succeeded
  const proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1)
  }
  console.log("Voted! Ready to go!")
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })