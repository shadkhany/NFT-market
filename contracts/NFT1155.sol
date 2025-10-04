// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title NFT1155
 * @notice ERC-1155 multi-token contract with royalty support (ERC-2981)
 * @dev Supports batch operations, supply tracking, and per-token royalties
 * Features:
 * - Multiple token types in one contract
 * - Batch minting and transfers for gas efficiency
 * - Per-token supply limits
 * - ERC-2981 royalty standard
 * - Pausable for emergency stops
 */
contract NFT1155 is
    ERC1155,
    ERC1155Supply,
    ERC2981,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Token name
    string public name;
    
    // Token symbol
    string public symbol;

    // Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) public creators;
    
    // Mapping from token ID to maximum supply (0 = unlimited)
    mapping(uint256 => uint256) public maxSupply;
    
    // Mapping from token ID to mint price
    mapping(uint256 => uint256) public mintPrices;

    // Events
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 initialSupply,
        uint256 maxSupply,
        string uri
    );
    event TokenMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 amount
    );
    event TokenURIUpdated(uint256 indexed tokenId, string newURI);
    event RoyaltyUpdated(
        uint256 indexed tokenId,
        address indexed receiver,
        uint96 feeNumerator
    );

    /**
     * @notice Contract constructor
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param baseURI_ Base URI for token metadata
     * @param defaultRoyaltyReceiver_ Default royalty receiver
     * @param defaultRoyaltyFeeNumerator_ Default royalty fee in basis points
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address defaultRoyaltyReceiver_,
        uint96 defaultRoyaltyFeeNumerator_
    ) ERC1155(baseURI_) Ownable(msg.sender) {
        name = name_;
        symbol = symbol_;
        _setDefaultRoyalty(defaultRoyaltyReceiver_, defaultRoyaltyFeeNumerator_);
    }

    /**
     * @notice Create a new token type
     * @param initialSupply Initial supply to mint
     * @param maxSupply_ Maximum supply for this token (0 = unlimited)
     * @param tokenURI_ Metadata URI for this token
     * @param mintPrice_ Mint price in wei
     * @param royaltyReceiver_ Royalty receiver for this token
     * @param royaltyFeeNumerator_ Royalty fee in basis points
     * @return tokenId The ID of the newly created token
     */
    function create(
        uint256 initialSupply,
        uint256 maxSupply_,
        string memory tokenURI_,
        uint256 mintPrice_,
        address royaltyReceiver_,
        uint96 royaltyFeeNumerator_
    ) external whenNotPaused nonReentrant returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        creators[tokenId] = msg.sender;
        maxSupply[tokenId] = maxSupply_;
        _tokenURIs[tokenId] = tokenURI_;
        mintPrices[tokenId] = mintPrice_;

        if (initialSupply > 0) {
            require(
                maxSupply_ == 0 || initialSupply <= maxSupply_,
                "Initial supply exceeds max supply"
            );
            _mint(msg.sender, tokenId, initialSupply, "");
        }

        // Set per-token royalty
        _setTokenRoyalty(tokenId, royaltyReceiver_, royaltyFeeNumerator_);

        emit TokenCreated(tokenId, msg.sender, initialSupply, maxSupply_, tokenURI_);
        emit RoyaltyUpdated(tokenId, royaltyReceiver_, royaltyFeeNumerator_);

        return tokenId;
    }

    /**
     * @notice Mint additional tokens of an existing type
     * @param to Address to receive tokens
     * @param tokenId Token ID to mint
     * @param amount Amount to mint
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) external payable whenNotPaused nonReentrant {
        require(exists(tokenId), "Token does not exist");
        require(
            msg.sender == owner() || msg.sender == creators[tokenId],
            "Not authorized"
        );
        require(msg.value >= mintPrices[tokenId] * amount, "Insufficient payment");

        uint256 supply = maxSupply[tokenId];
        if (supply > 0) {
            require(
                totalSupply(tokenId) + amount <= supply,
                "Would exceed max supply"
            );
        }

        _mint(to, tokenId, amount, "");
        emit TokenMinted(tokenId, to, amount);

        // Refund excess payment
        uint256 cost = mintPrices[tokenId] * amount;
        if (msg.value > cost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - cost}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Batch mint multiple token types
     * @param to Address to receive tokens
     * @param tokenIds Array of token IDs
     * @param amounts Array of amounts for each token ID
     */
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external payable whenNotPaused nonReentrant {
        require(tokenIds.length == amounts.length, "Length mismatch");
        
        uint256 totalCost = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(exists(tokenId), "Token does not exist");
            require(
                msg.sender == owner() || msg.sender == creators[tokenId],
                "Not authorized"
            );

            uint256 supply = maxSupply[tokenId];
            if (supply > 0) {
                require(
                    totalSupply(tokenId) + amounts[i] <= supply,
                    "Would exceed max supply"
                );
            }

            totalCost += mintPrices[tokenId] * amounts[i];
        }

        require(msg.value >= totalCost, "Insufficient payment");

        _mintBatch(to, tokenIds, amounts, "");

        // Refund excess
        if (msg.value > totalCost) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalCost}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Burn tokens
     * @param account Address to burn from
     * @param tokenId Token ID to burn
     * @param amount Amount to burn
     */
    function burn(
        address account,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(
            account == msg.sender || isApprovedForAll(account, msg.sender),
            "Not authorized"
        );
        _burn(account, tokenId, amount);
    }

    /**
     * @notice Burn batch of tokens
     * @param account Address to burn from
     * @param tokenIds Array of token IDs
     * @param amounts Array of amounts
     */
    function burnBatch(
        address account,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) external {
        require(
            account == msg.sender || isApprovedForAll(account, msg.sender),
            "Not authorized"
        );
        _burnBatch(account, tokenIds, amounts);
    }

    /**
     * @notice Update URI for a token
     * @param tokenId Token ID
     * @param newURI New metadata URI
     */
    function setTokenURI(uint256 tokenId, string memory newURI) external {
        require(exists(tokenId), "Token does not exist");
        require(
            msg.sender == owner() || msg.sender == creators[tokenId],
            "Not authorized"
        );
        _tokenURIs[tokenId] = newURI;
        emit TokenURIUpdated(tokenId, newURI);
    }

    /**
     * @notice Set royalty for a specific token
     * @param tokenId Token ID
     * @param receiver Royalty receiver
     * @param feeNumerator Fee in basis points
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external {
        require(exists(tokenId), "Token does not exist");
        require(
            msg.sender == owner() || msg.sender == creators[tokenId],
            "Not authorized"
        );
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit RoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /**
     * @notice Set default royalty for all tokens
     * @param receiver Royalty receiver
     * @param feeNumerator Fee in basis points
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @notice Update mint price for a token
     * @param tokenId Token ID
     * @param newPrice New mint price in wei
     */
    function setMintPrice(uint256 tokenId, uint256 newPrice) external {
        require(exists(tokenId), "Token does not exist");
        require(
            msg.sender == owner() || msg.sender == creators[tokenId],
            "Not authorized"
        );
        mintPrices[tokenId] = newPrice;
    }

    /**
     * @notice Pause all token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw contract balance
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Get URI for a token
     * @param tokenId Token ID
     * @return Token metadata URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    /**
     * @notice Check if token exists
     * @param tokenId Token ID to check
     * @return True if token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return bytes(_tokenURIs[tokenId]).length > 0;
    }

    /**
     * @notice Get next token ID
     */
    function getNextTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Required overrides

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
