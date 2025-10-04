// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title Marketplace
 * @notice Comprehensive NFT marketplace supporting ERC-721 and ERC-1155
 * @dev Features:
 * - Fixed-price listings
 * - English auctions with bidding
 * - Make offers on any NFT
 * - Lazy minting with signature verification
 * - Platform fees and royalty support (ERC-2981)
 * - Escrow system for safe trades
 * - Pausable and access controlled
 * - Reentrancy protection
 */
contract Marketplace is
    ERC721Holder,
    ERC1155Holder,
    ReentrancyGuard,
    Pausable,
    AccessControl,
    EIP712
{
    using ECDSA for bytes32;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Token types
    enum TokenType {
        ERC721,
        ERC1155
    }

    // Listing types
    enum ListingType {
        FixedPrice,
        Auction
    }

    // Listing structure
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 amount; // For ERC1155, always 1 for ERC721
        uint256 price;
        uint256 startTime;
        uint256 endTime; // For auctions
        TokenType tokenType;
        ListingType listingType;
        bool active;
    }

    // Auction bid structure
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    // Offer structure
    struct Offer {
        address offerer;
        address nftContract;
        uint256 tokenId;
        uint256 amount; // For ERC1155
        uint256 price;
        uint256 expiresAt;
        bool active;
    }

    // Lazy mint voucher
    struct LazyMintVoucher {
        address nftContract;
        uint256 tokenId;
        uint256 amount; // For ERC1155
        uint256 price;
        string tokenURI;
        address creator;
        uint96 royaltyBps;
        bytes signature;
    }

    // State variables
    uint256 private _listingIdCounter;
    uint256 private _offerIdCounter;
    uint256 public platformFeeBps; // Basis points (e.g., 250 = 2.5%)
    address public feeRecipient;
    uint256 public minAuctionDuration;
    uint256 public maxAuctionDuration;

    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Bid[]) public auctionBids;
    mapping(uint256 => Offer) public offers;
    mapping(bytes => bool) public usedVouchers; // Prevent replay attacks

    // Events
    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        ListingType listingType
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyFee
    );

    event ItemCanceled(uint256 indexed listingId, address indexed seller);

    event BidPlaced(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionSettled(
        uint256 indexed listingId,
        address indexed winner,
        uint256 amount
    );

    event OfferMade(
        uint256 indexed offerId,
        address indexed offerer,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event OfferAccepted(
        uint256 indexed offerId,
        address indexed seller,
        address indexed offerer,
        uint256 price
    );

    event OfferCanceled(uint256 indexed offerId, address indexed offerer);

    event LazyMinted(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    /**
     * @notice Constructor
     * @param platformFeeBps_ Platform fee in basis points
     * @param feeRecipient_ Address to receive platform fees
     */
    constructor(uint256 platformFeeBps_, address feeRecipient_)
        EIP712("NFTMarketplace", "1.0.0")
    {
        require(feeRecipient_ != address(0), "Invalid fee recipient");
        require(platformFeeBps_ <= 1000, "Fee too high"); // Max 10%

        platformFeeBps = platformFeeBps_;
        feeRecipient = feeRecipient_;
        minAuctionDuration = 1 hours;
        maxAuctionDuration = 30 days;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice List an NFT for fixed-price sale
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param amount Amount (for ERC1155)
     * @param price Sale price in wei
     * @param tokenType Token type (ERC721 or ERC1155)
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        TokenType tokenType
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(price > 0, "Price must be > 0");
        require(nftContract != address(0), "Invalid NFT contract");

        // Verify ownership and approval
        if (tokenType == TokenType.ERC721) {
            require(amount == 1, "ERC721 amount must be 1");
            IERC721 nft = IERC721(nftContract);
            require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
            require(
                nft.isApprovedForAll(msg.sender, address(this)) ||
                    nft.getApproved(tokenId) == address(this),
                "Marketplace not approved"
            );
        } else {
            require(amount > 0, "Amount must be > 0");
            IERC1155 nft = IERC1155(nftContract);
            require(
                nft.balanceOf(msg.sender, tokenId) >= amount,
                "Insufficient balance"
            );
            require(
                nft.isApprovedForAll(msg.sender, address(this)),
                "Marketplace not approved"
            );
        }

        uint256 listingId = _listingIdCounter++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: amount,
            price: price,
            startTime: block.timestamp,
            endTime: 0,
            tokenType: tokenType,
            listingType: ListingType.FixedPrice,
            active: true
        });

        emit ItemListed(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            amount,
            price,
            ListingType.FixedPrice
        );

        return listingId;
    }

    /**
     * @notice Create an auction listing
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param amount Amount (for ERC1155)
     * @param startingPrice Starting bid price
     * @param duration Auction duration in seconds
     * @param tokenType Token type
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 startingPrice,
        uint256 duration,
        TokenType tokenType
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(startingPrice > 0, "Price must be > 0");
        require(
            duration >= minAuctionDuration && duration <= maxAuctionDuration,
            "Invalid duration"
        );

        // Verify ownership and approval (same as listItem)
        if (tokenType == TokenType.ERC721) {
            require(amount == 1, "ERC721 amount must be 1");
            IERC721 nft = IERC721(nftContract);
            require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
            require(
                nft.isApprovedForAll(msg.sender, address(this)) ||
                    nft.getApproved(tokenId) == address(this),
                "Marketplace not approved"
            );
        } else {
            require(amount > 0, "Amount must be > 0");
            IERC1155 nft = IERC1155(nftContract);
            require(
                nft.balanceOf(msg.sender, tokenId) >= amount,
                "Insufficient balance"
            );
            require(
                nft.isApprovedForAll(msg.sender, address(this)),
                "Marketplace not approved"
            );
        }

        uint256 listingId = _listingIdCounter++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: amount,
            price: startingPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            tokenType: tokenType,
            listingType: ListingType.Auction,
            active: true
        });

        emit ItemListed(
            listingId,
            msg.sender,
            nftContract,
            tokenId,
            amount,
            startingPrice,
            ListingType.Auction
        );

        return listingId;
    }

    /**
     * @notice Buy a fixed-price listing
     * @param listingId Listing ID
     */
    function buyItem(uint256 listingId)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(
            listing.listingType == ListingType.FixedPrice,
            "Not a fixed-price listing"
        );
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        listing.active = false;

        // Calculate and distribute fees
        (uint256 platformFee, uint256 royaltyFee, address royaltyReceiver) =
            _calculateFees(listing.nftContract, listing.tokenId, listing.price);

        uint256 sellerProceeds = listing.price - platformFee - royaltyFee;

        // Transfer NFT
        _transferNFT(
            listing.tokenType,
            listing.nftContract,
            listing.tokenId,
            listing.amount,
            listing.seller,
            msg.sender
        );

        // Distribute payments
        _safeTransferETH(feeRecipient, platformFee);
        if (royaltyFee > 0) {
            _safeTransferETH(royaltyReceiver, royaltyFee);
        }
        _safeTransferETH(listing.seller, sellerProceeds);

        emit ItemSold(
            listingId,
            msg.sender,
            listing.seller,
            listing.price,
            platformFee,
            royaltyFee
        );

        // Refund excess payment
        if (msg.value > listing.price) {
            _safeTransferETH(msg.sender, msg.value - listing.price);
        }
    }

    /**
     * @notice Place a bid on an auction
     * @param listingId Listing ID
     */
    function placeBid(uint256 listingId)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(block.timestamp < listing.endTime, "Auction ended");
        require(msg.sender != listing.seller, "Cannot bid on own auction");

        Bid[] storage bids = auctionBids[listingId];
        uint256 minBid = listing.price;

        if (bids.length > 0) {
            Bid storage highestBid = bids[bids.length - 1];
            minBid = (highestBid.amount * 105) / 100; // 5% increment
            
            // Refund previous bidder
            _safeTransferETH(highestBid.bidder, highestBid.amount);
        }

        require(msg.value >= minBid, "Bid too low");

        bids.push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit BidPlaced(listingId, msg.sender, msg.value);
    }

    /**
     * @notice Settle an auction (can be called by anyone after auction ends)
     * @param listingId Listing ID
     */
    function settleAuction(uint256 listingId) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(block.timestamp >= listing.endTime, "Auction still active");

        listing.active = false;

        Bid[] storage bids = auctionBids[listingId];
        
        if (bids.length == 0) {
            // No bids, auction failed
            emit AuctionSettled(listingId, address(0), 0);
            return;
        }

        Bid storage winningBid = bids[bids.length - 1];
        uint256 salePrice = winningBid.amount;

        // Calculate and distribute fees
        (uint256 platformFee, uint256 royaltyFee, address royaltyReceiver) =
            _calculateFees(listing.nftContract, listing.tokenId, salePrice);

        uint256 sellerProceeds = salePrice - platformFee - royaltyFee;

        // Transfer NFT to winner
        _transferNFT(
            listing.tokenType,
            listing.nftContract,
            listing.tokenId,
            listing.amount,
            listing.seller,
            winningBid.bidder
        );

        // Distribute payments
        _safeTransferETH(feeRecipient, platformFee);
        if (royaltyFee > 0) {
            _safeTransferETH(royaltyReceiver, royaltyFee);
        }
        _safeTransferETH(listing.seller, sellerProceeds);

        emit AuctionSettled(listingId, winningBid.bidder, salePrice);
        emit ItemSold(
            listingId,
            winningBid.bidder,
            listing.seller,
            salePrice,
            platformFee,
            royaltyFee
        );
    }

    /**
     * @notice Cancel a listing
     * @param listingId Listing ID
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.sender == listing.seller, "Not seller");
        
        if (listing.listingType == ListingType.Auction) {
            Bid[] storage bids = auctionBids[listingId];
            require(bids.length == 0, "Cannot cancel auction with bids");
        }

        listing.active = false;
        emit ItemCanceled(listingId, msg.sender);
    }

    /**
     * @notice Make an offer on any NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param amount Amount (for ERC1155)
     * @param expiresIn Offer duration in seconds
     */
    function makeOffer(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 expiresIn
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(msg.value > 0, "Offer must be > 0");
        require(amount > 0, "Amount must be > 0");
        require(expiresIn > 0, "Invalid expiration");

        uint256 offerId = _offerIdCounter++;

        offers[offerId] = Offer({
            offerer: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            amount: amount,
            price: msg.value,
            expiresAt: block.timestamp + expiresIn,
            active: true
        });

        emit OfferMade(offerId, msg.sender, nftContract, tokenId, msg.value);
        return offerId;
    }

    /**
     * @notice Accept an offer
     * @param offerId Offer ID
     * @param tokenType Token type
     */
    function acceptOffer(uint256 offerId, TokenType tokenType)
        external
        whenNotPaused
        nonReentrant
    {
        Offer storage offer = offers[offerId];
        require(offer.active, "Offer not active");
        require(block.timestamp < offer.expiresAt, "Offer expired");
        require(msg.sender != offer.offerer, "Cannot accept own offer");

        // Verify ownership
        if (tokenType == TokenType.ERC721) {
            IERC721 nft = IERC721(offer.nftContract);
            require(nft.ownerOf(offer.tokenId) == msg.sender, "Not token owner");
            require(
                nft.isApprovedForAll(msg.sender, address(this)) ||
                    nft.getApproved(offer.tokenId) == address(this),
                "Marketplace not approved"
            );
        } else {
            IERC1155 nft = IERC1155(offer.nftContract);
            require(
                nft.balanceOf(msg.sender, offer.tokenId) >= offer.amount,
                "Insufficient balance"
            );
            require(
                nft.isApprovedForAll(msg.sender, address(this)),
                "Marketplace not approved"
            );
        }

        offer.active = false;

        // Calculate fees
        (uint256 platformFee, uint256 royaltyFee, address royaltyReceiver) =
            _calculateFees(offer.nftContract, offer.tokenId, offer.price);

        uint256 sellerProceeds = offer.price - platformFee - royaltyFee;

        // Transfer NFT
        _transferNFT(
            tokenType,
            offer.nftContract,
            offer.tokenId,
            offer.amount,
            msg.sender,
            offer.offerer
        );

        // Distribute payments
        _safeTransferETH(feeRecipient, platformFee);
        if (royaltyFee > 0) {
            _safeTransferETH(royaltyReceiver, royaltyFee);
        }
        _safeTransferETH(msg.sender, sellerProceeds);

        emit OfferAccepted(offerId, msg.sender, offer.offerer, offer.price);
    }

    /**
     * @notice Cancel an offer
     * @param offerId Offer ID
     */
    function cancelOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.active, "Offer not active");
        require(msg.sender == offer.offerer, "Not offerer");

        offer.active = false;
        _safeTransferETH(offer.offerer, offer.price);

        emit OfferCanceled(offerId, msg.sender);
    }

    /**
     * @notice Lazy mint and buy NFT with signature
     * @param voucher Lazy mint voucher with signature
     * @param tokenType Token type
     */
    function lazyMintAndBuy(LazyMintVoucher calldata voucher, TokenType tokenType)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        require(msg.value >= voucher.price, "Insufficient payment");
        require(!usedVouchers[voucher.signature], "Voucher already used");

        // Verify signature
        bytes32 digest = _hashVoucher(voucher);
        address signer = digest.recover(voucher.signature);
        require(signer == voucher.creator, "Invalid signature");

        usedVouchers[voucher.signature] = true;

        // Calculate fees
        (uint256 platformFee, uint256 royaltyFee, ) =
            _calculateFees(voucher.nftContract, voucher.tokenId, voucher.price);

        uint256 creatorProceeds = voucher.price - platformFee - royaltyFee;

        // Distribute payments
        _safeTransferETH(feeRecipient, platformFee);
        // Royalty goes to creator for first sale
        _safeTransferETH(voucher.creator, creatorProceeds + royaltyFee);

        emit LazyMinted(
            voucher.nftContract,
            voucher.tokenId,
            msg.sender,
            voucher.price
        );

        // Refund excess
        if (msg.value > voucher.price) {
            _safeTransferETH(msg.sender, msg.value - voucher.price);
        }

        // Note: Actual minting happens off-chain or in NFT contract
        // This is a payment/escrow mechanism for lazy minting
    }

    /**
     * @notice Update platform fee (admin only)
     * @param newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 newFeeBps) external onlyRole(ADMIN_ROLE) {
        require(newFeeBps <= 1000, "Fee too high"); // Max 10%
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    /**
     * @notice Update fee recipient (admin only)
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyRole(ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @notice Pause marketplace
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause marketplace
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Internal functions

    function _transferNFT(
        TokenType tokenType,
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        address from,
        address to
    ) internal {
        if (tokenType == TokenType.ERC721) {
            IERC721(nftContract).safeTransferFrom(from, to, tokenId);
        } else {
            IERC1155(nftContract).safeTransferFrom(
                from,
                to,
                tokenId,
                amount,
                ""
            );
        }
    }

    function _calculateFees(
        address nftContract,
        uint256 tokenId,
        uint256 salePrice
    )
        internal
        view
        returns (
            uint256 platformFee,
            uint256 royaltyFee,
            address royaltyReceiver
        )
    {
        // Platform fee
        platformFee = (salePrice * platformFeeBps) / 10000;

        // Try to get royalty info (ERC2981)
        try IERC2981(nftContract).royaltyInfo(tokenId, salePrice) returns (
            address receiver,
            uint256 royaltyAmount
        ) {
            royaltyReceiver = receiver;
            royaltyFee = royaltyAmount;
        } catch {
            // No royalty support
            royaltyFee = 0;
            royaltyReceiver = address(0);
        }
    }

    function _safeTransferETH(address to, uint256 amount) internal {
        if (amount > 0) {
            (bool success, ) = payable(to).call{value: amount}("");
            require(success, "ETH transfer failed");
        }
    }

    function _hashVoucher(LazyMintVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "LazyMintVoucher(address nftContract,uint256 tokenId,uint256 amount,uint256 price,string tokenURI,address creator,uint96 royaltyBps)"
                        ),
                        voucher.nftContract,
                        voucher.tokenId,
                        voucher.amount,
                        voucher.price,
                        keccak256(bytes(voucher.tokenURI)),
                        voucher.creator,
                        voucher.royaltyBps
                    )
                )
            );
    }

    // View functions

    function getAuctionBids(uint256 listingId)
        external
        view
        returns (Bid[] memory)
    {
        return auctionBids[listingId];
    }

    function getHighestBid(uint256 listingId)
        external
        view
        returns (address bidder, uint256 amount)
    {
        Bid[] storage bids = auctionBids[listingId];
        if (bids.length == 0) {
            return (address(0), 0);
        }
        Bid storage highestBid = bids[bids.length - 1];
        return (highestBid.bidder, highestBid.amount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
