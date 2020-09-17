import request from "supertest";
import { app } from "../../app";

const createTicket = (ticket: { title: string, price: number }) => {
    return request(app)
        .post("/api/tickets")
        .set("Cookie", global.signup())
        .send({
            title: ticket.title,
            price: ticket.price
        });
}

it('can fetch a list of tickets', async () => {
    await createTicket({ title: "asdf1", price: 20 });
    await createTicket({ title: "asdf2", price: 20 });
    await createTicket({ title: "asdf3", price: 20 });

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
})