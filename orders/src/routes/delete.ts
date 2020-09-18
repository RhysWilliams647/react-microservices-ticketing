import express, { Request, Response } from "express";
import {
  NotAuthorisedError,
  NotFoundError,
  requireAuth,
} from "@rwtickets/common";
import { Order, OrderStatus } from "../models/order";

const router = express.Router();

//  Would have made more sense to use a patch command
//  as we don't actually delete the order.
//  Patch is for partial updates, i.e. only updating the status
router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) throw new NotFoundError();

    if (order.userId !== req.currentUser!.id) throw new NotAuthorisedError();

    order.status = OrderStatus.Cancelled;
    await order.save();

    //  Publish an event this was cancelled

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
