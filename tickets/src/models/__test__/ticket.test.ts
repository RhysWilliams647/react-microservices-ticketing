import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  //  Create instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  //  Save the ticket to the db
  await ticket.save();
  //  Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //  Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });
  //  Save the first fetched ticket
  await firstInstance!.save();
  //  Try to save second ticket (should fail as will have outdated version no)
  //   expect(async () => {
  //     await secondInstance!.save();
  //   }).toThrow();
  //  Above should work but fails hence below
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  //  Create instance of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  //  Save the ticket to the db
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
});
