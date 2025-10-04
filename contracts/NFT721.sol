// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title NFT721
 * @notice ERC-721 NFT contract with enumerable, URI storage, and ERC-2981 royalty support
 * @dev Implements minting, batch minting, royalties, and pausable functionality
 * Features:
 * - Standard ERC-721 with metadata
 * - ERC-2981 royalty standard
 * - Batch minting for gas optimization
 * - Pausable for emergency stops
 * - Access control for minting
 */
contract NFT721 is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    ERC2981,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Maximum supply limit (0 = unlimited)
    uint256 public maxSupply;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Mint price in wei
    uint256 public mintPrice;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) public creators;
    
    // Whether public minting is enabled
    bool public publicMintEnabled;
    
    // Events
    event TokenMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event BatchMinted(uint256 indexed startTokenId, uint256 count, address indexed to);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);

    /**
     * @notice Contract constructor
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param baseURI_ Base URI for token metadata
     * @param maxSupply_ Maximum supply (0 for unlimited)
     * @param mintPrice_ Mint price in wei
     * @param royaltyReceiver_ Address to receive royalties
     * @param royaltyFeeNumerator_ Royalty fee in basis points (e.g., 250 = 2.5%)
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address royaltyReceiver_,
        uint96 royaltyFeeNumerator_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        publicMintEnabled = false;
        
        // Set default royalty
        _setDefaultRoyalty(royaltyReceiver_, royaltyFeeNumerator_);
    }

    /**
     * @notice Mint a new NFT to the specified address
     * @param to Address to receive the NFT
     * @param uri Token metadata URI
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri)
        external
        payable
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        require(
            msg.sender == owner() || publicMintEnabled,
            "Public minting not enabled"
        );
        require(msg.value >= mintPrice, "Insufficient payment");
        require(
            maxSupply == 0 || _tokenIdCounter.current() < maxSupply,
            "Max supply reached"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        creators[tokenId] = msg.sender;

        emit TokenMinted(tokenId, to, uri);

        // Refund excess payment
        if (msg.value > mintPrice) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - mintPrice}("");
            require(success, "Refund failed");
        }

        return tokenId;
    }

    /**
     * @notice Batch mint multiple NFTs (owner only, gas optimized)
     * @param to Address to receive the NFTs
     * @param uris Array of token metadata URIs
     */
    function batchMint(address to, string[] memory uris)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        uint256 count = uris.length;
        require(count > 0, "Empty batch");
        require(
            maxSupply == 0 || _tokenIdCounter.current() + count <= maxSupply,
            "Batch exceeds max supply"
        );

        uint256 startTokenId = _tokenIdCounter.current();

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uris[i]);
            creators[tokenId] = msg.sender;
        }

        emit BatchMinted(startTokenId, count, to);
    }

    /**
     * @notice Mint NFT to address without payment (owner only)
     * @param to Address to receive the NFT
     * @param uri Token metadata URI
     */
    function ownerMint(address to, string memory uri)
        external
        onlyOwner
        whenNotPaused
        returns (uint256)
    {
        require(
            maxSupply == 0 || _tokenIdCounter.current() < maxSupply,
            "Max supply reached"
        );

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        creators[tokenId] = to;

        emit TokenMinted(tokenId, to, uri);
        return tokenId;
    }

    /**
     * @notice Set royalty information for a specific token
     * @param tokenId Token ID
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty fee in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external {
        require(
            msg.sender == owner() || msg.sender == creators[tokenId],
            "Not authorized"
        );
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    /**
     * @notice Set default royalty for all tokens
     * @param receiver Address to receive royalties
     * @param feeNumerator Royalty fee in basis points
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    /**
     * @notice Update mint price
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @notice Enable or disable public minting
     * @param enabled Whether public minting should be enabled
     */
    function setPublicMintEnabled(bool enabled) external onlyOwner {
        publicMintEnabled = enabled;
    }

    /**
     * @notice Update base URI for token metadata
     * @param baseURI_ New base URI
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
        emit BaseURIUpdated(baseURI_);
    }

    /**
     * @notice Pause contract (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw contract balance to owner
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Get the creator of a token
     * @param tokenId Token ID
     * @return Creator address
     */
    function getCreator(uint256 tokenId) external view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return creators[tokenId];
    }

    /**
     * @notice Get total supply
     */
    function totalSupply() public view override returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Internal functions

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Required overrides for multiple inheritance

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
