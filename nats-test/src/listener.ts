import nats from "node-nats-streaming"; //  Essentially our event bus for passing events between services
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

//  Run listener twice, then we have two listeners in same queue group
//  (orders-service-queue-group)
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    console.log("NATS connection closed");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

//  Watching for interupt signal
process.on("SIGINT", () => stan.close());
//  Watching for terminate signal
process.on("SIGTERM", () => stan.close());
