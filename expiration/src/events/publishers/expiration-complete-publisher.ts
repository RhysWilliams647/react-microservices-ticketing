import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@rwtickets/common";

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
