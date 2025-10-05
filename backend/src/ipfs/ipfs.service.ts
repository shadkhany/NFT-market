import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpfsService {
  private readonly gatewayUrl: string;

  constructor(private configService: ConfigService) {
    this.gatewayUrl = 'https://gateway.pinata.cloud/ipfs/';
  }

  /**
   * Pin file to IPFS
   */
  async pinFile(file: Express.Multer.File): Promise<string> {
    // TODO: Implement actual Pinata/IPFS upload when API keys are configured
    // For now, return mock CID
    const mockCid = 'QmExample' + Date.now();
    return mockCid;
  }

  /**
   * Pin JSON to IPFS
   */
  async pinJSON(data: any): Promise<string> {
    // TODO: Implement actual Pinata/IPFS upload when API keys are configured
    // For now, return mock CID
    const mockCid = 'QmJsonExample' + Date.now();
    return mockCid;
  }

  /**
   * Get gateway URL for CID
   */
  getGatewayUrl(cid: string): string {
    return `${this.gatewayUrl}${cid}`;
  }

  /**
   * Upload file (legacy method)
   */
  async uploadFile(file: Express.Multer.File) {
    const cid = await this.pinFile(file);
    return {
      cid,
      url: this.getGatewayUrl(cid),
    };
  }

  /**
   * Upload JSON metadata (legacy method)
   */
  async uploadJSON(metadata: any) {
    const cid = await this.pinJSON(metadata);
    return {
      cid,
      url: this.getGatewayUrl(cid),
    };
  }
}
