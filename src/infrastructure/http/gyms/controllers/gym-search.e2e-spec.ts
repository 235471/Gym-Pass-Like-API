import request from "supertest";
import { app } from "@/app";
import { faker } from "@faker-js/faker";
import { prismaTestClient } from "@/shared/test/setup-e2e"; // Import test client
import { Decimal } from "@prisma/client/runtime/library"; // Import Decimal

describe("Search Gyms (E2E)", () => {
  let token: string;

  beforeAll(async () => {
    await app.ready();
    // Create and authenticate user within beforeAll
    const email = faker.internet.email();
    const password = "ValidP@ssw0rd";
    await request(app.server).post("/users").send({
      name: faker.person.fullName(),
      email,
      password,
    });
    const authResponse = await request(app.server).post("/users/auth").send({
      email,
      password,
    });
    token = authResponse.body.accessToken; // Correct property name
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up gyms after each test
    await prismaTestClient.gym.deleteMany();
  })

  it("should be able to search gyms by title", async () => {
    // Use token from beforeAll

    // Create gyms directly using prismaTestClient
    await prismaTestClient.gym.create({
      data: {
        title: "JavaScript Gym",
        description: null,
        phone: null,
        latitude: new Decimal(-27.2092052), // Use Decimal
        longitude: new Decimal(-49.6401091), // Use Decimal
      },
    });

    await prismaTestClient.gym.create({
      data: {
        title: "TypeScript Gym",
        description: null,
        phone: null,
        latitude: new Decimal(-27.0092052), // Use Decimal
        longitude: new Decimal(-49.0001091), // Use Decimal
      },
    });

    // Search for gyms containing "Script"
    const response = await request(app.server)
      .get("/gyms/search")
      .query({ query: "Script" }) // Use query instead of title
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(2);
    // Use expect.arrayContaining for order-independent check
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "JavaScript Gym" }),
        expect.objectContaining({ title: "TypeScript Gym" }),
      ])
    );
  });

  it("should be able to search gyms by title and paginate", async () => {
    // Use token from beforeAll

    // Create multiple gyms directly using prismaTestClient
    for (let i = 1; i <= 22; i++) {
      await prismaTestClient.gym.create({
        data: {
          title: `JavaScript Gym ${i}`,
          description: null,
          phone: null,
          latitude: new Decimal(-27.2092052), // Use Decimal
          longitude: new Decimal(-49.6401091), // Use Decimal
        },
      });
    }

    // Search page 2
    const response = await request(app.server)
      .get("/gyms/search")
      .query({ query: "JavaScript", page: 2})
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Array);

    // Expect exactly 2 results on page 2
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
      expect.objectContaining({ title: expect.stringContaining("JavaScript") }),
      expect.objectContaining({ title: expect.stringContaining("JavaScript") }),
      ])
    );
  });
});
