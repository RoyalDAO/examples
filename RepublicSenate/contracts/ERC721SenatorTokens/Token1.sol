// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@royaldao/contracts/Token/ERC721/extensions/ERC721SenatorVotes.sol";
import "@royaldao/contracts/Governance/utils/ISenatorVotes.sol";
import "@royaldao/contracts/Governance/ISenate.sol";

contract Token1 is
    ERC721,
    ERC721Enumerable,
    Pausable,
    Ownable,
    EIP712,
    ERC721SenatorVotes
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(ISenate _senate)
        ERC721("Token1", "TK1")
        EIP712("Token1", "1")
        ERC721SenatorVotes(_senate)
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        if (delegates(to) == address(0)) _delegate(to, to);
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721SenatorVotes) {
        super._afterTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721SenatorVotes)
        returns (bool)
    {
        return
            interfaceId == type(ISenatorVotes).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
