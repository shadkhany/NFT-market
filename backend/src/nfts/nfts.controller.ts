import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NftsService } from './nfts.service';
import { CreateNFTDto, UpdateNFTDto, NFTFilterDto } from './dto';

@ApiTags('nfts')
@Controller('nfts')
export class NftsController {
  constructor(private nftsService: NftsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all NFTs with filters' })
  async findAll(@Query() filter: NFTFilterDto) {
    return this.nftsService.findAll(filter);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending NFTs' })
  async getTrending(@Query('limit') limit?: number) {
    return this.nftsService.getTrending(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NFT by ID' })
  async findOne(@Param('id') id: string) {
    return this.nftsService.findOne(id);
  }

  @Get(':id/price-history')
  @ApiOperation({ summary: 'Get NFT price history' })
  async getPriceHistory(@Param('id') id: string) {
    return this.nftsService.getPriceHistory(id);
  }

  @Get('contract/:address/token/:tokenId')
  @ApiOperation({ summary: 'Get NFT by contract and token ID' })
  async findByToken(
    @Param('address') address: string,
    @Param('tokenId') tokenId: string,
    @Query('chainId') chainId: number,
  ) {
    return this.nftsService.findByToken(address, tokenId, chainId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create NFT record' })
  async create(@Body() dto: CreateNFTDto, @Request() req) {
    return this.nftsService.create(dto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update NFT metadata' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNFTDto,
    @Request() req,
  ) {
    return this.nftsService.update(id, dto, req.user.id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add NFT to favorites' })
  async addToFavorites(@Param('id') id: string, @Request() req) {
    return this.nftsService.addToFavorites(id, req.user.id);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove NFT from favorites' })
  async removeFromFavorites(@Param('id') id: string, @Request() req) {
    return this.nftsService.removeFromFavorites(id, req.user.id);
  }
}
