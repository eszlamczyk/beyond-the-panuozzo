import { Controller, Sse, UseGuards } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { OrderEventsService } from './order-events.service';

interface SseMessageEvent {
  data: string;
}

/**
 * SSE endpoint that streams order events to authenticated clients.
 *
 * Clients connect with `Authorization: Bearer <jwt>` and receive a
 * continuous stream of `OrderEvent` objects as SSE messages.
 */
@Controller('orders')
export class OrderEventsController {
  constructor(private readonly orderEventsService: OrderEventsService) {}

  @Sse('events')
  @UseGuards(JwtAuthenticationGuard)
  events(): Observable<SseMessageEvent> {
    return this.orderEventsService.subscribe().pipe(
      map((event) => ({
        data: JSON.stringify(event),
      })),
    );
  }
}
