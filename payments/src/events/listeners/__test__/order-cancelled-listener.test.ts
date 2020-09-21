import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/order";
import { OrderCancelledEvent, OrderStatus } from "@rwtickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  //  Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  //  Crete and save a ticket
  const userId = "asdf";
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    price: 20,
    userId: userId,
  });

  await order.save();

  //  Create the fake data event
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
  };

  //  Create fake msg object
  //  @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it("updates the status of the order", async () => {
  const { msg, data, order, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
