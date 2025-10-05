import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { address: string; signature: string }) {
    return this.authService.login(body.address, body.signature);
  }

  @Post('nonce')
  @HttpCode(HttpStatus.OK)
  async getNonce(@Body() body: { address: string }) {
    return this.authService.getNonce(body.address);
  }
}
