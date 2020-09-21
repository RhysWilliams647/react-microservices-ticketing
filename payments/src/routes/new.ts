import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorisedError,
  OrderStatus,
} from "@rwtickets/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorisedError();

    if (order.status === OrderStatus.Cancelled)
      throw new BadRequestError("Cannot pay for a cancelled order");

    const stripeResponse = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100, //  Have to convert to cents or lowest denominator
      source: token,
    });

    const payment = Payment.build({
      orderId,
      stripeId: stripeResponse.id,
    });
    await payment.save();
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: stripeResponse.id,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
