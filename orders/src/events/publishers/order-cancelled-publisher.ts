import { Publisher, OrderCancelledEvent, Subjects } from "@rwtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
