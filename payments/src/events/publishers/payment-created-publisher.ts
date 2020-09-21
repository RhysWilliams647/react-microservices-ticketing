import { Subjects, Publisher, PaymentCreatedEvent } from "@rwtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
