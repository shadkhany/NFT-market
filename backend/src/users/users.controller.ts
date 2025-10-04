import { Controller, Get, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getCurrentUser(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get user by wallet address' })
  async getByAddress(@Param('address') address: string) {
    return this.usersService.findByAddress(address);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Get(':address/nfts')
  @ApiOperation({ summary: 'Get user owned NFTs' })
  async getUserNFTs(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user = await this.usersService.findByAddress(address);
    return this.usersService.getUserNFTs(user.id, page, limit);
  }

  @Get(':address/created')
  @ApiOperation({ summary: 'Get user created NFTs' })
  async getUserCreations(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user = await this.usersService.findByAddress(address);
    return this.usersService.getUserCreations(user.id, page, limit);
  }

  @Get(':address/activity')
  @ApiOperation({ summary: 'Get user activity' })
  async getUserActivity(
    @Param('address') address: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const user = await this.usersService.findByAddress(address);
    return this.usersService.getUserActivity(user.id, page, limit);
  }

  @Get(':address/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(@Param('address') address: string) {
    const user = await this.usersService.findByAddress(address);
    return this.usersService.getUserStats(user.id);
  }
}
