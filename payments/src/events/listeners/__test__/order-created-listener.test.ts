import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from "../../../models/order";
import { OrderCreatedEvent, OrderStatus } from "@rwtickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  //  Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //  Create the fake data event
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "asdf",
    expiresAt: "asdf",
    ticket: {
      id: "asdf",
      price: 10,
    },
  };

  //  Create fake msg object
  //  @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
