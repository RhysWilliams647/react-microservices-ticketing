import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@rwtickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price } = data;
    //  Imagine three events, created v1, and two updates v2 and v3
    //  v3 comes in before v2, v3 - 1 = v2 but version would still be 1,
    //  hence ticket would not be found and throw error.
    //  This is to handle events coming in from NATS in the incorrect order
    //  Need to look at findByEvent to understand
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) throw new Error("Ticket not found");

    ticket.set({ title, price });
    await ticket.save();
    //  For an event in the incorrect order the acknowledgement will never be called
    //  so event will get sent again after which v2 will have been done and v3
    //  will then succeed
    msg.ack();
  }
}
