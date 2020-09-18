import { Publisher, Subjects, TicketCreatedEvent } from "@rwtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
