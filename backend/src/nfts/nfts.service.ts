import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNFTDto, UpdateNFTDto, NFTFilterDto } from './dto';

/**
 * NFT Service
 * Handles all NFT-related business logic
 */
@Injectable()
export class NftsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new NFT record
   */
  async create(dto: CreateNFTDto, ownerId: string) {
    return this.prisma.nFT.create({
      data: {
        ...dto,
        ownerId,
        creatorId: ownerId,
      },
      include: {
        owner: true,
        creator: true,
        collection: true,
      },
    });
  }

  /**
   * Get all NFTs with filtering and pagination
   */
  async findAll(filter: NFTFilterDto) {
    const {
      collectionId,
      ownerId,
      creatorId,
      chainId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = {};
    
    if (collectionId) where.collectionId = collectionId;
    if (ownerId) where.ownerId = ownerId;
    if (creatorId) where.creatorId = creatorId;
    if (chainId) where.chainId = chainId;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.nFT.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: { select: { id: true, address: true, username: true, avatar: true } },
          creator: { select: { id: true, address: true, username: true, avatar: true } },
          collection: { select: { id: true, name: true, slug: true, logo: true } },
          attributes: true,
          _count: { select: { favorites: true, orders: true } },
        },
      }),
      this.prisma.nFT.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single NFT by ID
   */
  async findOne(id: string) {
    const nft = await this.prisma.nFT.findUnique({
      where: { id },
      include: {
        owner: true,
        creator: true,
        collection: true,
        attributes: true,
        orders: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        offers: {
          where: { accepted: false, cancelled: false },
          orderBy: { price: 'desc' },
          take: 10,
          include: { offerer: true },
        },
        transactions: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!nft) {
      throw new NotFoundException(`NFT with ID ${id} not found`);
    }

    return nft;
  }

  /**
   * Get NFT by contract address and token ID
   */
  async findByToken(contractAddress: string, tokenId: string, chainId: number) {
    const nft = await this.prisma.nFT.findUnique({
      where: {
        contractAddress_tokenId_chainId: {
          contractAddress,
          tokenId,
          chainId,
        },
      },
      include: {
        owner: true,
        creator: true,
        collection: true,
        attributes: true,
      },
    });

    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    return nft;
  }

  /**
   * Update NFT metadata
   */
  async update(id: string, dto: UpdateNFTDto, userId: string) {
    const nft = await this.findOne(id);

    // Only owner or creator can update
    if (nft.ownerId !== userId && nft.creatorId !== userId) {
      throw new NotFoundException('Not authorized to update this NFT');
    }

    return this.prisma.nFT.update({
      where: { id },
      data: dto,
      include: {
        owner: true,
        creator: true,
        collection: true,
        attributes: true,
      },
    });
  }

  /**
   * Transfer NFT ownership
   */
  async transfer(id: string, newOwnerId: string) {
    return this.prisma.nFT.update({
      where: { id },
      data: { ownerId: newOwnerId },
    });
  }

  /**
   * Get trending NFTs
   */
  async getTrending(limit = 10) {
    // NFTs with most recent activity
    return this.prisma.nFT.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: true,
        collection: true,
        _count: { select: { favorites: true, orders: true } },
      },
    });
  }

  /**
   * Get NFT price history
   */
  async getPriceHistory(id: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        nftId: id,
        type: { in: ['SALE', 'OFFER_ACCEPTED'] },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        amount: true,
        timestamp: true,
        type: true,
      },
    });

    return transactions.map(tx => ({
      price: tx.amount,
      date: tx.timestamp,
      type: tx.type,
    }));
  }

  /**
   * Add NFT to favorites
   */
  async addToFavorites(nftId: string, userId: string) {
    return this.prisma.favorite.create({
      data: { nftId, userId },
    });
  }

  /**
   * Remove NFT from favorites
   */
  async removeFromFavorites(nftId: string, userId: string) {
    return this.prisma.favorite.delete({
      where: {
        userId_nftId: { userId, nftId },
      },
    });
  }

  /**
   * Get user's favorite NFTs
   */
  async getUserFavorites(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          nft: {
            include: {
              owner: true,
              collection: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    return {
      items: items.map(fav => fav.nft),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
