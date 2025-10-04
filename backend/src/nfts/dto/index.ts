import { IsString, IsNumber, IsOptional, IsObject, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateNFTDto {
  @ApiProperty()
  @IsString()
  tokenId: string;

  @ApiProperty()
  @IsString()
  contractAddress: string;

  @ApiProperty()
  @IsNumber()
  chainId: number;

  @ApiProperty()
  @IsString()
  tokenStandard: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tokenURI?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiProperty()
  @IsString()
  collectionId: string;
}

export class UpdateNFTDto extends PartialType(CreateNFTDto) {}

export class NFTFilterDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  collectionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  creatorId?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  chainId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ required: false, enum: ['createdAt', 'price', 'name'] })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
