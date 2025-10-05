import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { VerifySignatureDto } from './dto';

/**
 * Authentication Service
 * Handles wallet-based authentication using signature verification
 * Implements nonce-based challenge-response pattern
 */
@Injectable()
export class AuthService {
  private nonces = new Map<string, { nonce: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  /**
   * Generate a nonce for wallet address
   * Nonce expires after 5 minutes
   */
  async getNonce(address: string): Promise<{ nonce: string }> {
    const normalizedAddress = ethers.getAddress(address);
    const nonce = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.nonces.set(normalizedAddress, { nonce, expiresAt });

    // Clean up expired nonces
    setTimeout(() => this.nonces.delete(normalizedAddress), 5 * 60 * 1000);

    return { nonce };
  }

  /**
   * Login/Verify signature - alias for verifySignature
   */
  async login(address: string, signature: string) {
    return this.verifySignature({ address, signature });
  }

  /**
   * Verify signature and authenticate user
   * Creates user if doesn't exist
   */
  async verifySignature(dto: VerifySignatureDto) {
    const normalizedAddress = ethers.getAddress(dto.address);

    // Get and validate nonce
    const nonceData = this.nonces.get(normalizedAddress);
    if (!nonceData) {
      throw new UnauthorizedException('Nonce not found or expired');
    }

    if (Date.now() > nonceData.expiresAt) {
      this.nonces.delete(normalizedAddress);
      throw new UnauthorizedException('Nonce expired');
    }

    // Verify signature
    const message = `Sign this message to authenticate: ${nonceData.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, dto.signature);

    if (recoveredAddress.toLowerCase() !== normalizedAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Delete used nonce
    this.nonces.delete(normalizedAddress);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { address: normalizedAddress },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { address: normalizedAddress },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.address);

    return {
      user: {
        id: user.id,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        verified: user.verified,
      },
      ...tokens,
    };
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(userId: string, address: string) {
    const payload = { sub: userId, address };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
