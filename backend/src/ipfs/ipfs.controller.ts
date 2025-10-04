import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IpfsService } from './ipfs.service';

@ApiTags('ipfs')
@Controller('ipfs')
export class IpfsController {
  constructor(private ipfsService: IpfsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload file to IPFS' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const cid = await this.ipfsService.pinFile(file);
    return {
      cid,
      url: this.ipfsService.getGatewayUrl(cid),
    };
  }

  @Post('upload-json')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload JSON metadata to IPFS' })
  async uploadJson(@Body() data: any) {
    const cid = await this.ipfsService.pinJSON(data);
    return {
      cid,
      url: this.ipfsService.getGatewayUrl(cid),
    };
  }
}
