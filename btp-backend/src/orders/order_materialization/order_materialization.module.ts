import { Module } from '@nestjs/common';
import { OrderMaterializationService } from './order_materialization.service';

@Module({
  providers: [OrderMaterializationService],
})
export class OrderMaterializationModule {}
