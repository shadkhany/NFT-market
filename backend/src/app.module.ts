import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NftsModule } from './nfts/nfts.module';
import { OrdersModule } from './orders/orders.module';
import { CollectionsModule } from './collections/collections.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NftsModule,
    OrdersModule,
    CollectionsModule,
    IpfsModule,
    BlockchainModule,
    AnalyticsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
