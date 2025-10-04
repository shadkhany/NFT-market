import { IsString, IsEthereumAddress } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetNonceDto {
  @ApiProperty({ description: 'Ethereum wallet address' })
  @IsEthereumAddress()
  address: string;
}

export class VerifySignatureDto {
  @ApiProperty({ description: 'Ethereum wallet address' })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({ description: 'Signed message signature' })
  @IsString()
  signature: string;
}
