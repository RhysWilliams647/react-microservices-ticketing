import { Publisher, Subjects, TicketUpdatedEvent } from "@rwtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
