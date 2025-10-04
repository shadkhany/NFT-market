import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';

/**
 * Collections Service
 * Manages NFT collection operations
 */
@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new collection
   */
  async create(dto: CreateCollectionDto, ownerId: string) {
    // Generate slug from name
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return this.prisma.collection.create({
      data: {
        ...dto,
        slug,
        ownerId,
      },
    });
  }

  /**
   * Get all collections with filters
   */
  async findAll(filters: any = {}) {
    const { page = 1, limit = 20, verified, sortBy = 'totalVolume', sortOrder = 'desc' } = filters;

    const where: any = {};
    if (verified !== undefined) where.verified = verified;

    const [items, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: { select: { id: true, address: true, username: true, avatar: true } },
          _count: { select: { nfts: true } },
        },
      }),
      this.prisma.collection.count({ where }),
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
   * Get collection by ID or slug
   */
  async findOne(idOrSlug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        owner: true,
        _count: { select: { nfts: true } },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  /**
   * Update collection
   */
  async update(id: string, dto: UpdateCollectionDto, userId: string) {
    const collection = await this.findOne(id);

    if (collection.ownerId !== userId) {
      throw new NotFoundException('Not authorized');
    }

    return this.prisma.collection.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Get collection NFTs
   */
  async getCollectionNFTs(idOrSlug: string, page = 1, limit = 20) {
    const collection = await this.findOne(idOrSlug);

    const [items, total] = await Promise.all([
      this.prisma.nFT.findMany({
        where: { collectionId: collection.id },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: true,
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.nFT.count({ where: { collectionId: collection.id } }),
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
   * Get collection statistics
   */
  async getStats(idOrSlug: string) {
    const collection = await this.findOne(idOrSlug);

    const [totalItems, owners, sales] = await Promise.all([
      this.prisma.nFT.count({ where: { collectionId: collection.id } }),
      this.prisma.nFT.findMany({
        where: { collectionId: collection.id },
        select: { ownerId: true },
        distinct: ['ownerId'],
      }),
      this.prisma.transaction.findMany({
        where: {
          nft: { collectionId: collection.id },
          type: 'SALE',
        },
      }),
    ]);

    const totalVolume = sales.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const avgSalePrice = sales.length > 0 ? totalVolume / sales.length : 0;

    return {
      totalItems,
      totalOwners: owners.length,
      totalVolume,
      totalSales: sales.length,
      avgSalePrice,
      floorPrice: collection.floorPrice,
    };
  }
}
