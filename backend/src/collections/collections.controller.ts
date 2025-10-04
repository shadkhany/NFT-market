import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all collections' })
  async findAll(@Query() filters: any) {
    return this.collectionsService.findAll(filters);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get collection by ID or slug' })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.collectionsService.findOne(idOrSlug);
  }

  @Get(':idOrSlug/nfts')
  @ApiOperation({ summary: 'Get collection NFTs' })
  async getCollectionNFTs(
    @Param('idOrSlug') idOrSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.collectionsService.getCollectionNFTs(idOrSlug, page, limit);
  }

  @Get(':idOrSlug/stats')
  @ApiOperation({ summary: 'Get collection statistics' })
  async getStats(@Param('idOrSlug') idOrSlug: string) {
    return this.collectionsService.getStats(idOrSlug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection' })
  async create(@Body() dto: CreateCollectionDto, @Request() req) {
    return this.collectionsService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @Request() req,
  ) {
    return this.collectionsService.update(id, dto, req.user.id);
  }
}
