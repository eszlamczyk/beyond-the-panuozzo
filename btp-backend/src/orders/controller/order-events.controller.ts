import { Controller, Sse } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { Authenticated } from '../../auth/authenticated.decorator';
import { OrderEventsService } from '../domain/order-events.service';
import { OrderResponseDto } from './dto/order-response.dto';

interface SseMessageEvent {
  data: string;
}

@Authenticated()
@ApiTags('Orders')
@Controller('orders')
export class OrderEventsController {
  constructor(private readonly orderEventsService: OrderEventsService) {}

  @Sse('events')
  events(): Observable<SseMessageEvent> {
    return this.orderEventsService.subscribe().pipe(
      map((event) => ({
        data: JSON.stringify({
          type: event.type,
          order: OrderResponseDto.fromDomain(event.order),
        }),
      })),
    );
  }
}
