// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    // 1 Million
    uint256 public s_maxSupply = 1000000000000000000000000;

    // We want to avoid people buying a ton of tokens and then dumping them after a vote
    // To avoid this, we will create a snapshot of how many tokens people have at a certain block
    // This is why we made this token an ERC20Votes/ERC20Permit, it adds a lot of functionality to make it a better voting token

    constructor() ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {
        _mint(msg.sender, s_maxSupply);
    }

    // The functions below are overrides required by Solidity.

    // Anytime we make a token transfer, we want to make sure we're calling the _afterTokenTransfer of the ERC20Votes
    // This is because we want to make sure the snapshots are updated, so we know how many people have how many tokens at each block/checkpoint
    // Same goes for minting and burning

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}
