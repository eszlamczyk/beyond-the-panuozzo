import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import type { OrderModel } from './order.model';

export type OrderEventType = 'created' | 'updated' | 'deleted';

export interface OrderEvent {
  type: OrderEventType;
  order: OrderModel;
}

@Injectable()
export class OrderEventsService {
  private readonly subject = new Subject<OrderEvent>();

  emit(event: OrderEvent): void {
    this.subject.next(event);
  }

  subscribe(): Observable<OrderEvent> {
    return this.subject.asObservable();
  }
}
