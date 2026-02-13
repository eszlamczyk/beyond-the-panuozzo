import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export type OrderEventType = 'created' | 'updated' | 'finalized';

export interface OrderEvent {
  type: OrderEventType;
  order: unknown;
}

/**
 * Shared event bus for order events.
 *
 * Other services call {@link emit} when an order changes; the SSE controller
 * subscribes via {@link subscribe} to push events to connected clients.
 */
@Injectable()
export class OrderEventsService {
  private readonly subject = new Subject<OrderEvent>();

  /** Pushes an order event to all connected SSE clients. */
  emit(event: OrderEvent): void {
    this.subject.next(event);
  }

  /** Returns an observable stream of order events. */
  subscribe(): Observable<OrderEvent> {
    return this.subject.asObservable();
  }
}
