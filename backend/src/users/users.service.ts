import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';

/**
 * Users Service
 * Handles user profile management and queries
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ownedNFTs: true,
            createdNFTs: true,
            collections: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by wallet address
   */
  async findByAddress(address: string) {
    const user = await this.prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        _count: {
          select: {
            ownedNFTs: true,
            createdNFTs: true,
            collections: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Get user's NFTs
   */
  async getUserNFTs(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.nFT.findMany({
        where: { ownerId: userId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          collection: true,
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.nFT.count({ where: { ownerId: userId } }),
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
   * Get user's created NFTs
   */
  async getUserCreations(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.nFT.findMany({
        where: { creatorId: userId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          collection: true,
          owner: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.nFT.count({ where: { creatorId: userId } }),
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
   * Get user's activity
   */
  async getUserActivity(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          nft: {
            include: {
              collection: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.transaction.count({ where: { userId } }),
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
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [nftsOwned, nftsCreated, totalSales, totalPurchases, collections] =
      await Promise.all([
        this.prisma.nFT.count({ where: { ownerId: userId } }),
        this.prisma.nFT.count({ where: { creatorId: userId } }),
        this.prisma.transaction.count({
          where: { userId, type: 'SALE', from: userId },
        }),
        this.prisma.transaction.count({
          where: { userId, type: 'SALE', to: userId },
        }),
        this.prisma.collection.count({ where: { ownerId: userId } }),
      ]);

    return {
      nftsOwned,
      nftsCreated,
      totalSales,
      totalPurchases,
      collections,
    };
  }
}
