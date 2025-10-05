import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  findAll() {
    return [];
  }

  findOne(id: string) {
    return { id };
  }

  create(createOrderDto: any) {
    return createOrderDto;
  }
}
