// @ts-ignore
import { ethers, network } from "hardhat"
import {
  developmentChains,
  VOTING_DELAY,
  proposalsFile,
  FUNC,
  PROPOSAL_DESCRIPTION,
  NEW_STORE_VALUE,
} from "../helper-hardhat-config"
import * as fs from "fs"
// @ts-ignore
import { moveBlocks } from "../utils/move-blocks"

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
  // Get governor and box contracts
  const governor = await ethers.getContract("GovernorContract")
  const box = await ethers.getContract("Box")
  // Encode our function call and arguments to bytes
  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
  console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
  console.log(`Proposal Description:\n  ${proposalDescription}`)
  const proposeTx = await governor.propose(
    [box.address], // Targets -> These are the contracts we want to call functions on, for us it'll just be the Box
    [0], // Values -> How much ETH we want to send, we wont send anything
    [encodedFunctionCall], // Calldatas -> This is the encoded parameters for the function we want to call
    proposalDescription // Description -> A description
  )
  // If working on a development chain, we will push forward till we get to the voting period.
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1)
  }

  // Grabbing the proposalId from the event propose emits
  const proposeReceipt = await proposeTx.wait(1)
  const proposalId = proposeReceipt.events[0].args.proposalId
  console.log(`Proposed with proposal ID:\n  ${proposalId}`)

  const proposalState = await governor.state(proposalId)
  const proposalSnapShot = await governor.proposalSnapshot(proposalId)
  const proposalDeadline = await governor.proposalDeadline(proposalId)

  // save the proposalId to proposal.json, this is so our other scripts know what the proposalId is
  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  proposals[network.config.chainId!.toString()].push(proposalId.toString())
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

  // The state of the proposal. 1 is not passed. 0 is passed.
  console.log(`Current Proposal State: ${proposalState}`)
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

// 77, store, "Proposal #1 77 in the Box!"
// This calls the -> export async function propose(),  above
propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })