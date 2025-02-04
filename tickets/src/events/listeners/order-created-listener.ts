import { Listener, OrderCreatedEvent, Subjects } from "@rwtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //  Find the ticket for the order
    const ticket = await Ticket.findById(data.ticket.id);
    //  If no ticket throw error
    if (!ticket) throw new Error("Ticket not found");
    //  Mark the ticket as reserved (set order id on ticket)
    ticket.set({ orderId: data.id });
    //  Save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });
    //  ack the message
    msg.ack();
  }
}
