import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as MarketplaceABI from '../../../artifacts/contracts/Marketplace.sol/Marketplace.json';
import * as NFT721ABI from '../../../artifacts/contracts/NFT721.sol/NFT721.json';
import * as NFT1155ABI from '../../../artifacts/contracts/NFT1155.sol/NFT1155.json';

/**
 * Blockchain Service
 * Handles all blockchain interactions via ethers.js
 * Monitors contract events and provides read/write operations
 */
@Injectable()
export class BlockchainService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private marketplaceContract: ethers.Contract;
  private nft721Contract: ethers.Contract;
  private nft1155Contract: ethers.Contract;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const rpcUrl = this.config.get('MAINNET_RPC_URL');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize contract instances
    const marketplaceAddress = this.config.get('MARKETPLACE_ADDRESS');
    const nft721Address = this.config.get('NFT_721_ADDRESS');
    const nft1155Address = this.config.get('NFT_1155_ADDRESS');

    this.marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      MarketplaceABI.abi,
      this.provider,
    );

    this.nft721Contract = new ethers.Contract(
      nft721Address,
      NFT721ABI.abi,
      this.provider,
    );

    this.nft1155Contract = new ethers.Contract(
      nft1155Address,
      NFT1155ABI.abi,
      this.provider,
    );

    // Start event listeners
    this.startEventListeners();
  }

  /**
   * Listen to marketplace events
   */
  private startEventListeners() {
    // ItemListed event
    this.marketplaceContract.on(
      'ItemListed',
      async (listingId, seller, nftContract, tokenId, amount, price, listingType) => {
        console.log('ItemListed:', {
          listingId: listingId.toString(),
          seller,
          nftContract,
          tokenId: tokenId.toString(),
          amount: amount.toString(),
          price: ethers.formatEther(price),
          listingType: listingType === 0 ? 'FixedPrice' : 'Auction',
        });
        // Handle in database via queue
      },
    );

    // ItemSold event
    this.marketplaceContract.on(
      'ItemSold',
      async (listingId, buyer, seller, price, platformFee, royaltyFee) => {
        console.log('ItemSold:', {
          listingId: listingId.toString(),
          buyer,
          seller,
          price: ethers.formatEther(price),
          platformFee: ethers.formatEther(platformFee),
          royaltyFee: ethers.formatEther(royaltyFee),
        });
      },
    );

    // BidPlaced event
    this.marketplaceContract.on('BidPlaced', async (listingId, bidder, amount) => {
      console.log('BidPlaced:', {
        listingId: listingId.toString(),
        bidder,
        amount: ethers.formatEther(amount),
      });
    });

    // OfferMade event
    this.marketplaceContract.on(
      'OfferMade',
      async (offerId, offerer, nftContract, tokenId, price) => {
        console.log('OfferMade:', {
          offerId: offerId.toString(),
          offerer,
          nftContract,
          tokenId: tokenId.toString(),
          price: ethers.formatEther(price),
        });
      },
    );
  }

  /**
   * Get listing details from blockchain
   */
  async getListing(listingId: number) {
    const listing = await this.marketplaceContract.listings(listingId);
    return {
      seller: listing.seller,
      nftContract: listing.nftContract,
      tokenId: listing.tokenId.toString(),
      amount: listing.amount.toString(),
      price: ethers.formatEther(listing.price),
      active: listing.active,
      listingType: listing.listingType === 0 ? 'FixedPrice' : 'Auction',
    };
  }

  /**
   * Get NFT metadata from contract
   */
  async getNFT721Metadata(tokenId: number) {
    try {
      const tokenURI = await this.nft721Contract.tokenURI(tokenId);
      const owner = await this.nft721Contract.ownerOf(tokenId);
      return { tokenURI, owner };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Verify if address is a contract
   */
  async isContract(address: string): Promise<boolean> {
    const code = await this.provider.getCode(address);
    return code !== '0x';
  }

  /**
   * Get ETH balance
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return await this.provider.estimateGas(tx);
  }
}
