import { Subjects, Listener, PaymentCreatedEvent } from "@rwtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw new Error("order not found");

    order.set({ status: OrderStatus.Complete });
    await order.save();

    //  Note we should really publish an event of order updated when updatng
    //  the order so no other listeners miss an update event, if there is possibly
    //  further updates to happen in the future (some complaint which means payment has to be reversed??)
    //  In this case since payment is the final step we are skipping this step

    msg.ack();
  }
}
