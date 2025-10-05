import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendNotification(userId: string, message: string) {
    // Notification implementation
    console.log(`Notification for ${userId}: ${message}`);
  }
}
