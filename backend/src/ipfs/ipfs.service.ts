import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpfsService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File) {
    // IPFS upload implementation
    // For now, return mock CID
    return {
      cid: 'Qm...',
      url: `https://gateway.pinata.cloud/ipfs/Qm...`,
    };
  }

  async uploadJSON(metadata: any) {
    // Upload JSON metadata to IPFS
    return {
      cid: 'Qm...',
      url: `https://gateway.pinata.cloud/ipfs/Qm...`,
    };
  }
}
