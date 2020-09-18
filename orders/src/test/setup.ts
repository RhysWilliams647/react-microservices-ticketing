import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

//  Required to declare a global function (global.signup)
declare global {
  namespace NodeJS {
    interface Global {
      signup(): string[];
    }
  }
}

global.signup = () => {
  //  Build a JWT payload.  { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  //  Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //  Build session object {jwt: MY_JWT }
  const session = { jwt: token };

  //  Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  //  Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  //  return a string the cookie with the encoded data
  return [`express:sess=${base64}`];
};

//  Use our fake nats wrapper for tests
jest.mock("../nats-wrapper");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  //  Each subsequent call to mock will be remembered
  //  Therefore need to clear out before each test so we can accurately
  //  check how many times a mock was called
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
